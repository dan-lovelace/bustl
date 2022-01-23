locals {
  about_client_bucket_name = "oakwood-about-client-${terraform.workspace}"
  web_client_bucket_name = "oakwood-web-client-${terraform.workspace}"
}

resource "aws_s3_bucket" "oakwood_about_client_bucket" {
  bucket = local.about_client_bucket_name
  force_destroy = true

  versioning {
    enabled = true
  }

  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Id": "PolicyForCloudFrontPrivateContent",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "CanonicalUser": "${aws_cloudfront_origin_access_identity.oakwood_web_client_oai.s3_canonical_user_id}"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${local.about_client_bucket_name}/*"
        }
    ]
}
POLICY

  tags = {
      Name = "Oakwood About client source - ${terraform.workspace}"
      Environment = terraform.workspace
  }
}

resource "aws_s3_bucket" "oakwood_web_client_bucket" {
  bucket = local.web_client_bucket_name
  force_destroy = true

  versioning {
    enabled = true
  }

  policy = <<POLICY
{
    "Version": "2012-10-17",
    "Id": "PolicyForCloudFrontPrivateContent",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "CanonicalUser": "${aws_cloudfront_origin_access_identity.oakwood_web_client_oai.s3_canonical_user_id}"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::${local.web_client_bucket_name}/*"
        }
    ]
}
POLICY

  tags = {
      Name = "Oakwood web client source - ${terraform.workspace}"
      Environment = terraform.workspace
  }
}