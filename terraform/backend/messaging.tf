resource "aws_sqs_queue" "oakwood_user_uploads_processing_queue" {
    name = "oakwood-user-uploads-processing-${terraform.workspace}"
    visibility_timeout_seconds = 60

    tags = {
        Name = "Oakwood user uploads processing queue - ${terraform.workspace}"
        Environment = terraform.workspace
    }
}