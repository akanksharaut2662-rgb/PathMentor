# PathMentor

**A Context-Aware Mentorship & Differentiation Platform**

PathMentor combines real community experiences with Amazon Bedrock AI to help students and professionals discover what to do differently — based on their exact situation.

---

## AWS Services Used

| Category       | Service                  | Purpose                                      |
|----------------|--------------------------|----------------------------------------------|
| Compute #1     | AWS Lambda               | All backend API logic (4 functions)          |
| Compute #2     | EC2 + Auto Scaling       | Seed runner — loads DynamoDB with seed data  |
| Storage        | Amazon S3                | Frontend hosting + seed data storage         |
| Networking     | Amazon API Gateway       | REST API routing to Lambda                   |
| Database       | Amazon DynamoDB          | Experiences table (NoSQL, serverless)        |
| Management     | Amazon CloudWatch        | Logs, dashboards, and alarms                 |
| AI (Appendix)  | Amazon Bedrock           | Personalized roadmap generation              |
| CDN            | Amazon CloudFront        | HTTPS + fast frontend delivery               |
| IaC            | Terraform                | Provisions all infrastructure in one step   |

---

## Project Structure

```
pathmentor/
├── seed-data/
│   └── experiences.json          # 20 seed community experiences
├── backend/
│   ├── shared/db_client.py       # Shared DynamoDB boto3 client
│   ├── experiences/
│   │   ├── get_experiences.py    # GET /experiences
│   │   └── post_experience.py    # POST /experiences
│   ├── insights/
│   │   └── get_insights.py       # GET /insights
│   ├── plan/
│   │   └── generate_plan.py      # POST /generate-plan (Bedrock)
│   └── seed/
│       └── seed_data.py          # Seeds DynamoDB from experiences.json
├── terraform/                    # All AWS infrastructure as code
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── dynamodb.tf
│   ├── s3.tf
│   ├── lambda.tf
│   ├── api_gateway.tf
│   ├── cloudfront.tf
│   ├── ec2.tf
│   ├── cloudwatch.tf
│   └── bedrock.tf
├── frontend/                     # React app (Vite)
│   └── src/
│       ├── pages/                # Home, Onboarding, Insights, Roadmap, Experiences
│       ├── components/           # Navbar, ExperienceCard, InsightPanel, etc.
│       ├── api/client.js         # All API Gateway calls
│       └── styles/theme.css      # Global design system
└── scripts/
    └── deploy.sh                 # Build + S3 upload + CloudFront invalidation
```

---

## Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.3.0
- [AWS CLI](https://aws.amazon.com/cli/) configured
- [Node.js](https://nodejs.org/) >= 18
- Python 3.11+ (for local seeding)
- AWS Academy Learner Lab credentials active

---

## Deployment Steps

### Step 1 — Set your AWS credentials

Copy credentials from the AWS Academy Learner Lab "AWS Details" panel:

```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_SESSION_TOKEN=your_token
```

### Step 2 — Update your Account ID in variables.tf

Open `terraform/variables.tf` and replace `ACCOUNT_ID` in `lab_role_arn`:

```hcl
variable "lab_role_arn" {
  default = "arn:aws:iam::123456789012:role/LabRole"  # ← your account ID
}
```

Find your account ID: AWS Console → top-right menu → Account ID.

### Step 3 — Enable Amazon Bedrock model access

1. Go to **AWS Console → Amazon Bedrock → Model Access**
2. Click **Manage model access**
3. Enable **Claude 3 Sonnet** (`anthropic.claude-3-sonnet-20240229-v1:0`)
4. Wait for status = **Access granted** (takes ~1 minute)

### Step 4 — Provision all infrastructure

```bash
cd terraform
mkdir -p .lambda_zips
terraform init
terraform plan
terraform apply -auto-approve
```

This provisions: DynamoDB, Lambda (×4), API Gateway, S3 (×2), CloudFront, EC2 + ASG, CloudWatch.

Takes approximately **3–5 minutes**.

### Step 5 — Deploy the frontend

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

This automatically:
1. Reads `api_gateway_url` from Terraform outputs
2. Writes `frontend/.env`
3. Builds the React app
4. Uploads to S3
5. Invalidates CloudFront cache

### Step 6 — Seed DynamoDB

The EC2 instance automatically seeds DynamoDB on launch via its user data script. To verify:

```bash
# SSH into the EC2 seed runner
EC2_IP=$(cd terraform && terraform output -raw ec2_seed_runner_public_ip)
ssh -i your-key.pem ec2-user@$EC2_IP
cat /var/log/seed_data.log
```

Or seed locally:

```bash
pip install boto3
python3 backend/seed/seed_data.py \
  --table pathmentor-experiences \
  --region us-east-1
```

### Step 7 — Open your app

```bash
cd terraform && terraform output cloudfront_url
```

Open that URL in your browser.

---

## API Endpoints

| Method | Path             | Description                          |
|--------|------------------|--------------------------------------|
| GET    | /experiences     | List experiences (filterable)        |
| POST   | /experiences     | Submit a new community experience    |
| GET    | /insights        | Pattern analysis for user_type+goal  |
| POST   | /generate-plan   | AI roadmap via Amazon Bedrock        |

**Query params for GET /experiences:**
- `user_type`: `cs_student` | `new_grad` | `professional`
- `goal`: `get_coop` | `get_job` | `switch_job` | `improve_skills` | `get_promotion`
- `limit`: integer (default 20)

---

## Teardown

To destroy all AWS resources:

```bash
cd terraform
terraform destroy -auto-approve
```

---

## Notes for AWS Academy Learner Lab

- Do **not** hardcode credentials — use environment variables
- Use the existing **LabRole** IAM role (already configured in `variables.tf` and `ec2.tf`)
- Session tokens expire — re-export credentials if Terraform fails with auth errors
- Bedrock model access must be enabled manually before running the plan generator