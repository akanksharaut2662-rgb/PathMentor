# ── REST API ──────────────────────────────────────────────────────────────────

resource "aws_api_gateway_rest_api" "pathmentor_api" {
  name        = "${var.project_name}-api"
  description = "PathMentor REST API — experiences, insights, and AI plan generation"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

# ── /experiences resource ─────────────────────────────────────────────────────

resource "aws_api_gateway_resource" "experiences" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  parent_id   = aws_api_gateway_rest_api.pathmentor_api.root_resource_id
  path_part   = "experiences"
}

# GET /experiences
resource "aws_api_gateway_method" "get_experiences" {
  rest_api_id   = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id   = aws_api_gateway_resource.experiences.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_experiences" {
  rest_api_id             = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id             = aws_api_gateway_resource.experiences.id
  http_method             = aws_api_gateway_method.get_experiences.http_method
  integration_http_method = "POST" # Lambda always uses POST integration
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_experiences.invoke_arn
}

# POST /experiences
resource "aws_api_gateway_method" "post_experience" {
  rest_api_id   = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id   = aws_api_gateway_resource.experiences.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_experience" {
  rest_api_id             = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id             = aws_api_gateway_resource.experiences.id
  http_method             = aws_api_gateway_method.post_experience.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.post_experience.invoke_arn
}

# OPTIONS /experiences (CORS preflight)
resource "aws_api_gateway_method" "experiences_options" {
  rest_api_id   = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id   = aws_api_gateway_resource.experiences.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "experiences_options" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id = aws_api_gateway_resource.experiences.id
  http_method = aws_api_gateway_method.experiences_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "experiences_options_200" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id = aws_api_gateway_resource.experiences.id
  http_method = aws_api_gateway_method.experiences_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "experiences_options" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id = aws_api_gateway_resource.experiences.id
  http_method = aws_api_gateway_method.experiences_options.http_method
  status_code = aws_api_gateway_method_response.experiences_options_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# ── /insights resource ────────────────────────────────────────────────────────

resource "aws_api_gateway_resource" "insights" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  parent_id   = aws_api_gateway_rest_api.pathmentor_api.root_resource_id
  path_part   = "insights"
}

resource "aws_api_gateway_method" "get_insights" {
  rest_api_id   = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id   = aws_api_gateway_resource.insights.id
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "get_insights" {
  rest_api_id             = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id             = aws_api_gateway_resource.insights.id
  http_method             = aws_api_gateway_method.get_insights.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.get_insights.invoke_arn
}

resource "aws_api_gateway_method" "insights_options" {
  rest_api_id   = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id   = aws_api_gateway_resource.insights.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "insights_options" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id = aws_api_gateway_resource.insights.id
  http_method = aws_api_gateway_method.insights_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "insights_options_200" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id = aws_api_gateway_resource.insights.id
  http_method = aws_api_gateway_method.insights_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "insights_options" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id = aws_api_gateway_resource.insights.id
  http_method = aws_api_gateway_method.insights_options.http_method
  status_code = aws_api_gateway_method_response.insights_options_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'GET,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# ── /generate-plan resource ───────────────────────────────────────────────────

resource "aws_api_gateway_resource" "generate_plan" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  parent_id   = aws_api_gateway_rest_api.pathmentor_api.root_resource_id
  path_part   = "generate-plan"
}

resource "aws_api_gateway_method" "post_generate_plan" {
  rest_api_id   = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id   = aws_api_gateway_resource.generate_plan.id
  http_method   = "POST"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "post_generate_plan" {
  rest_api_id             = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id             = aws_api_gateway_resource.generate_plan.id
  http_method             = aws_api_gateway_method.post_generate_plan.http_method
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = aws_lambda_function.generate_plan.invoke_arn
}

resource "aws_api_gateway_method" "generate_plan_options" {
  rest_api_id   = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id   = aws_api_gateway_resource.generate_plan.id
  http_method   = "OPTIONS"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "generate_plan_options" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id = aws_api_gateway_resource.generate_plan.id
  http_method = aws_api_gateway_method.generate_plan_options.http_method
  type        = "MOCK"
  request_templates = {
    "application/json" = "{\"statusCode\": 200}"
  }
}

resource "aws_api_gateway_method_response" "generate_plan_options_200" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id = aws_api_gateway_resource.generate_plan.id
  http_method = aws_api_gateway_method.generate_plan_options.http_method
  status_code = "200"
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = true
    "method.response.header.Access-Control-Allow-Methods" = true
    "method.response.header.Access-Control-Allow-Origin"  = true
  }
}

resource "aws_api_gateway_integration_response" "generate_plan_options" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id
  resource_id = aws_api_gateway_resource.generate_plan.id
  http_method = aws_api_gateway_method.generate_plan_options.http_method
  status_code = aws_api_gateway_method_response.generate_plan_options_200.status_code
  response_parameters = {
    "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization'"
    "method.response.header.Access-Control-Allow-Methods" = "'POST,OPTIONS'"
    "method.response.header.Access-Control-Allow-Origin"  = "'*'"
  }
}

# ── Deployment & Stage ────────────────────────────────────────────────────────

resource "aws_api_gateway_deployment" "pathmentor" {
  rest_api_id = aws_api_gateway_rest_api.pathmentor_api.id

  # Force redeployment when any integration changes
  triggers = {
    redeployment = sha1(jsonencode([
      aws_api_gateway_integration.get_experiences,
      aws_api_gateway_integration.post_experience,
      aws_api_gateway_integration.get_insights,
      aws_api_gateway_integration.post_generate_plan,
    ]))
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_api_gateway_integration.get_experiences,
    aws_api_gateway_integration.post_experience,
    aws_api_gateway_integration.get_insights,
    aws_api_gateway_integration.post_generate_plan,
    aws_api_gateway_integration.experiences_options,
    aws_api_gateway_integration.insights_options,
    aws_api_gateway_integration.generate_plan_options,
  ]
}

resource "aws_api_gateway_stage" "prod" {
  deployment_id = aws_api_gateway_deployment.pathmentor.id
  rest_api_id   = aws_api_gateway_rest_api.pathmentor_api.id
  stage_name    = "prod"

  # NOTE: access_log_settings removed — AWS Academy Learner Lab does not allow
  # setting the CloudWatch Logs role ARN in account settings, which is required
  # for API Gateway access logging. Lambda CloudWatch logs still capture all invocations.

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}
