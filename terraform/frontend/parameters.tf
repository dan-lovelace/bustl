resource "aws_ssm_parameter" "about_client_bucket_name" {
  name = "/${terraform.workspace}/about_client_bucket_name"
  description = "Oakwood About client source code bucket"
  type = "SecureString"
  value = aws_s3_bucket.oakwood_about_client_bucket.id
}

resource "aws_ssm_parameter" "about_client_cloudfront_id" {
  name = "/${terraform.workspace}/about_client_cloudfront_id"
  description = "Oakwood About client CloudFront distribution ID"
  type = "SecureString"
  value = aws_cloudfront_distribution.oakwood_about_client_distribution.id
}

resource "aws_ssm_parameter" "about_client_domain_name" {
  name = "/${terraform.workspace}/about_client_domain_name"
  description = "Oakwood About client domain name"
  type = "SecureString"
  value = var.about_domain
}

resource "aws_ssm_parameter" "web_client_bucket_name" {
  name = "/${terraform.workspace}/web_client_bucket_name"
  description = "Oakwood web client source code bucket"
  type = "SecureString"
  value = aws_s3_bucket.oakwood_web_client_bucket.id
}

resource "aws_ssm_parameter" "web_client_cloudfront_id" {
  name = "/${terraform.workspace}/web_client_cloudfront_id"
  description = "Oakwood web client CloudFront distribution ID"
  type = "SecureString"
  value = aws_cloudfront_distribution.oakwood_web_client_distribution.id
}
