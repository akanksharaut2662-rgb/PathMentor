import json
import os
import sys
import boto3

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from shared.db_client import get_experiences_table
from boto3.dynamodb.conditions import Attr
from decimal import Decimal


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


def convert_decimals(obj):
    if isinstance(obj, list):
        return [convert_decimals(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    return obj


def get_bedrock_client():
    region = os.environ.get("BEDROCK_REGION", "ca-central-1")
    return boto3.client("bedrock-runtime", region_name=region)


def fetch_relevant_experiences(user_type, goal):
    """Fetch top 5 relevant experiences to inject as context into the prompt."""
    try:
        table = get_experiences_table()
        filter_expr = Attr("user_type").eq(user_type) & Attr("goal").eq(goal)
        response = table.scan(FilterExpression=filter_expr)
        items = convert_decimals(response.get("Items", []))
        items.sort(key=lambda x: x.get("upvotes", 0), reverse=True)
        return items[:5]
    except Exception as e:
        print(f"Could not fetch experiences for context: {e}")
        return []


def build_prompt(user_context, experiences):
    """
    Builds a structured prompt for Claude via Bedrock.
    user_context contains:
      - user_type, goal, current_role, courses, skills, time_availability, additional_context
    """
    user_type = user_context.get("user_type", "professional")
    goal = user_context.get("goal", "improve skills")
    current_role = user_context.get("current_role", "Not specified")
    courses = user_context.get("courses", [])
    skills = user_context.get("skills", [])
    time_availability = user_context.get("time_availability", "Not specified")
    additional_context = user_context.get("additional_context", "")

    # Format community experiences as context
    experience_context = ""
    for i, exp in enumerate(experiences, 1):
        experience_context += f"""
Experience {i}: "{exp.get('title', '')}"
- What most people do: {exp.get('what_most_people_do', '')}
- What this person did differently: {exp.get('what_i_did_differently', '')}
- Their regret: {exp.get('what_i_regret', '')}
- Outcome: {exp.get('outcome', '')}
"""

    prompt = f"""You are PathMentor, an expert career advisor that helps people differentiate themselves and achieve their goals faster.

A user has provided their profile. Using insights from real community experiences AND your own expertise, generate a personalized, actionable roadmap.

## User Profile
- Role: {user_type.replace('_', ' ').title()}
- Current Role/Situation: {current_role}
- Goal: {goal.replace('_', ' ').title()}
- Current Courses: {', '.join(courses) if courses else 'None listed'}
- Current Skills: {', '.join(skills) if skills else 'None listed'}
- Weekly Time Available: {time_availability}
- Additional Context: {additional_context if additional_context else 'None'}

## Real Community Experiences (what people in similar situations actually did)
{experience_context if experience_context else "No matching experiences yet — use your expertise."}

## Your Task
Generate a personalized roadmap with EXACTLY this JSON structure and nothing else:

{{
  "summary": "2-3 sentence summary of their situation and what will make them stand out",
  "common_path_warning": "What most people in their situation do wrong or follow that won't differentiate them",
  "unique_strategies": [
    {{
      "title": "Strategy title",
      "description": "What to do and why it differentiates them specifically",
      "time_to_start": "This week | This month | In 1-3 months",
      "effort": "Low | Medium | High",
      "impact": "Low | Medium | High"
    }}
  ],
  "week_by_week_plan": [
    {{
      "week_range": "Week 1-2",
      "focus": "Focus area",
      "actions": ["Action 1", "Action 2", "Action 3"]
    }},
    {{
      "week_range": "Week 3-4",
      "focus": "Focus area",
      "actions": ["Action 1", "Action 2", "Action 3"]
    }},
    {{
      "week_range": "Month 2",
      "focus": "Focus area",
      "actions": ["Action 1", "Action 2", "Action 3"]
    }},
    {{
      "week_range": "Month 3",
      "focus": "Focus area",
      "actions": ["Action 1", "Action 2", "Action 3"]
    }}
  ],
  "regret_avoidance_tips": [
    "Specific tip based on what people regret in similar situations"
  ],
  "differentiator_score": {{
    "current": 2,
    "potential": 8,
    "explanation": "Brief explanation of current vs potential differentiation score out of 10"
  }}
}}

Respond with ONLY valid JSON. No markdown, no explanation, no preamble."""

    return prompt


def handler(event, context):
    """
    POST /generate-plan
    Body:
      - user_type (required)
      - goal (required)
      - current_role (required)
      - skills (list, optional)
      - courses (list, optional)
      - time_availability (string, optional)
      - additional_context (string, optional)
    """
    try:
        if event.get("httpMethod") == "OPTIONS":
            return build_response(200, {})

        body = json.loads(event.get("body") or "{}")

        user_type = body.get("user_type")
        goal = body.get("goal")

        if not user_type or not goal:
            return build_response(400, {
                "error": "user_type and goal are required"
            })

        # Fetch relevant community experiences for context
        experiences = fetch_relevant_experiences(user_type, goal)

        # Build the prompt
        prompt = build_prompt(body, experiences)

        # Call Amazon Bedrock — Claude 3 Haiku
        bedrock = get_bedrock_client()
        model_id = os.environ.get("BEDROCK_MODEL_ID", "anthropic.claude-3-haiku-20240307-v1:0")

        bedrock_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 2000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }

        response = bedrock.invoke_model(
            modelId=model_id,
            body=json.dumps(bedrock_body),
            contentType="application/json",
            accept="application/json"
        )

        response_body = json.loads(response["body"].read())
        raw_text = response_body["content"][0]["text"].strip()

        # Parse the JSON response from Bedrock
        # Strip markdown fences if model added them
        if raw_text.startswith("```"):
            raw_text = raw_text.split("```")[1]
            if raw_text.startswith("json"):
                raw_text = raw_text[4:]
        raw_text = raw_text.strip()

        roadmap = json.loads(raw_text)

        print(f"Plan generated for user_type={user_type}, goal={goal}")

        return build_response(200, {
            "roadmap": roadmap,
            "context_experiences_used": len(experiences),
            "user_profile": {
                "user_type": user_type,
                "goal": goal,
                "current_role": body.get("current_role", ""),
            }
        })

    except json.JSONDecodeError as e:
        print(f"JSON parse error from Bedrock response: {e}")
        return build_response(500, {
            "error": "Failed to parse AI response",
            "details": str(e)
        })
    except Exception as e:
        print(f"Error in generate_plan: {str(e)}")
        return build_response(500, {"error": "Internal server error", "details": str(e)})
