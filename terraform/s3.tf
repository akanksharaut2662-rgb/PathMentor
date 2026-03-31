# ── Frontend S3 Bucket ──────────────────────────────────────────────────────

resource "aws_s3_bucket" "frontend" {
  bucket = "${var.project_name}-frontend-${random_id.suffix.hex}"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "random_id" "suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
  # Frontend is served via CloudFront only — no direct public S3 access
}

resource "aws_s3_bucket_versioning" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html" # SPA fallback — React Router handles 404s
  }
}

# Bucket policy: only CloudFront OAC can read from this bucket
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id
  policy = data.aws_iam_policy_document.frontend_s3_policy.json
}

data "aws_iam_policy_document" "frontend_s3_policy" {
  statement {
    sid    = "AllowCloudFrontOAC"
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions   = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.frontend.arn]
    }
  }
}

# ── Seed Data S3 Bucket ─────────────────────────────────────────────────────

resource "aws_s3_bucket" "seed_data" {
  bucket = "${var.project_name}-seed-data-${random_id.suffix.hex}"

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "seed_data" {
  bucket = aws_s3_bucket.seed_data.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Upload experiences.json to S3 seed bucket automatically
resource "aws_s3_object" "experiences_seed" {
  bucket       = aws_s3_bucket.seed_data.id
  key          = "experiences.json"
  source       = "${path.module}/../seed-data/experiences.json"
  content_type = "application/json"
  etag         = filemd5("${path.module}/../seed-data/experiences.json")
}
