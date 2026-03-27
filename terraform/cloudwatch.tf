# ── CloudWatch Dashboard ──────────────────────────────────────────────────────

/*
resource "aws_cloudwatch_dashboard" "pathmentor" {
  dashboard_name = "${var.project_name}-dashboard"

  dashboard_body = jsonencode({
    widgets = [
      {
        type = "metric"
        properties = {
          title   = "Lambda Invocations"
          region  = var.aws_region
          period  = 300
          stat    = "Sum"
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.get_experiences.function_name],
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.post_experience.function_name],
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.get_insights.function_name],
            ["AWS/Lambda", "Invocations", "FunctionName", aws_lambda_function.generate_plan.function_name],
          ]
        }
      },
      {
        type = "metric"
        properties = {
          title   = "Lambda Errors"
          region  = var.aws_region
          period  = 300
          stat    = "Sum"
          metrics = [
            ["AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.get_experiences.function_name],
            ["AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.post_experience.function_name],
            ["AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.get_insights.function_name],
            ["AWS/Lambda", "Errors", "FunctionName", aws_lambda_function.generate_plan.function_name],
          ]
        }
      },
      {
        type = "metric"
        properties = {
          title   = "Lambda Duration (ms)"
          region  = var.aws_region
          period  = 300
          stat    = "Average"
          metrics = [
            ["AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.generate_plan.function_name],
            ["AWS/Lambda", "Duration", "FunctionName", aws_lambda_function.get_insights.function_name],
          ]
        }
      },
      {
        type = "metric"
        properties = {
          title   = "DynamoDB Read/Write Capacity"
          region  = var.aws_region
          period  = 300
          stat    = "Sum"
          metrics = [
            ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", aws_dynamodb_table.experiences.name],
            ["AWS/DynamoDB", "ConsumedWriteCapacityUnits", "TableName", aws_dynamodb_table.experiences.name],
          ]
        }
      },
      {
        type = "metric"
        properties = {
          title   = "API Gateway Requests"
          region  = var.aws_region
          period  = 300
          stat    = "Sum"
          metrics = [
            ["AWS/ApiGateway", "Count", "ApiName", aws_api_gateway_rest_api.pathmentor_api.name],
          ]
        }
      },
      {
        type = "metric"
        properties = {
          title   = "API Gateway 5XX Errors"
          region  = var.aws_region
          period  = 300
          stat    = "Sum"
          metrics = [
            ["AWS/ApiGateway", "5XXError", "ApiName", aws_api_gateway_rest_api.pathmentor_api.name],
          ]
        }
      }
    ]
  })
}
*/

# ── CloudWatch Alarms ─────────────────────────────────────────────────────────

# Alarm: generate_plan Lambda errors (Bedrock failures are important to know about)
resource "aws_cloudwatch_metric_alarm" "generate_plan_errors" {
  alarm_name          = "${var.project_name}-generate-plan-errors"
  alarm_description   = "Triggered when generate_plan Lambda has errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.generate_plan.function_name
  }

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

# Alarm: high Lambda duration on plan generation (Bedrock latency)
resource "aws_cloudwatch_metric_alarm" "generate_plan_duration" {
  alarm_name          = "${var.project_name}-generate-plan-high-duration"
  alarm_description   = "Plan generation Lambda is taking longer than expected"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Duration"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Average"
  threshold           = 45000 # 45 seconds in ms
  treat_missing_data  = "notBreaching"

  dimensions = {
    FunctionName = aws_lambda_function.generate_plan.function_name
  }

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

# Alarm: API Gateway 5XX errors
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "${var.project_name}-api-5xx-errors"
  alarm_description   = "API Gateway is returning 5XX errors"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 1
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  treat_missing_data  = "notBreaching"

  dimensions = {
    ApiName = aws_api_gateway_rest_api.pathmentor_api.name
  }

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}
