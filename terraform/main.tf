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

  # AWS Academy Learner Lab — uses the LabRole credentials injected via environment.
  # Do NOT hardcode access keys here. Set via:
  #   export AWS_ACCESS_KEY_ID=...
  #   export AWS_SECRET_ACCESS_KEY=...
  #   export AWS_SESSION_TOKEN=...
  # (copy from the Learner Lab "AWS Details" panel)
}
