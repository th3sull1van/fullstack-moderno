# ============================================================================
# SkillHub em produção na AWS — infraestrutura como código (capítulo 23)
# Pipeline: Route 53 -> CloudFront -> ALB -> ECS Fargate -> RDS
#           mídias/estáticos no S3 (servidos também pelo CloudFront)
# ============================================================================

terraform {
  required_version = ">= 1.6"
  backend "s3" {
    # remote state (capítulo 23: "remote state no S3") — preencha antes do
    # primeiro apply e rode `terraform init -backend-config=...`
    bucket = "skillhub-terraform-state"
    key    = "skillhub/terraform.tfstate"
    region = "sa-east-1"
  }
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.regiao
}

locals {
  nome = "skillhub-${var.ambiente}"
  tags = { Projeto = "SkillHub", Ambiente = var.ambiente }
}

# ----------------------------- Rede (VPC) -----------------------------
resource "aws_vpc" "principal" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags                 = merge(local.tags, { Name = local.nome })
}

resource "aws_subnet" "publica" {
  count                   = 2
  vpc_id                  = aws_vpc.principal.id
  cidr_block              = "10.0.${count.index}.0/24"
  availability_zone       = data.aws_availability_zones.disponiveis.names[count.index]
  map_public_ip_on_launch = true
  tags                    = local.tags
}

resource "aws_subnet" "privada" {
  count             = 2
  vpc_id            = aws_vpc.principal.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.disponiveis.names[count.index]
  tags              = local.tags
}

resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.principal.id
  tags   = local.tags
}

resource "aws_route_table" "publica" {
  vpc_id = aws_vpc.principal.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.gw.id
  }
  tags = local.tags
}

resource "aws_route_table_association" "publica" {
  count          = 2
  subnet_id      = aws_subnet.publica[count.index].id
  route_table_id = aws_route_table.publica.id
}

# Banco SEM IP público: vive nas subnets privadas (só o app o alcança)
resource "aws_db_subnet_group" "banco" {
  name       = "${local.nome}-db"
  subnet_ids = aws_subnet.privada[*].id
  tags       = local.tags
}

# ----------------------------- Aplicação (ECS Fargate) -----------------------------
resource "aws_ecs_cluster" "app" {
  name = local.nome
  tags = local.tags
}

resource "aws_cloudwatch_log_group" "app" {
  name = "/ecs/${local.nome}"
}

resource "aws_ecs_task_definition" "app" {
  family                   = local.nome
  network_mode             = "awsvpc"
  cpu                      = "256"
  memory                   = "512"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.execucao.arn
  task_role_arn            = aws_iam_role.tarefa.arn

  container_definitions = jsonencode([
    {
      name      = "app"
      image     = var.imagem_app
      essential = true
      portMappings = [{ containerPort = 3000, protocol = "tcp" }]
      environment = [
        { name = "DATABASE_URL", value = "postgresql://skillhub:${var.db_senha}@${aws_db_instance.banco.endpoint}/skillhub" },
        { name = "NODE_ENV",     value = "production" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.app.name
          "awslogs-region"        = var.regiao
          "awslogs-stream-prefix" = "skillhub"
        }
      }
      healthCheck = {
        command     = ["CMD-SHELL", "curl -f http://localhost:3000/api/health || exit 1"]
        interval    = 30
        timeout     = 5
        retries     = 3
        startPeriod = 60
      }
    }
  ])
}

resource "aws_ecs_service" "app" {
  name            = local.nome
  cluster         = aws_ecs_cluster.app.id
  task_definition = aws_ecs_task_definition.app.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = aws_subnet.publica[*].id
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = 3000
  }
}

resource "aws_security_group" "app" {
  vpc_id = aws_vpc.principal.id
  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = [aws_vpc.principal.cidr_block] # só via ALB
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ----------------------------- Load balancer -----------------------------
resource "aws_lb" "app" {
  name               = "${local.nome}-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = aws_subnet.publica[*].id
  security_groups    = [aws_security_group.alb.id]
  tags               = local.tags
}

resource "aws_security_group" "alb" {
  vpc_id = aws_vpc.principal.id
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # público: entra só pelo CloudFront/ALB
  }
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb_target_group" "app" {
  name        = "${local.nome}-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.principal.id
  target_type = "ip"
  health_check {
    path                = "/api/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.app.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.app.arn
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app.arn
  }
}

# ----------------------------- Banco (RDS) -----------------------------
resource "aws_db_instance" "banco" {
  identifier     = "${local.nome}-db"
  engine         = "postgres"
  engine_version = "17"
  instance_class = "db.t4g.micro"
  allocated_storage = 20
  db_name  = "skillhub"
  username = "skillhub"
  password = var.db_senha
  # SEM IP público — só alcançável pela VPC (menor privilégio, cap. 23)
  publicly_accessible    = false
  db_subnet_group_name   = aws_db_subnet_group.banco.name
  vpc_security_group_ids = [aws_security_group.banco.id]
  skip_final_snapshot    = var.ambiente != "prod"
  multi_az               = var.ambiente == "prod"
  tags                   = local.tags
}

resource "aws_security_group" "banco" {
  vpc_id = aws_vpc.principal.id
  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id] # só o app fala com o banco
  }
}

# ----------------------------- Armazenamento (S3) -----------------------------
resource "aws_s3_bucket" "midias" {
  bucket        = "${local.nome}-midias"
  force_destroy = var.ambiente != "prod"
  tags          = local.tags
}

resource "aws_s3_bucket_public_access_block" "midias" {
  bucket = aws_s3_bucket.midias.id
  # bucket PRIVADO; o acesso público acontece via CloudFront OAC
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ----------------------------- CDN (CloudFront) -----------------------------
resource "aws_cloudfront_distribution" "app" {
  enabled = true
  aliases = [var.dominio]
  origin {
    domain_name = aws_lb.app.dns_name
    origin_id   = "skillhub-alb"
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }
  default_cache_behavior {
    target_origin_id       = "skillhub-alb"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "PATCH", "POST", "DELETE"]
    cached_methods         = ["GET", "HEAD"]
    forwarded_values {
      query_string = true
      cookies      = { forward = "all" }
      headers      = ["Authorization", "Origin"]
    }
    min_ttl     = 0
    default_ttl = 60
    max_ttl     = 3600
  }
  restrictions {
    geo_restriction { restriction_type = "none" }
  }
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.app.arn
    ssl_support_method  = "sni-only"
  }
  tags = local.tags
}

# ----------------------------- DNS (Route 53) -----------------------------
resource "aws_route53_record" "app" {
  zone_id = aws_route53_zone.principal.id
  name    = var.dominio
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.app.domain_name
    zone_id                = aws_cloudfront_distribution.app.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_zone" "principal" {
  name = var.dominio
  tags = local.tags
}

resource "aws_acm_certificate" "app" {
  domain_name               = var.dominio
  validation_method         = "DNS"
  subject_alternative_names = ["*.${var.dominio}"]
  lifecycle { create_before_destroy = true }
}

# ----------------------------- IAM (menor privilégio) -----------------------------
resource "aws_iam_role" "execucao" {
  name = "${local.nome}-exec"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "execucao" {
  role       = aws_iam_role.execucao.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "tarefa" {
  name = "${local.nome}-tarefa"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
  # permissão mínima: só o bucket do SkillHub (nunca s3:* global)
  inline_policy {
    name = "s3-skillhub"
    policy = jsonencode({
      Version = "2012-10-17"
      Statement = [{
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = "${aws_s3_bucket.midias.arn}/*"
      }]
    })
  }
}

data "aws_availability_zones" "disponiveis" {
  state = "available"
}
