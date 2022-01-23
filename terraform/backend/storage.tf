locals {
  cache_node_type = {
    development = "cache.t2.micro"
    production = "cache.t2.micro"
  }
  cache_num_cache_nodes = {
    development = 1
    production = 1
  }
  db_engine = "postgres"
  db_instance_class = {
    development = "db.t2.micro"
    production = "db.t2.micro"
  }
  db_name = "oakwood"
  db_username = "oakwood_admin"
  user_uploads_bucket_name = "oakwood-user-uploads-${terraform.workspace}"
  user_uploads_bucket_allowed_origin = {
    development = "*" // allow localhost uploads
    production = "https://${var.app_domain}"
  }
}

resource "time_rotating" "oakwood_db_superuser_password_time_rotator" {
  rotation_days = 30
}

resource "random_password" "oakwood_db_superuser_password" {
  length = 32
  special = false
  keepers = {
    time_id = time_rotating.oakwood_db_superuser_password_time_rotator.id
  }
}

resource "aws_db_subnet_group" "oakwood_db_subnet_group" {
  name = "oakwood-db-${terraform.workspace}"
  subnet_ids = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]

  tags = {
    Name = "Oakwood RDS subnet group - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_security_group" "oakwood_db_security_group" {
  vpc_id = aws_vpc.main_vpc.id
  name = "oakwood-db-${terraform.workspace}"
  description = "Oakwood RDS security group"

  tags = {
    Name = "Oakwood DB - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_security_group_rule" "oakwood_db_access" {
  type            = "ingress"
  from_port       = 5432
  to_port         = 5432
  protocol        = "tcp"
  cidr_blocks     = ["0.0.0.0/0"]

  security_group_id = aws_security_group.oakwood_db_security_group.id
}

resource "aws_db_instance" "oakwood_db" {
  engine          = local.db_engine
  name            = local.db_name # name of database to create during construction
  username        = local.db_username
  password        = random_password.oakwood_db_superuser_password.result

  db_subnet_group_name = aws_db_subnet_group.oakwood_db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.oakwood_db_security_group.id]
  # multi_az = true
  
  identifier = "oakwood-${terraform.workspace}"
  engine_version = "12.7"
  instance_class = local.db_instance_class[terraform.workspace]
  allocated_storage = 40
  max_allocated_storage = 500
  # deletion_protection = true # prod only

  # skip_final_snapshot = true
  final_snapshot_identifier = "${terraform.workspace}-${formatdate("YYYYMMDDhhmmss", timestamp())}"
  backup_retention_period = 14
  apply_immediately = true # use only when necessary

  tags = {
    Name = "Oakwood DB - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_iam_role" "oakwood_db_migrations_role" {
  name = "oakwood-migrations-${terraform.workspace}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      }
    }
  ]
}
EOF

  tags = {
    Name = "Oakwood DB migrations role - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_iam_role_policy" "oakwood_db_migrations_role_policy" {
  role = aws_iam_role.oakwood_db_migrations_role.name
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:CreateNetworkInterface",
        "ec2:CreateNetworkInterfacePermission",
        "ec2:DescribeDhcpOptions",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DeleteNetworkInterface",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeVpcs"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "${aws_s3_bucket.oakwood_codebuild_bucket.arn}",
        "${aws_s3_bucket.oakwood_codebuild_bucket.arn}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": ["${aws_secretsmanager_secret.oakwood_db_superuser_secret.arn}"]
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:PutSecretValue"
      ],
      "Resource": ["${aws_secretsmanager_secret.oakwood_db_appuser_secret.arn}"]
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetRandomPassword"
      ],
      "Resource": "*"
    }
  ]
}
POLICY
}

