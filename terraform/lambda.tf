# ── Package Lambda functions as zip archives ─────────────────────────────────

data "archive_file" "get_experiences" {
  type        = "zip"
  output_path = "${path.module}/.lambda_zips/get_experiences.zip"
  source {
    content  = file("${path.module}/../backend/experiences/get_experiences.py")
    filename = "get_experiences.py"
  }
  source {
    content  = file("${path.module}/../backend/shared/db_client.py")
    filename = "shared/db_client.py"
  }
}

data "archive_file" "post_experience" {
  type        = "zip"
  output_path = "${path.module}/.lambda_zips/post_experience.zip"
  source {
    content  = file("${path.module}/../backend/experiences/post_experience.py")
    filename = "post_experience.py"
  }
  source {
    content  = file("${path.module}/../backend/shared/db_client.py")
    filename = "shared/db_client.py"
  }
}

data "archive_file" "get_insights" {
  type        = "zip"
  output_path = "${path.module}/.lambda_zips/get_insights.zip"
  source {
    content  = file("${path.module}/../backend/insights/get_insights.py")
    filename = "get_insights.py"
  }
  source {
    content  = file("${path.module}/../backend/shared/db_client.py")
    filename = "shared/db_client.py"
  }
}

data "archive_file" "generate_plan" {
  type        = "zip"
  output_path = "${path.module}/.lambda_zips/generate_plan.zip"
  source {
    content  = file("${path.module}/../backend/plan/generate_plan.py")
    filename = "generate_plan.py"
  }
  source {
    content  = file("${path.module}/../backend/shared/db_client.py")
    filename = "shared/db_client.py"
  }
}

# ── Lambda: GET /experiences ─────────────────────────────────────────────────

resource "aws_lambda_function" "get_experiences" {
  function_name    = "${var.project_name}-get-experiences"
  role             = var.lab_role_arn
  handler          = "get_experiences.handler"
  runtime          = "python3.11"
  filename         = data.archive_file.get_experiences.output_path
  source_code_hash = data.archive_file.get_experiences.output_base64sha256
  memory_size      = var.lambda_memory_mb
  timeout          = var.lambda_timeout_seconds

  environment {
    variables = {
      EXPERIENCES_TABLE = aws_dynamodb_table.experiences.name
      AWS_REGION_NAME   = var.aws_region
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda_get_experiences]

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

resource "aws_cloudwatch_log_group" "lambda_get_experiences" {
  name              = "/aws/lambda/${var.project_name}-get-experiences"
  retention_in_days = 14
}

# ── Lambda: POST /experiences ─────────────────────────────────────────────────

resource "aws_lambda_function" "post_experience" {
  function_name    = "${var.project_name}-post-experience"
  role             = var.lab_role_arn
  handler          = "post_experience.handler"
  runtime          = "python3.11"
  filename         = data.archive_file.post_experience.output_path
  source_code_hash = data.archive_file.post_experience.output_base64sha256
  memory_size      = var.lambda_memory_mb
  timeout          = var.lambda_timeout_seconds

  environment {
    variables = {
      EXPERIENCES_TABLE = aws_dynamodb_table.experiences.name
      AWS_REGION_NAME   = var.aws_region
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda_post_experience]

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

resource "aws_cloudwatch_log_group" "lambda_post_experience" {
  name              = "/aws/lambda/${var.project_name}-post-experience"
  retention_in_days = 14
}

# ── Lambda: GET /insights ─────────────────────────────────────────────────────

resource "aws_lambda_function" "get_insights" {
  function_name    = "${var.project_name}-get-insights"
  role             = var.lab_role_arn
  handler          = "get_insights.handler"
  runtime          = "python3.11"
  filename         = data.archive_file.get_insights.output_path
  source_code_hash = data.archive_file.get_insights.output_base64sha256
  memory_size      = var.lambda_memory_mb
  timeout          = var.lambda_timeout_seconds

  environment {
    variables = {
      EXPERIENCES_TABLE = aws_dynamodb_table.experiences.name
      AWS_REGION_NAME   = var.aws_region
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda_get_insights]

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

resource "aws_cloudwatch_log_group" "lambda_get_insights" {
  name              = "/aws/lambda/${var.project_name}-get-insights"
  retention_in_days = 14
}

# ── Lambda: POST /generate-plan ───────────────────────────────────────────────

resource "aws_lambda_function" "generate_plan" {
  function_name    = "${var.project_name}-generate-plan"
  role             = var.lab_role_arn
  handler          = "generate_plan.handler"
  runtime          = "python3.11"
  filename         = data.archive_file.generate_plan.output_path
  source_code_hash = data.archive_file.generate_plan.output_base64sha256
  memory_size      = 512   # More memory for Bedrock calls
  timeout          = 60    # Bedrock can take up to 30s — give buffer

  environment {
    variables = {
      EXPERIENCES_TABLE = aws_dynamodb_table.experiences.name
      AWS_REGION_NAME   = var.aws_region
      BEDROCK_MODEL_ID  = var.bedrock_model_id
    }
  }

  depends_on = [aws_cloudwatch_log_group.lambda_generate_plan]

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

resource "aws_cloudwatch_log_group" "lambda_generate_plan" {
  name              = "/aws/lambda/${var.project_name}-generate-plan"
  retention_in_days = 14
}

# ── Lambda Permissions: Allow API Gateway to invoke each function ─────────────

resource "aws_lambda_permission" "apigw_get_experiences" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_experiences.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.pathmentor_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_post_experience" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.post_experience.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.pathmentor_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_get_insights" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.get_insights.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.pathmentor_api.execution_arn}/*/*"
}

resource "aws_lambda_permission" "apigw_generate_plan" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.generate_plan.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_api_gateway_rest_api.pathmentor_api.execution_arn}/*/*"
}
