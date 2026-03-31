terraform {
  required_version = ">= 1.3.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Auto-construct the LabRole ARN using the current account ID.
# This avoids having to hardcode the account ID anywhere.
data "aws_caller_identity" "main" {}

locals {
  lab_role_arn = aws_iam_role.lambda_role.arn
}