resource "aws_codebuild_project" "oakwood_db_migrations_project" {
  name = "oakwood-migrations-${terraform.workspace}"
  description = "Securely manages Oakwood DB migrations from inside the VPC"
  service_role = aws_iam_role.oakwood_db_migrations_role.arn

  environment {
    compute_type = "BUILD_GENERAL1_SMALL"
    type = "LINUX_CONTAINER"
    image = "aws/codebuild/standard:4.0"

    environment_variable {
      name = "DB_SUPERUSER_SECRET_ID"
      value = aws_secretsmanager_secret.oakwood_db_superuser_secret.name
    }

    environment_variable {
      name = "VPC_REGION"
      value = local.vpc_region
    }

    environment_variable {
      name = "TERRAFORM_WORKSPACE"
      value = terraform.workspace
    }
  }

  artifacts {
    type = "NO_ARTIFACTS"
  }

  vpc_config {
    vpc_id = aws_vpc.main_vpc.id
    security_group_ids = [aws_security_group.codebuild_security_group.id]
    subnets = [aws_subnet.codebuild_subnet_1.id, aws_subnet.codebuild_subnet_2.id]
  }

  source {
    type = "S3"
    location = "${aws_s3_bucket.oakwood_codebuild_bucket.bucket}/db_migrations/out.zip"
  }
}

resource "aws_secretsmanager_secret" "oakwood_db_superuser_secret" {
  # this stores sensitive connection info for the RDS superuser created in aws_db_instance.oakwood_db
  depends_on = [aws_db_instance.oakwood_db]

  name = "oakwood-db-superuser-${terraform.workspace}"
  description = "Sensitive Oakwood RDS superuser information"
  recovery_window_in_days = 0 # to allow force delete during password changes

  tags = {
    Name = "Oakwood RDS superuser - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_secretsmanager_secret_version" "oakwood_db_superuser_secret_version" {
  secret_id = aws_secretsmanager_secret.oakwood_db_superuser_secret.id
  secret_string = "${local.db_engine}://${local.db_username}:${random_password.oakwood_db_superuser_password.result}@${aws_db_instance.oakwood_db.endpoint}/${local.db_name}"
}

resource "aws_secretsmanager_secret" "oakwood_db_appuser_secret" {
  name = "oakwood-db-appuser-${terraform.workspace}"
  description = "Sensitive Oakwood RDS appuser information"
  recovery_window_in_days = 0 # to allow force delete during password changes

  tags = {
    Name = "Oakwood RDS appuser - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_s3_bucket" "oakwood_serverless_bucket" {
  bucket = "oakwood-serverless-${terraform.workspace}"
  force_destroy = true

  versioning {
    enabled = true
  }

  tags = {
    Name = "Oakwood Serverless deploys - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_s3_bucket" "oakwood_codebuild_bucket" {
  bucket = "oakwood-codebuild-${terraform.workspace}"
  force_destroy = true

  versioning {
    enabled = true
  }

  tags = {
    Name = "Oakwood CodeBuild deploys - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_s3_bucket" "oakwood_user_uploads_bucket" {
  bucket = local.user_uploads_bucket_name
  force_destroy = true
  acl = "private"

  versioning {
    enabled = true
  }

#   policy = <<POLICY
# {
#   "Version":"2012-10-17",
#   "Id":"CloudFrontPrivatePolicyForPrivateBucket",
#   "Statement":[
#     {
#       "Sid": "AllowOAIGet",
#       "Effect": "Allow",
#       "Principal": {
#         "CanonicalUser": "${aws_cloudfront_origin_access_identity.oakwood_user_uploads_oai.s3_canonical_user_id}"
#       },
#       "Action": [
#         "s3:GetObject",
#         "s3:PutObject"
#       ],
#       "Resource": "arn:aws:s3:::${local.user_uploads_bucket_name}/*"
#     }
#   ]
# }
# POLICY

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD", "PUT", "POST"]
    allowed_origins = [local.user_uploads_bucket_allowed_origin[terraform.workspace]]
    expose_headers  = []
    max_age_seconds = 3000
  }

  tags = {
    Name = "Oakwood user uploads - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_elasticache_cluster" "oakwood_cache_cluster" {
  cluster_id =            "oakwood-cluster-${terraform.workspace}"
  engine =                "memcached"
  engine_version =        "1.6.6"
  node_type =             local.cache_node_type[terraform.workspace]
  num_cache_nodes =       local.cache_num_cache_nodes[terraform.workspace]
  parameter_group_name =  "default.memcached1.6"
  port =                  11211

  subnet_group_name = aws_elasticache_subnet_group.oakwood_cache_subnet_group.name

  tags = {
    Name = "Oakwood general app cache - ${terraform.workspace}"
  }
}