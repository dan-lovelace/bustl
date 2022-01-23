variable "cdn_domain" {}

locals {
  s3_origin_id = "oakwood-s3-origin-${terraform.workspace}"
}

# resource "aws_iam_role" "oakwood_lambda_edge_role" {
#   name = "oakwood-lambda-edge-${terraform.workspace}"

#   assume_role_policy = <<EOF
# {
#   "Version": "2012-10-17",
#   "Statement": [
#     {
#       "Action": "sts:AssumeRole",
#       "Principal": {
#         "Service": [
#           "lambda.amazonaws.com",
#           "edgelambda.amazonaws.com"
#         ]
#       },
#       "Effect": "Allow"
#     }
#   ]
# }
# EOF
# }

# resource "aws_lambda_function" "oakwood_cdn_lambda_edge_function" {
#   provider = aws.virginia
#   publish = true
#   runtime = "nodejs12.x"
#   filename = "lambda-edge.zip"
#   function_name = "oakwood-cdn-lambda-edge-${terraform.workspace}"
#   role = aws_iam_role.oakwood_lambda_edge_role.arn
#   handler = "handler.main"
#   source_code_hash = filebase64sha256("lambda-edge.zip")
# }

resource "aws_cloudfront_origin_access_identity" "oakwood_user_uploads_oai" {
  comment = "Oakwood user uploads OAI - ${terraform.workspace}"
}

resource "aws_cloudfront_distribution" "oakwood_user_uploads_distribution" {
  enabled = true
  is_ipv6_enabled = true
  aliases = [var.cdn_domain]
  price_class = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket.oakwood_user_uploads_bucket.bucket_regional_domain_name
    origin_id = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oakwood_user_uploads_oai.cloudfront_access_identity_path
    }

    # custom_header {
    #   # used to validate jwt in edge lambda
    #   name = "x-oakwood-web-client-domain"
    #   value = var.app_domain
    # }
  }

  default_cache_behavior {
    allowed_methods = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = true
    #   headers = ["Authorization", "Access-Control-Request-Headers", "Access-Control-Request-Method", "Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl = 0
    default_ttl = 3600
    max_ttl = 86400
    compress = true

    # TODO: revisit this once TF adds trusted key groups: https://github.com/hashicorp/terraform-provider-aws/pull/17041
    # trusted_signers = ["self"]

    # lambda_function_association {
    #   event_type = "origin-request"
    #   lambda_arn = aws_lambda_function.oakwood_cdn_lambda_edge_function.qualified_arn
    # }
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.oakwood_wildcard_cert.arn
    ssl_support_method = "sni-only"
    minimum_protocol_version = "TLSv1.2_2019"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "Oakwood user uploads distribution - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_route53_record" "oakwood_user_uploads_cdn_record" {
  name = var.cdn_domain
  type = "A"
  zone_id = data.aws_route53_zone.oakwood_zone.zone_id

  alias {
    name = aws_cloudfront_distribution.oakwood_user_uploads_distribution.domain_name
    evaluate_target_health = false
    
    # this zone_id is fixed by aws
    zone_id = "Z2FDTNDATAQYW2"
  }
}