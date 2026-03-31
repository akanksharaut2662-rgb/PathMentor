output "api_gateway_url" {
  description = "Base URL of the API Gateway — use this in the frontend .env"
  value       = "https://${aws_api_gateway_rest_api.pathmentor_api.id}.execute-api.${var.aws_region}.amazonaws.com/${aws_api_gateway_stage.prod.stage_name}"
}

output "cloudfront_url" {
  description = "CloudFront distribution URL — this is your live frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "s3_frontend_bucket" {
  description = "S3 bucket name for the React frontend"
  value       = aws_s3_bucket.frontend.bucket
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = aws_dynamodb_table.experiences.name
}

output "ec2_seed_runner_public_ip" {
  description = "Public IP of the EC2 seed runner instance"
  value       = aws_instance.seed_runner.public_ip
}

output "ec2_seed_runner_id" {
  description = "Instance ID of the EC2 seed runner"
  value       = aws_instance.seed_runner.id
}

output "cloudwatch_log_groups" {
  description = "CloudWatch log group names for Lambda functions"
  value = {
    get_experiences = aws_cloudwatch_log_group.lambda_get_experiences.name
    post_experience = aws_cloudwatch_log_group.lambda_post_experience.name
    get_insights    = aws_cloudwatch_log_group.lambda_get_insights.name
    generate_plan   = aws_cloudwatch_log_group.lambda_generate_plan.name
  }
}
