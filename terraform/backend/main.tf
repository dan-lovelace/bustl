locals {
  vpc_region = "us-east-2"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.30"
    }

    random = {
      source = "hashicorp/random"
      version = "3.1.0"
    }

    time = {
      source = "hashicorp/time"
      version = "0.7.2"
    }
  }

  backend "s3" {
    region = "us-east-1"
    bucket = "project-oakwood-terraform"
    key = "backend.tfstate"
  }
}

provider "aws" {
  region = local.vpc_region
}

provider "aws" {
  # need to use us-east-1 specifically in some cases
  alias = "virginia"
  region = "us-east-1"
}