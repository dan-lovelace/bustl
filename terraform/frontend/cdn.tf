variable "about_domain" {}
variable "app_domain" {}
variable "cert" {}

locals {
  s3_origin_id = "oakwood-s3-origin-${terraform.workspace}"
}

data "aws_acm_certificate" "oakwood_wildcard_cert" {
  domain = var.cert
  provider = aws.virginia
}

resource "aws_cloudfront_origin_access_identity" "oakwood_web_client_oai" {
  comment = "Oakwood web client OAI - ${terraform.workspace}"
}

resource "aws_cloudfront_distribution" "oakwood_about_client_distribution" {
  enabled = true
  is_ipv6_enabled = true
  default_root_object = "index.html"
  aliases = [var.about_domain]
  price_class = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket.oakwood_about_client_bucket.bucket_regional_domain_name
    origin_id = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oakwood_web_client_oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    lambda_function_association {
      event_type = "origin-request"
      lambda_arn = aws_lambda_function.oakwood_about_client_lambda_edge_function.qualified_arn
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl = 0
    default_ttl = 3600
    max_ttl = 86400
    compress = true
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.oakwood_wildcard_cert.arn
    ssl_support_method = "sni-only"
    minimum_protocol_version = "TLSv1.2_2019"
  }

  custom_error_response {
    error_code = 404
    response_code = 200
    response_page_path = "/404/index.html"
  }

  custom_error_response {
    error_code = 403
    response_code = 200
    response_page_path = "/404/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "Oakwood About client distribution - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_cloudfront_distribution" "oakwood_web_client_distribution" {
  enabled = true
  is_ipv6_enabled = true
  default_root_object = "index.html"
  aliases = [var.app_domain]
  price_class = "PriceClass_100"

  origin {
    domain_name = aws_s3_bucket.oakwood_web_client_bucket.bucket_regional_domain_name
    origin_id = local.s3_origin_id

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oakwood_web_client_oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods = ["GET", "HEAD", "OPTIONS"]
    cached_methods = ["GET", "HEAD"]
    target_origin_id = local.s3_origin_id

    forwarded_values {
      query_string = true

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl = 0
    default_ttl = 3600
    max_ttl = 86400
    compress = true
  }

  viewer_certificate {
    acm_certificate_arn = data.aws_acm_certificate.oakwood_wildcard_cert.arn
    ssl_support_method = "sni-only"
    minimum_protocol_version = "TLSv1.2_2019"
  }

  custom_error_response {
    error_code = 404
    response_code = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code = 403
    response_code = 200
    response_page_path = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Name = "Oakwood web client distribution - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_iam_role" "oakwood_lambda_edge_role" {
  name = "oakwood-lambda-edge-${terraform.workspace}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com",
          "edgelambda.amazonaws.com"
        ]
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_lambda_function" "oakwood_about_client_lambda_edge_function" {
  provider = aws.virginia
  publish = true
  runtime = "nodejs12.x"
  filename = "about-client-lambda-edge.zip"
  function_name = "oakwood-about-client-lambda-edge-${terraform.workspace}"
  role = aws_iam_role.oakwood_lambda_edge_role.arn
  handler = "handler.main"
  source_code_hash = filebase64sha256("about-client-lambda-edge.zip")
}

# TODO: add/update route53 CNAME record using tfvars