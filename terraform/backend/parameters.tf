data "aws_sqs_queue" "oakwood_user_uploads_processing_queue" {
  name = aws_sqs_queue.oakwood_user_uploads_processing_queue.name
}

resource "aws_ssm_parameter" "vpc_region" {
  name = "/${terraform.workspace}/vpc_region"
  description = "Oakwood VPC region"
  type = "SecureString"
  value = local.vpc_region
}

resource "aws_ssm_parameter" "cognito_user_pool_id" {
  name = "/${terraform.workspace}/cognito_user_pool_id"
  description = "Oakwood Cognito user pool ID"
  type = "SecureString"
  value = aws_cognito_user_pool.oakwood_user_pool.id
}

resource "aws_ssm_parameter" "cognito_user_pool_arn" {
  name = "/${terraform.workspace}/cognito_user_pool_arn"
  description = "Oakwood Cognito user pool ARN"
  type = "SecureString"
  value = aws_cognito_user_pool.oakwood_user_pool.arn
}

resource "aws_ssm_parameter" "cognito_web_auth_client_id" {
  name = "/${terraform.workspace}/cognito_web_auth_client_id"
  description = "Oakwood Cognito web auth client ID"
  type = "SecureString"
  value = aws_cognito_user_pool_client.oakwood_web_auth_client.id
}

resource "aws_ssm_parameter" "cognito_machine_auth_client_id" {
  name = "/${terraform.workspace}/cognito_machine_auth_client_id"
  description = "Oakwood Cognito machine auth client ID"
  type = "SecureString"
  value = aws_cognito_user_pool_client.oakwood_machine_auth_client.id
}

resource "aws_ssm_parameter" "serverless_deployment_bucket" {
  name = "/${terraform.workspace}/serverless_deployment_bucket"
  description = "Oakwood Serverless deployment bucket"
  type = "SecureString"
  value = aws_s3_bucket.oakwood_serverless_bucket.id
}

resource "aws_ssm_parameter" "codebuild_deployment_bucket" {
  name = "/${terraform.workspace}/codebuild_deployment_bucket"
  description = "Oakwood Serverless deployment bucket"
  type = "SecureString"
  value = aws_s3_bucket.oakwood_codebuild_bucket.id
}

resource "aws_ssm_parameter" "user_uploads_bucket_name" {
  name = "/${terraform.workspace}/user_uploads_bucket_name"
  description = "Oakwood user uploads bucket"
  type = "SecureString"
  value = aws_s3_bucket.oakwood_user_uploads_bucket.id
}

resource "aws_ssm_parameter" "user_upload_processing_queue_url" {
  name = "/${terraform.workspace}/user_upload_processing_queue_url"
  description = "Oakwood user load processing SQS queue URL"
  type = "SecureString"
  value = data.aws_sqs_queue.oakwood_user_uploads_processing_queue.url
}

resource "aws_ssm_parameter" "user_upload_processing_queue_arn" {
  name = "/${terraform.workspace}/user_upload_processing_queue_arn"
  description = "Oakwood user load processing SQS queue ARN"
  type = "SecureString"
  value = aws_sqs_queue.oakwood_user_uploads_processing_queue.arn
}

# resource "aws_ssm_parameter" "user_uploads_cloudfront_id" {
#   name = "/${terraform.workspace}/user_uploads_cloudfront_id"
#   description = "Oakwood user uploads CloudFront distribution ID"
#   type = "SecureString"
#   value = aws_cloudfront_distribution.oakwood_user_uploads_distribution.id
# }

resource "aws_ssm_parameter" "private_subnet_1" {
  name = "/${terraform.workspace}/private_subnet_1"
  description = "Oakwood VPC private subnet 1"
  type = "SecureString"
  value = aws_subnet.private_subnet_1.id
}

resource "aws_ssm_parameter" "private_subnet_2" {
  name = "/${terraform.workspace}/private_subnet_2"
  description = "Oakwood VPC private subnet 2"
  type = "SecureString"
  value = aws_subnet.private_subnet_2.id
}

resource "aws_ssm_parameter" "default_security_group" {
  name = "/${terraform.workspace}/default_security_group"
  description = "Oakwood VPC default security group"
  type = "SecureString"
  value = aws_vpc.main_vpc.default_security_group_id
}

resource "aws_ssm_parameter" "db_superuser_secret_arn" {
  name = "/${terraform.workspace}/db_superuser_secret_arn"
  description = "Oakwood DB superuser connection secret ARN"
  type = "SecureString"
  value = aws_secretsmanager_secret.oakwood_db_superuser_secret.arn
}

