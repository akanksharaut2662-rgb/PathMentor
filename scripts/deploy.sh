#!/bin/bash
# deploy.sh
# Builds the React frontend and deploys it to S3, then invalidates CloudFront.
# Run this AFTER terraform apply has completed.
#
# Usage:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh

set -e

echo "======================================"
echo " PathMentor Frontend Deployment"
echo "======================================"

# ── 1. Read Terraform outputs ─────────────────────────────────────────────────

echo ""
echo "Reading Terraform outputs..."
cd terraform

BUCKET=$(terraform output -raw s3_frontend_bucket 2>/dev/null)
API_URL=$(terraform output -raw api_gateway_url 2>/dev/null)
CF_DIST=$(terraform output -raw cloudfront_url 2>/dev/null)

cd ..

if [ -z "$BUCKET" ]; then
  echo "ERROR: Could not read s3_frontend_bucket from Terraform outputs."
  echo "Make sure you have run 'terraform apply' first."
  exit 1
fi

echo "  S3 Bucket:        $BUCKET"
echo "  API Gateway URL:  $API_URL"
echo "  CloudFront URL:   $CF_DIST"

# ── 2. Write frontend .env ────────────────────────────────────────────────────

echo ""
echo "Writing frontend .env..."
cat > frontend/.env <<EOF
VITE_API_BASE_URL=$API_URL
EOF
echo "  .env written: VITE_API_BASE_URL=$API_URL"

# ── 3. Install dependencies and build ────────────────────────────────────────

echo ""
echo "Installing frontend dependencies..."
cd frontend
npm install --silent

echo ""
echo "Building React app..."
npm run build

echo "  Build complete → dist/"
cd ..

# ── 4. Upload to S3 ──────────────────────────────────────────────────────────

echo ""
echo "Uploading to S3 bucket: $BUCKET"

# Upload everything except HTML first (with long cache)
aws s3 sync frontend/dist/ s3://$BUCKET/ \
  --exclude "*.html" \
  --cache-control "public,max-age=31536000,immutable" \
  --delete \
  --quiet

# Upload HTML files with no-cache (so new deploys take effect immediately)
aws s3 sync frontend/dist/ s3://$BUCKET/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "no-cache,no-store,must-revalidate" \
  --quiet

echo "  Upload complete."

# ── 5. Invalidate CloudFront cache ────────────────────────────────────────────

echo ""
echo "Invalidating CloudFront cache..."

# Get distribution ID from terraform
cd terraform
CF_ID=$(terraform output -raw cloudfront_url 2>/dev/null | sed 's|https://||' | cut -d'.' -f1)
cd ..

# Get distribution ID directly via AWS CLI
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?DomainName=='$(cd terraform && terraform output -raw cloudfront_url | sed 's|https://||')'].Id" \
  --output text 2>/dev/null || echo "")

if [ -n "$DIST_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id $DIST_ID \
    --paths "/*" \
    --query "Invalidation.Id" \
    --output text
  echo "  Cache invalidated."
else
  echo "  WARNING: Could not find CloudFront distribution ID. Invalidate manually."
  echo "  Go to: CloudFront console → Distributions → Invalidations → Create"
fi

# ── 6. Done ───────────────────────────────────────────────────────────────────

echo ""
echo "======================================"
echo " Deployment Complete!"
echo "======================================"
echo ""
echo "  Your app is live at:"
echo "  $CF_DIST"
echo ""
echo "  API Base URL:"
echo "  $API_URL"
echo ""
echo "  Next: Seed DynamoDB by SSHing into the EC2 instance or running:"
echo "  python3 backend/seed/seed_data.py"
echo ""