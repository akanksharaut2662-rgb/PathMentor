"""
seed_data.py
------------
Run this script locally OR on the EC2 seed runner instance to load
experiences.json into DynamoDB.

Usage:
  python seed_data.py                        # uses default table name + region
  python seed_data.py --table my-table       # custom table name
  python seed_data.py --region ca-central-1  # custom region
  python seed_data.py --clear                # wipe table before seeding

Requirements:
  pip install boto3
  AWS credentials configured (via env vars or ~/.aws/credentials)
"""

import boto3
import json
import os
import argparse
import sys
from decimal import Decimal
from pathlib import Path


def parse_args():
    parser = argparse.ArgumentParser(description="Seed PathMentor DynamoDB table")
    parser.add_argument("--table", default=os.environ.get("EXPERIENCES_TABLE", "pathmentor-experiences"))
    parser.add_argument("--region", default=os.environ.get("AWS_REGION", "ca-central-1"))
    parser.add_argument("--clear", action="store_true", help="Clear all existing items before seeding")
    parser.add_argument("--seed-file", default=None, help="Path to experiences.json (auto-detected if not set)")
    return parser.parse_args()


def find_seed_file(provided_path=None):
    """Find experiences.json relative to this script."""
    if provided_path:
        path = Path(provided_path)
        if path.exists():
            return path
        raise FileNotFoundError(f"Seed file not found: {provided_path}")

    # Auto-detect: look in ../../seed-data/experiences.json
    script_dir = Path(__file__).parent
    candidates = [
        script_dir / "../../seed-data/experiences.json",
        script_dir / "../../../seed-data/experiences.json",
        Path("seed-data/experiences.json"),
        Path("experiences.json"),
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate.resolve()

    raise FileNotFoundError(
        "Could not find experiences.json. Use --seed-file to specify its path."
    )


def float_to_decimal(obj):
    """Convert floats to Decimal for DynamoDB compatibility."""
    if isinstance(obj, list):
        return [float_to_decimal(i) for i in obj]
    elif isinstance(obj, dict):
        return {k: float_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, int):
        return Decimal(obj)
    return obj


def clear_table(table):
    """Delete all items from the table."""
    print("  Clearing existing items...")
    scan = table.scan(ProjectionExpression="experience_id")
    items = scan.get("Items", [])
    deleted = 0
    with table.batch_writer() as batch:
        for item in items:
            batch.delete_item(Key={"experience_id": item["experience_id"]})
            deleted += 1
    print(f"  Deleted {deleted} existing items.")


def seed(args):
    seed_file = find_seed_file(args.seed_file)
    print(f"Loading seed data from: {seed_file}")

    with open(seed_file, "r") as f:
        experiences = json.load(f)

    print(f"Found {len(experiences)} experiences to seed.")

    dynamodb = boto3.resource("dynamodb", region_name=args.region)
    table = dynamodb.Table(args.table)

    # Verify table exists
    try:
        table.load()
        print(f"Connected to table: {args.table} in {args.region}")
    except dynamodb.meta.client.exceptions.ResourceNotFoundException:
        print(f"ERROR: Table '{args.table}' does not exist in {args.region}.")
        print("Run Terraform first to provision the DynamoDB table.")
        sys.exit(1)

    if args.clear:
        clear_table(table)

    # Batch write all experiences
    success_count = 0
    fail_count = 0

    with table.batch_writer() as batch:
        for exp in experiences:
            try:
                # Convert numbers to Decimal for DynamoDB
                item = float_to_decimal(exp)
                batch.put_item(Item=item)
                success_count += 1
                print(f"  ✓ Seeded: {exp.get('experience_id')} — {exp.get('title', '')[:50]}")
            except Exception as e:
                fail_count += 1
                print(f"  ✗ Failed: {exp.get('experience_id')} — {e}")

    print(f"\nSeeding complete: {success_count} succeeded, {fail_count} failed.")

    if fail_count == 0:
        print("All experiences loaded successfully into DynamoDB.")
    else:
        print(f"WARNING: {fail_count} items failed to load. Check errors above.")
        sys.exit(1)


if __name__ == "__main__":
    args = parse_args()
    seed(args)