resource "aws_ssm_parameter" "db_appuser_secret_arn" {
  name = "/${terraform.workspace}/db_appuser_secret_arn"
  description = "Oakwood DB appuser connection secret ARN"
  type = "SecureString"
  value = aws_secretsmanager_secret.oakwood_db_appuser_secret.arn
}

resource "aws_ssm_parameter" "db_appuser_secret_id" {
  name = "/${terraform.workspace}/db_appuser_secret_id"
  description = "Oakwood DB appuser connection secret ID"
  type = "SecureString"
  value = aws_secretsmanager_secret.oakwood_db_appuser_secret.name
}

resource "aws_ssm_parameter" "stripe_public_key_secret_arn" {
  name = "/${terraform.workspace}/stripe_public_key_secret_arn"
  description = "Oakwood public Stripe key secret ARN"
  type = "SecureString"
  value = aws_secretsmanager_secret.oakwood_stripe_public_key.arn
}

resource "aws_ssm_parameter" "stripe_public_key_secret_id" {
  name = "/${terraform.workspace}/stripe_public_key_secret_id"
  description = "Oakwood public Stripe key secret ID"
  type = "SecureString"
  value = aws_secretsmanager_secret.oakwood_stripe_public_key.name
}

resource "aws_ssm_parameter" "stripe_private_key_secret_arn" {
  name = "/${terraform.workspace}/stripe_private_key_secret_arn"
  description = "Oakwood private Stripe key secret ARN"
  type = "SecureString"
  value = aws_secretsmanager_secret.oakwood_stripe_private_key.arn
}

resource "aws_ssm_parameter" "stripe_private_key_secret_id" {
  name = "/${terraform.workspace}/stripe_private_key_secret_id"
  description = "Oakwood private Stripe key secret ID"
  type = "SecureString"
  value = aws_secretsmanager_secret.oakwood_stripe_private_key.name
}

resource "aws_ssm_parameter" "system_admin_secret_id" {
  name = "/${terraform.workspace}/system_admin_secret_id"
  description = "Oakwood system admin Cognito user secret ID"
  type = "SecureString"
  value = aws_secretsmanager_secret.oakwood_system_admin_user_secret.name
}

resource "aws_ssm_parameter" "terraform_workspace" {
  name = "/${terraform.workspace}/terraform_workspace"
  description = "Terraform workspace name for this environment"
  type = "SecureString"
  value = terraform.workspace
}

resource "aws_ssm_parameter" "aws_exports_auth" {
  name = "/${terraform.workspace}/aws_exports_auth"
  description = "Cognito auth JSON to use in Amplify"
  type = "SecureString"
  value = jsonencode({
    "region": local.vpc_region,
    "userPoolId": aws_cognito_user_pool.oakwood_user_pool.id,
    "userPoolWebClientId": aws_cognito_user_pool_client.oakwood_web_auth_client.id,
    "oauth": {
      "domain": aws_cognito_user_pool_domain.oakwood_cognito_auth_domain.domain,
      "scope": aws_cognito_user_pool_client.oakwood_web_auth_client.allowed_oauth_scopes,
      "redirectSignIn": local.web_client_login_callback_url,
      "redirectSignOut": local.web_client_logout_url,

      # ¯\_(ツ)_/¯
      "responseType": jsondecode(jsonencode(aws_cognito_user_pool_client.oakwood_web_auth_client.allowed_oauth_flows))[0],
    }
  })
}

resource "aws_ssm_parameter" "cache_endpoint" {
  name = "/${terraform.workspace}/cache_endpoint"
  description = "ElastiCache configuration endpoint"
  type = "SecureString"
  value = aws_elasticache_cluster.oakwood_cache_cluster.configuration_endpoint
}

resource "aws_ssm_parameter" "contact_message_topic_arn" {
  name = "/${terraform.workspace}/contact_message_topic_arn"
  description = "SNS Topic for new contact messages"
  type = "SecureString"
  value = aws_sns_topic.oakwood_contact_message_topic.arn
}

resource "aws_ssm_parameter" "appsync_logging_role_arn" {
  name = "/${terraform.workspace}/appsync_logging_role_arn"
  description = "Oakwood AppSync logging role ARN"
  type = "SecureString"
  value = aws_iam_role.oakwood_appsync_logging_role.arn
}