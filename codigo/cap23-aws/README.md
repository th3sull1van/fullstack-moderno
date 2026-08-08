# cap23-aws — SkillHub em produção na AWS (Terraform, referência)

Infraestrutura como código do projeto do capítulo 23: o caminho completo
**Route 53 → CloudFront → ALB → ECS Fargate → RDS**, com S3 para mídias e
estáticos e **menor privilégio** (IAM por papel, banco sem IP público).

> ⚠️ Este diretório é a **referência** do capítulo: para aplicar você precisa
> de uma conta AWS com billing ativo. Os valores de custo estão no final —
> o capítulo ensina a controlá-los (budgets, stop/start, tamanho certo).

## O que existe

| Arquivo | O que define |
|---|---|
| `main.tf` | VPC (2 AZs), ECS Fargate (task + service + ALB), RDS PostgreSQL 17 **privado**, S3 privado, CloudFront, Route 53, ACM, IAM |
| `variables.tf` | Região, ambiente, domínio, imagem, senha do banco |
| `outputs.tf` | URL pública, endpoint do banco, bucket |

## Como aplicar

```bash
# 1. Publique a imagem do app no ECR (veja o pipeline do capítulo 18)
docker build -t skillhub:latest .
aws ecr get-login-password | docker login --username AWS --password-stdin <conta>.dkr.ecr.sa-east-1.amazonaws.com
docker tag skillhub:latest <conta>.dkr.ecr.sa-east-1.amazonaws.com/skillhub:latest
docker push <conta>.dkr.ecr.sa-east-1.amazonaws.com/skillhub:latest

# 2. Crie o bucket de remote state e rode
terraform init
terraform plan -var="imagem_app=<conta>.dkr.ecr.sa-east-1.amazonaws.com/skillhub:latest" -var="db_senha=..."
terraform apply -var="imagem_app=..." -var="db_senha=..."
```

## Decisões (o que o capítulo quer que você justifique)

- **Banco sem IP público**: `publicly_accessible = false` + security group
  que só aceita tráfego do SG do app — defesa em profundidade;
- **Menor privilégio**: o papel da tarefa tem acesso **só ao bucket do
  SkillHub** (`Resource = ${bucket}/*`), nunca `s3:*` global;
- **Health check real**: o ALB e o ECS checam `/api/health` — deploy só
  rola quando o app responde (cap. 17: `depends_on` não basta);
- **Multi-AZ + snapshot**: só em `prod` (custo consciente);
- **CloudFront na frente**: cache global + TLS + origem ALB.

## Controle de custos (capítulo 23)

1. **AWS Budgets**: alertas em 50/80/100% do orçamento mensal;
2. **Dev desligado**: `terraform destroy` (ou schedule de stop) fora do
   horário de trabalho;
3. **Tamanho certo**: `db.t4g.micro` e Fargate 256/512 para começar — escale
   com métricas, não por precaução.

## Executável?

O Terraform **não roda sem conta AWS** (por isso este projeto não tem
testes). A validação aqui é estrutural: `terraform fmt -check` e `terraform
validate` (com `terraform init -backend=false`), ambos sem custo.
