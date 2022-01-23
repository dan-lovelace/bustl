variable "zone" {}
variable "app_domain" {}
variable "auth_domain" {}
variable "cert" {}
variable "login_callback_path" {}
variable "logout_location" {}

data "aws_route53_zone" "oakwood_zone" {
  name = var.zone
}

data "aws_acm_certificate" "oakwood_wildcard_cert" {
  domain = var.cert
  provider = aws.virginia
}

data "aws_secretsmanager_secret_version" "oakwood_google_cognito_idp" {
  secret_id = "oakwood-google-cognito-idp-${terraform.workspace}"
}

locals {
  # local testing config
  # web_client_login_callback_url = "http://localhost:3010${var.login_callback_path}"
  # web_client_logout_url = "http://localhost:3010${var.logout_location}"

  web_client_login_callback_url = "https://${var.app_domain}${var.login_callback_path}"
  web_client_logout_url = "https://${var.app_domain}${var.logout_location}"
}

resource "aws_cognito_user_pool" "oakwood_user_pool" {
  name = "${terraform.workspace}_oakwood_users"

  auto_verified_attributes = ["email"]
  username_attributes = ["email"]

  # admin_create_user_config {
  #   allow_admin_create_user_only = true
  # }

  account_recovery_setting {
    recovery_mechanism {
      name = "verified_email"
      priority = 1
    }
  }

  email_configuration {
    email_sending_account = "DEVELOPER"
    source_arn = aws_ses_email_identity.oakwood_no_reply_email_identity.arn
    reply_to_email_address = "no-reply@${local.email_domain}"
    from_email_address = "no-reply-bustl <${local.no_reply_email}>"
  }

  verification_message_template {
    # link verification is interesting but it requires the user to enter email/password twice
    # default_email_option = "CONFIRM_WITH_LINK"

    email_subject = "Your verification code"
    email_message = file("./cognito-ui/verification_code_email.html")

    email_subject_by_link = "Please confirm your email address"
    email_message_by_link = <<EOF
<p>
  Thanks for getting started with bus.tl! Before we can continue,
  we'll need to verify your email address.
</p>
<p>
  {##Click here to confirm##}
</p>
EOF
  }

  lambda_config {
    # pre_token_generation = aws_lambda_function.oakwood_cognito_pre_token_gen_function.arn
    post_confirmation = aws_lambda_function.oakwood_cognito_post_confirmation_function.arn
    # pre_sign_up = aws_lambda_function.oakwood_cognito_pre_sign_up_function.arn
  }

  tags = {
    Name = "Oakwood users - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_cognito_user_pool_client" "oakwood_web_auth_client" {
  name = "${terraform.workspace}_oakwood_web_auth_client"
  user_pool_id = aws_cognito_user_pool.oakwood_user_pool.id
  supported_identity_providers = ["COGNITO", "Google"]

  allowed_oauth_flows_user_pool_client =  true
  allowed_oauth_flows = ["code"]
  allowed_oauth_scopes = ["email", "openid", "aws.cognito.signin.user.admin", "profile"]
  
  callback_urls = [local.web_client_login_callback_url]
  logout_urls = [local.web_client_logout_url]
}

resource "aws_cognito_user_pool_client" "oakwood_machine_auth_client" {
  name = "${terraform.workspace}_oakwood_machine_auth_client"
  user_pool_id = aws_cognito_user_pool.oakwood_user_pool.id
  generate_secret = true
  explicit_auth_flows = ["ADMIN_NO_SRP_AUTH"]

  # supported_identity_providers = ["COGNITO", "Google"]

  # allowed_oauth_flows_user_pool_client =  true
  # allowed_oauth_flows = ["code"]
  # allowed_oauth_scopes = ["email", "openid", "aws.cognito.signin.user.admin", "profile"]
  
  # callback_urls = [local.web_client_login_callback_url]
  # logout_urls = [local.web_client_logout_url]
}

resource "aws_cognito_user_pool_ui_customization" "oakwood_user_pool_ui_customization" {
  client_id = aws_cognito_user_pool_client.oakwood_web_auth_client.id

  css = file("./cognito-ui/style.css")
  image_file = filebase64("./cognito-ui/logo.png")

  # Refer to the aws_cognito_user_pool_domain resource's
  # user_pool_id attribute to ensure it is in an 'Active' state
  user_pool_id = aws_cognito_user_pool_domain.oakwood_cognito_auth_domain.user_pool_id
}

resource "aws_cognito_identity_provider" "oakwood_google_provider" {
  user_pool_id = aws_cognito_user_pool.oakwood_user_pool.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email"
    client_id = jsondecode(data.aws_secretsmanager_secret_version.oakwood_google_cognito_idp.secret_string)["CLIENT_ID"]
    client_secret = jsondecode(data.aws_secretsmanager_secret_version.oakwood_google_cognito_idp.secret_string)["CLIENT_SECRET"]
  }

  attribute_mapping = {
    email = "email"
    username = "sub"
  }
}

resource "aws_cognito_user_group" "oakwood_system_admin_group" {
  name = "system-admin"
  description = "Admin level access to API operations for real people"
  user_pool_id = aws_cognito_user_pool.oakwood_user_pool.id
  precedence = 1
}

resource "aws_cognito_user_group" "oakwood_app_user_group" {
  name = "system-user"
  description = "Normal app user access"
  user_pool_id = aws_cognito_user_pool.oakwood_user_pool.id
  precedence = 2
}

resource "aws_cognito_user_pool_domain" "oakwood_cognito_auth_domain" {
  domain = var.auth_domain
  certificate_arn = data.aws_acm_certificate.oakwood_wildcard_cert.arn
  user_pool_id = aws_cognito_user_pool.oakwood_user_pool.id
}

resource "aws_route53_record" "oakwood_cognito_auth_zone_record" {
  name = aws_cognito_user_pool_domain.oakwood_cognito_auth_domain.domain
  type = "A"
  zone_id = data.aws_route53_zone.oakwood_zone.zone_id

  alias {
    name = aws_cognito_user_pool_domain.oakwood_cognito_auth_domain.cloudfront_distribution_arn
    evaluate_target_health = false

    # this zone_id is fixed by aws
    zone_id = "Z2FDTNDATAQYW2"
  }
}

resource "aws_secretsmanager_secret" "oakwood_stripe_public_key" {
  name = "oakwood-stripe-public-key-${terraform.workspace}"
  description = "Oakwood Stripe public API key"
  recovery_window_in_days = 0 # to allow force delete during password changes

  tags = {
    Name = "Oakwood public Stripe key - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_secretsmanager_secret" "oakwood_stripe_private_key" {
  name = "oakwood-stripe-private-key-${terraform.workspace}"
  description = "Oakwood Stripe private API key"
  recovery_window_in_days = 0 # to allow force delete during password changes

  tags = {
    Name = "Oakwood private Stripe key - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_secretsmanager_secret" "oakwood_system_admin_user_secret" {
  name = "oakwood-system-admin-${terraform.workspace}"
  description = "Oakwood system admin user credentials"
  recovery_window_in_days = 0 # to allow force delete during password changes

  tags = {
    Name = "Oakwood system admin user - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_secretsmanager_secret" "oakwood_machine_auth_client_secret" {
  name = "oakwood-machine-auth-client-secret-${terraform.workspace}"
  description = "Oakwood machine auth Cognito client secret"
  recovery_window_in_days = 0 # to allow force delete during password changes

  tags = {
    Name = "Oakwood machine auth client secret - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_secretsmanager_secret_version" "oakwood_machine_auth_client_secret_version" {
  secret_id = aws_secretsmanager_secret.oakwood_machine_auth_client_secret.id
  secret_string = aws_cognito_user_pool_client.oakwood_machine_auth_client.client_secret
}

# resource "aws_secretsmanager_secret" "oakwood_google_client_id" {
#   name = "oakwood-google-client-id-${terraform.workspace}"
#   description = "Oakwood Google client ID"
#   recovery_window_in_days = 0 # to allow force delete during password changes

#   tags = {
#     Name = "Oakwood Google client ID - ${terraform.workspace}"
#     Environment = terraform.workspace
#   }
# }

# resource "aws_secretsmanager_secret" "oakwood_google_client_secret" {
#   name = "oakwood-google-client-secret-${terraform.workspace}"
#   description = "Oakwood Google client secret"
#   recovery_window_in_days = 0 # to allow force delete during password changes

#   tags = {
#     Name = "Oakwood Google client secret - ${terraform.workspace}"
#     Environment = terraform.workspace
#   }
# }

resource "aws_iam_role" "oakwood_cognito_trigger_role" {
  name = "oakwood-cognito-trigger-${terraform.workspace}"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "lambda.amazonaws.com"
        ]
      },
      "Effect": "Allow"
    }
  ]
}
EOF
}

resource "aws_iam_policy" "oakwood_cognito_trigger_policy" {
  name        = "oakwood_cognito_trigger_policy"
  description = "IAM policy for logging from Cognito lambda triggers"

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeNetworkInterfaces",
        "ec2:CreateNetworkInterface",
        "ec2:DeleteNetworkInterface",
        "ec2:DescribeInstances",
        "ec2:AttachNetworkInterface"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "secretsmanager:GetSecretValue"
      ],
      "Resource": [
        "${aws_secretsmanager_secret.oakwood_system_admin_user_secret.arn}",
        "${aws_secretsmanager_secret.oakwood_machine_auth_client_secret.arn}"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ssm:GetParameter"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "cognito-idp:*"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "appsync:ListGraphqlApis"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "lambda:InvokeFunction"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "oakwood_cognito_trigger_policy_attachment" {
  role       = aws_iam_role.oakwood_cognito_trigger_role.name
  policy_arn = aws_iam_policy.oakwood_cognito_trigger_policy.arn
}

# resource "aws_lambda_function" "oakwood_cognito_pre_token_gen_function" {
#   depends_on = [aws_iam_role_policy_attachment.oakwood_cognito_trigger_policy_attachment, aws_iam_policy.oakwood_cognito_trigger_policy]

#   publish = true
#   runtime = "go1.x"
#   filename = "pre-token-gen.zip"
#   function_name = "oakwood-cognito-pre-token-gen-${terraform.workspace}"
#   role = aws_iam_role.oakwood_cognito_trigger_role.arn
#   handler = "pre-token-gen"
#   source_code_hash = filebase64sha256("pre-token-gen.zip")
#   timeout = 5 // max is 5 seconds for cognito triggers
  
#   vpc_config {
#     security_group_ids = [aws_vpc.main_vpc.default_security_group_id]
#     subnet_ids = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
#   }

#   environment {
#     variables = {
#       TERRAFORM_WORKSPACE = terraform.workspace
#     }
#   }
# }

resource "aws_lambda_function" "oakwood_cognito_post_confirmation_function" {
  depends_on = [aws_iam_role_policy_attachment.oakwood_cognito_trigger_policy_attachment, aws_iam_policy.oakwood_cognito_trigger_policy]

  publish = true
  runtime = "go1.x"
  filename = "post-confirmation.zip"
  function_name = "oakwood-cognito-post-confirmation-${terraform.workspace}"
  role = aws_iam_role.oakwood_cognito_trigger_role.arn
  handler = "post-confirmation"
  source_code_hash = filebase64sha256("post-confirmation.zip")
  timeout = 5 // cognito max is 5 seconds before attempting retry
  
  vpc_config {
    security_group_ids = [aws_vpc.main_vpc.default_security_group_id]
    subnet_ids = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
  }

  environment {
    variables = {
      TERRAFORM_WORKSPACE = terraform.workspace
    }
  }
}

# resource "aws_lambda_function" "oakwood_cognito_pre_sign_up_function" {
#   depends_on = [aws_iam_role_policy_attachment.oakwood_cognito_trigger_policy_attachment, aws_iam_policy.oakwood_cognito_trigger_policy]

#   publish = true
#   runtime = "go1.x"
#   filename = "pre-sign-up.zip"
#   function_name = "oakwood-cognito-pre-sign-up-${terraform.workspace}"
#   role = aws_iam_role.oakwood_cognito_trigger_role.arn
#   handler = "pre-sign-up"
#   source_code_hash = filebase64sha256("pre-sign-up.zip")
#   timeout = 5 // max is 5 seconds for cognito triggers
  
#   vpc_config {
#     security_group_ids = [aws_vpc.main_vpc.default_security_group_id]
#     subnet_ids = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]
#   }

#   environment {
#     variables = {
#       TERRAFORM_WORKSPACE = terraform.workspace
#     }
#   }
# }