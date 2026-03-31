variable "aws_region" {
  description = "AWS region to deploy all resources"
  type        = string
  default     = "ca-central-1"
}

variable "project_name" {
  description = "Project name prefix for all resource names"
  type        = string
  default     = "pathmentor"
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "prod"
}

variable "dynamodb_table_name" {
  description = "DynamoDB table name for experiences"
  type        = string
  default     = "pathmentor-experiences"
}

variable "bedrock_region" {
  description = "Region for Amazon Bedrock — must be us-east-1 as ca-central-1 does not support Claude models"
  type        = string
  default     = "us-east-1"
}

variable "bedrock_model_id" {
  description = "Amazon Bedrock model ID to use for plan generation"
  type        = string
  default     = "anthropic.claude-3-haiku-20240307-v1:0"
}

variable "lambda_memory_mb" {
  description = "Memory allocated to each Lambda function (MB)"
  type        = number
  default     = 256
}

variable "lambda_timeout_seconds" {
  description = "Lambda function timeout in seconds"
  type        = number
  default     = 30
}

variable "ec2_instance_type" {
  description = "EC2 instance type for the seed runner"
  type        = string
  default     = "t3.micro"
}

variable "lab_role_arn" {
  description = "ARN of the AWS Academy LabRole IAM role. Leave as empty string to auto-detect from account ID."
  type        = string
  default     = ""
  # If empty, Terraform will construct it automatically using your account ID.
  # Only set this manually if auto-detection fails.
}
