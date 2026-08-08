variable "regiao" {
  description = "Região AWS (prefira a mais próxima dos usuários)"
  type        = string
  default     = "sa-east-1"
}

variable "ambiente" {
  description = "Ambiente (dev/staging/prod) — vira sufixo dos nomes"
  type        = string
  default     = "prod"
}

variable "dominio" {
  description = "Domínio do SkillHub (ex.: skillhub.exemplo.com.br)"
  type        = string
  default     = "skillhub.exemplo.com.br"
}

variable "imagem_app" {
  description = "Imagem Docker da aplicação no ECR (ex.: 123456789012.dkr.ecr.sa-east-1.amazonaws.com/skillhub:latest)"
  type        = string
}

variable "db_senha" {
  description = "Senha do PostgreSQL (use o Secrets Manager na prática, nunca no código)"
  type        = string
  sensitive   = true
}
