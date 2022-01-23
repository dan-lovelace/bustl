resource "aws_sns_topic" "oakwood_contact_message_topic" {
  name = "oakwood-contact-message-topic-${terraform.workspace}"
}

resource "aws_sns_topic_subscription" "oakwood_contact_message_topic_subscription" {
  topic_arn = aws_sns_topic.oakwood_contact_message_topic.arn
  protocol  = "email"
  endpoint  = local.contact_email
}