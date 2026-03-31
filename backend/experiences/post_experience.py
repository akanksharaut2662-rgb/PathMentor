import json
import os
import sys
import uuid
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from shared.db_client import get_experiences_table


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


VALID_USER_TYPES = {"cs_student", "new_grad", "professional"}
VALID_GOALS = {"get_coop", "get_job", "switch_job", "improve_skills", "get_promotion"}

REQUIRED_FIELDS = [
    "user_type",
    "goal",
    "title",
    "what_i_did",
    "what_most_people_do",
    "what_i_did_differently",
    "what_i_regret",
]


def handler(event, context):
    """
    POST /experiences
    Body (JSON):
      - user_type (required)
      - goal (required)
      - title (required)
      - what_i_did (required)
      - what_most_people_do (required)
      - what_i_did_differently (required)
      - what_i_regret (required)
      - skills_involved (optional list)
      - time_investment (optional string)
      - outcome (optional string)
      - tags (optional list)
    """
    try:
        # Handle preflight OPTIONS
        if event.get("httpMethod") == "OPTIONS":
            return build_response(200, {})

        body = json.loads(event.get("body") or "{}")

        # Validate required fields
        missing = [f for f in REQUIRED_FIELDS if not body.get(f)]
        if missing:
            return build_response(400, {
                "error": "Missing required fields",
                "missing_fields": missing
            })

        # Validate enum values
        if body["user_type"] not in VALID_USER_TYPES:
            return build_response(400, {
                "error": f"Invalid user_type. Must be one of: {', '.join(VALID_USER_TYPES)}"
            })

        if body["goal"] not in VALID_GOALS:
            return build_response(400, {
                "error": f"Invalid goal. Must be one of: {', '.join(VALID_GOALS)}"
            })

        # Build experience item
        experience_id = f"exp_{uuid.uuid4().hex[:8]}"
        now = datetime.now(timezone.utc).isoformat()

        item = {
            "experience_id": experience_id,
            "user_type": body["user_type"],
            "goal": body["goal"],
            "title": body["title"].strip(),
            "what_i_did": body["what_i_did"].strip(),
            "what_most_people_do": body["what_most_people_do"].strip(),
            "what_i_did_differently": body["what_i_did_differently"].strip(),
            "what_i_regret": body["what_i_regret"].strip(),
            "skills_involved": body.get("skills_involved", []),
            "time_investment": body.get("time_investment", ""),
            "outcome": body.get("outcome", ""),
            "tags": body.get("tags", []),
            "upvotes": 0,
            "created_at": now,
            "is_user_submitted": True,
        }

        table = get_experiences_table()
        table.put_item(Item=item)

        print(f"New experience submitted: {experience_id} by user_type={body['user_type']}")

        return build_response(201, {
            "message": "Experience submitted successfully",
            "experience_id": experience_id,
        })

    except json.JSONDecodeError:
        return build_response(400, {"error": "Invalid JSON in request body"})
    except Exception as e:
        print(f"Error in post_experience: {str(e)}")
        return build_response(500, {"error": "Internal server error", "details": str(e)})