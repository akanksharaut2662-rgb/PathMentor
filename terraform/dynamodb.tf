resource "aws_dynamodb_table" "experiences" {
  name         = var.dynamodb_table_name
  billing_mode = "PAY_PER_REQUEST" # Serverless — no capacity planning needed
  hash_key     = "experience_id"

  attribute {
    name = "experience_id"
    type = "S"
  }

  # GSI: query by user_type + goal efficiently
  global_secondary_index {
    name            = "user_type-goal-index"
    hash_key        = "user_type"
    range_key       = "goal"
    projection_type = "ALL"
  }

  attribute {
    name = "user_type"
    type = "S"
  }

  attribute {
    name = "goal"
    type = "S"
  }

  # Enable point-in-time recovery for data protection
  point_in_time_recovery {
    enabled = true
  }

  # Encrypt at rest using AWS managed key
  server_side_encryption {
    enabled = true
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}
