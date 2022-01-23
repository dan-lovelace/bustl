resource "aws_iam_role" "oakwood_appsync_logging_role" {
  name = "oakwood-appsync-logging-${terraform.workspace}"
  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "appsync.amazonaws.com"
      }
    }
  ]
}
EOF

  tags = {
    Name = "Oakwood AppSync logging role - ${terraform.workspace}"
    Environment = terraform.workspace
  }
}

resource "aws_iam_role_policy" "oakwood_appsync_logging_role_policy" {
  role = aws_iam_role.oakwood_appsync_logging_role.name
  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:GetLogEvents",
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams",
        "logs:PutRetentionPolicy"
      ],
      "Resource": [
        "*"
      ]
    }
  ]
}
POLICY
}