variable "acm_certificate_arn" {
  description = "ARN of the *.grantwang.dev ACM certificate (must be in us-east-1)"
  type        = string
}

variable "aws_region" {
  description = "AWS region for S3 bucket (CloudFront is global; cert must be us-east-1)"
  type        = string
  default     = "us-east-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to use for deployment"
  type        = string
}
