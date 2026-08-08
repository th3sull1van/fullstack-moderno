output "url" {
  description = "URL pública do SkillHub"
  value       = "https://${var.dominio}"
}

output "url_cloudfront" {
  description = "URL direta do CloudFront (teste antes do DNS)"
  value       = aws_cloudfront_distribution.app.domain_name
}

output "endpoint_banco" {
  description = "Endpoint do RDS (privado — só alcançável pela VPC)"
  value       = aws_db_instance.banco.endpoint
}

output "bucket_midias" {
  description = "Bucket S3 de mídias (privado, via CloudFront OAC)"
  value       = aws_s3_bucket.midias.id
}
