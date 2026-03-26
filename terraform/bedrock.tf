# ── Amazon Bedrock ────────────────────────────────────────────────────────────
#
# Bedrock does not require a Terraform resource to enable — model access
# is granted via the AWS Console (Bedrock → Model Access → Request Access).
#
# IMPORTANT: Before deploying, you MUST manually enable model access:
#   1. Go to AWS Console → Amazon Bedrock → Model Access
#   2. Click "Manage model access"
#   3. Enable: "Claude 3 Sonnet" (anthropic.claude-3-sonnet-20240229-v1:0)
#   4. Click "Save changes" and wait for status = "Access granted"
#
# The Lambda function (generate_plan.py) calls Bedrock via the LabRole,
# which has bedrock:InvokeModel permission in the AWS Academy environment.
#
# This file exists to document the Bedrock dependency and store the
# model configuration as a local value for reference.

locals {
  bedrock_model_id     = var.bedrock_model_id
  bedrock_region       = var.aws_region
  bedrock_max_tokens   = 2000
  bedrock_api_version  = "bedrock-2023-05-31"
}

# CloudWatch log group for Bedrock invocation tracking
# (Bedrock itself doesn't emit CloudWatch logs, but Lambda logs all calls)
resource "aws_cloudwatch_log_group" "bedrock_invocations" {
  name              = "/pathmentor/bedrock-invocations"
  retention_in_days = 14

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}
