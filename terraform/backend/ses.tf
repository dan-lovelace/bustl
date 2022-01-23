variable "contact_email" {}
variable "email_domain" {}
variable "no_reply_email" {}

locals {
  contact_email = var.contact_email
  email_domain = var.email_domain
  no_reply_email = var.no_reply_email
}

resource "aws_ses_domain_identity" "oakwood_ses_domain_identity" {
  # these need to be in virginia to use in cognito
  provider = aws.virginia
  domain = local.email_domain
}

resource "aws_ses_domain_dkim" "oakwood_ses_domain_dkim" {
  provider = aws.virginia
  domain = aws_ses_domain_identity.oakwood_ses_domain_identity.domain
}

resource "aws_ses_email_identity" "oakwood_contact_email_identity" {
  provider = aws.virginia
  email = local.contact_email
}

resource "aws_ses_email_identity" "oakwood_no_reply_email_identity" {
  provider = aws.virginia
  email = local.no_reply_email
}

resource "aws_route53_record" "oakwood_ses_domain_verification_record" {
  zone_id = data.aws_route53_zone.oakwood_zone.zone_id
  name    = "_amazonses.${local.email_domain}"
  type    = "TXT"
  ttl     = "600"
  records = [aws_ses_domain_identity.oakwood_ses_domain_identity.verification_token]
}

resource "aws_route53_record" "oakwood_ses_dkim_record" {
  count   = 3
  zone_id = data.aws_route53_zone.oakwood_zone.zone_id
  name    = "${element(aws_ses_domain_dkim.oakwood_ses_domain_dkim.dkim_tokens, count.index)}._domainkey"
  type    = "CNAME"
  ttl     = "600"
  records = ["${element(aws_ses_domain_dkim.oakwood_ses_domain_dkim.dkim_tokens, count.index)}.dkim.amazonses.com"]
}