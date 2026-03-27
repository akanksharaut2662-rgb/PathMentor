import json
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from shared.db_client import get_experiences_table
from boto3.dynamodb.conditions import Attr


def build_response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        },
        "body": json.dumps(body),
    }


def handler(event, context):
    """
    GET /experiences
    Query params (all optional):
      - user_type: cs_student | new_grad | professional
      - goal:      get_coop | get_job | switch_job | improve_skills | get_promotion
      - limit:     max number of results (default 20)
    Returns list of experience entries sorted by upvotes descending.
    """
    try:
        table = get_experiences_table()
        params = event.get("queryStringParameters") or {}

        user_type = params.get("user_type")
        goal = params.get("goal")
        limit = int(params.get("limit", 20))

        # Build filter expression dynamically
        filter_expr = None

        if user_type:
            filter_expr = Attr("user_type").eq(user_type)
        if goal:
            goal_filter = Attr("goal").eq(goal)
            filter_expr = filter_expr & goal_filter if filter_expr else goal_filter

        # Scan table (small dataset for demo — acceptable at this scale)
        if filter_expr:
            response = table.scan(FilterExpression=filter_expr)
        else:
            response = table.scan()

        items = response.get("Items", [])

        # Sort by upvotes descending
        items.sort(key=lambda x: int(x.get("upvotes", 0)), reverse=True)

        # Apply limit
        items = items[:limit]

        # Convert Decimal to int/float for JSON serialization
        items = convert_decimals(items)

        return build_response(200, {"experiences": items, "count": len(items)})

    except Exception as e:
        print(f"Error in get_experiences: {str(e)}")
        return build_response(500, {"error": "Internal server error", "details": str(e)})


def convert_decimals(obj):
    """Recursively convert DynamoDB Decimal types to native Python numbers."""
    from decimal import Decimal
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj