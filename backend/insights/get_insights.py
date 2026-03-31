import json
import os
import sys
from collections import Counter
from decimal import Decimal

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
        "body": json.dumps(body, default=str),
    }


def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj


def handler(event, context):
    """
    GET /insights
    Query params:
      - user_type (required): cs_student | new_grad | professional
      - goal (required): get_coop | get_job | switch_job | improve_skills | get_promotion

    Returns:
      - common_patterns:   what most people do (aggregated)
      - differentiators:   what helped people stand out (top strategies)
      - regrets:           what people wish they had done
      - top_skills:        most mentioned skills for this user_type+goal
      - experience_count:  how many experiences matched
      - top_experiences:   3 highest upvoted full entries for this filter
    """
    try:
        params = event.get("queryStringParameters") or {}
        user_type = params.get("user_type")
        goal = params.get("goal")

        if not user_type or not goal:
            return build_response(400, {
                "error": "Both user_type and goal query parameters are required"
            })

        table = get_experiences_table()

        # Fetch all experiences matching user_type + goal
        filter_expr = Attr("user_type").eq(user_type) & Attr("goal").eq(goal)
        response = table.scan(FilterExpression=filter_expr)
        items = response.get("Items", [])
        items = convert_decimals(items)

        if not items:
            # Fallback: fetch all for this user_type regardless of goal
            fallback_response = table.scan(
                FilterExpression=Attr("user_type").eq(user_type)
            )
            items = convert_decimals(fallback_response.get("Items", []))

        if not items:
            return build_response(200, {
                "common_patterns": [],
                "differentiators": [],
                "regrets": [],
                "top_skills": [],
                "experience_count": 0,
                "top_experiences": [],
                "message": "No experiences found yet for this profile. Be the first to contribute!"
            })

        # ── Pattern Analysis ────────────────────────────────────────────────

        # 1. Common Patterns — what most people do
        common_patterns = [
            {
                "text": item["what_most_people_do"],
                "source_title": item["title"],
            }
            for item in items
            if item.get("what_most_people_do")
        ]

        # 2. Differentiators — what people did differently (highest upvotes first)
        sorted_items = sorted(items, key=lambda x: x.get("upvotes", 0), reverse=True)
        differentiators = [
            {
                "text": item["what_i_did_differently"],
                "source_title": item["title"],
                "upvotes": item.get("upvotes", 0),
            }
            for item in sorted_items
            if item.get("what_i_did_differently")
        ]

        # 3. Regrets — what people wish they had done
        regrets = [
            {
                "text": item["what_i_regret"],
                "source_title": item["title"],
                "upvotes": item.get("upvotes", 0),
            }
            for item in sorted_items
            if item.get("what_i_regret")
        ]

        # 4. Top Skills — most frequently mentioned across matching experiences
        all_skills = []
        for item in items:
            skills = item.get("skills_involved", [])
            if isinstance(skills, list):
                all_skills.extend([s.strip() for s in skills if s.strip()])

        skill_counts = Counter(all_skills)
        top_skills = [
            {"skill": skill, "count": count}
            for skill, count in skill_counts.most_common(10)
        ]

        # 5. Top 3 full experiences by upvotes
        top_experiences = sorted_items[:3]

        return build_response(200, {
            "user_type": user_type,
            "goal": goal,
            "experience_count": len(items),
            "common_patterns": common_patterns[:5],
            "differentiators": differentiators[:5],
            "regrets": regrets[:5],
            "top_skills": top_skills,
            "top_experiences": top_experiences,
        })

    except Exception as e:
        print(f"Error in get_insights: {str(e)}")
        return build_response(500, {"error": "Internal server error", "details": str(e)})