output "s3_bucket" {
  description = "S3 bucket name — sync dist/ here after each build"
  value       = aws_s3_bucket.site.bucket
}

output "cloudfront_distribution_id" {
  description = "Pass to `aws cloudfront create-invalidation` after deploys"
  value       = aws_cloudfront_distribution.site.id
}

output "cloudfront_domain" {
  description = "CloudFront domain (*.cloudfront.net) — R53 ALIAS points here"
  value       = aws_cloudfront_distribution.site.domain_name
}

output "site_url" {
  value = "https://${local.domain}"
}
