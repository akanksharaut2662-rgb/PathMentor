variable "aws_region" {
  description = "AWS region to deploy all resources"
  type        = string
  default     = "us-east-1"
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

variable "bedrock_model_id" {
  description = "Amazon Bedrock model ID to use for plan generation"
  type        = string
  default     = "anthropic.claude-3-sonnet-20240229-v1:0"
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

variable "ec2_ami_id" {
  description = "AMI ID for EC2 seed runner (Amazon Linux 2023, us-east-1)"
  type        = string
  default     = "ami-0c02fb55956c7d316" # Amazon Linux 2023 us-east-1
}

variable "lab_role_arn" {
  description = "ARN of the AWS Academy LabRole IAM role"
  type        = string
  default     = "arn:aws:iam::ACCOUNT_ID:role/LabRole"
  # IMPORTANT: Replace ACCOUNT_ID with your actual AWS account ID before deploying.
  # Find it in: AWS Console → top-right account menu → Account ID
}
