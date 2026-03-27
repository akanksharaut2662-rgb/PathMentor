import boto3
import os

def get_dynamodb_resource():
    """
    Returns a boto3 DynamoDB resource.
    Uses the AWS region from environment variable or defaults to ca-central-1.
    In Lambda, credentials are automatically provided via the execution role (LabRole).
    """
    region = os.environ.get("AWS_REGION", "ca-central-1")
    return boto3.resource("dynamodb", region_name=region)

def get_experiences_table():
    """Returns the DynamoDB Table resource for experiences."""
    dynamodb = get_dynamodb_resource()
    table_name = os.environ.get("EXPERIENCES_TABLE", "pathmentor-experiences")
    return dynamodb.Table(table_name)