# Soluções — Capítulo 23: Cloud (AWS)

## Exercício 1 — IaaS, PaaS e SaaS com serviços AWS

- **IaaS** (infraestrutura como serviço): você gerencia o SO e tudo acima —
  ex.: **EC2** (máquinas virtuais);
- **PaaS** (plataforma como serviço): você gerencia só o código/dados — ex.:
  **Elastic Beanstalk** ou **RDS** (banco gerenciado, sem operar servidor);
- **SaaS** (software como serviço): você usa o produto pronto — ex.:
  **SES** (e-mail) ou qualquer app pronto.

## Exercício 2 — ECS, RDS, S3, CloudFront — ordem de conexão

- **ECS** (Fargate): roda os **contêineres** da aplicação (o SkillHub);
- **RDS**: o **banco** PostgreSQL gerenciado (dados);
- **S3**: armazenamento de **objetos** (imagens, estáticos, backups);
- **CloudFront**: **CDN** na frente de tudo (cache global do conteúdo estático
  e das respostas da API).

Fluxo: Usuário → **CloudFront** → **ECS** → **RDS** (e S3 para mídia; estáticos
também podem sair do S3 via CloudFront).

## Exercício 3 — Menor privilégio na prática (IAM)

Cada identidade (usuário, serviço, CI) recebe **apenas as permissões
necessárias** para sua função — nada além. Na prática: papéis IAM por
serviço (o ECS tem acesso só ao S3 do app, não a todos os buckets), políticas
com escopo mínimo (ARN específico, não `*`), e credenciais de CI rotacionadas.
O objetivo: **um comprometimento não vira comprometimento total** (blast
radius pequeno).

## Exercício 4 — Por que o banco não deve ter IP público

O RDS com IP público é **alcançável da internet** — vira alvo de brute force
e fica exposto a scans. A regra: o banco vive **dentro da VPC** (rede privada)
e só o **app (ECS)** o alcança — tráfego de fora passa pela aplicação, nunca
direto no banco. Defesa em profundidade: rede privada + security group
restrito + criptografia.

## Exercício 5 — Três formas de controlar custos

1. **Budgets + alertas** (AWS Budgets): aviso em 50/80/100% do orçamento;
2. **Ligar/desligar dev**: instâncias e ambientes de dev **fora do horário**
   (schedule de stop/start) — maior desperdício é recurso ocioso;
3. **Escolher o tamanho certo**: começar pequeno, escalar com métricas
   (e não "reservar o maior por segurança"); usar **reserved/spot** para
   carga previsível e tolerante a interrupção.
