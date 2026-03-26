# ── Security Group for EC2 Seed Runner ───────────────────────────────────────

resource "aws_security_group" "seed_runner" {
  name        = "${var.project_name}-seed-runner-sg"
  description = "Security group for PathMentor EC2 seed runner"

  # Allow SSH inbound (restrict to your IP in production)
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  # Allow all outbound (needed to call DynamoDB, S3, pip install)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "All outbound"
  }

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

# ── EC2 Launch Template ───────────────────────────────────────────────────────

resource "aws_launch_template" "seed_runner" {
  name_prefix   = "${var.project_name}-seed-runner-"
  image_id      = var.ec2_ami_id
  instance_type = var.ec2_instance_type

  # Attach LabRole so EC2 can call DynamoDB + S3 without hardcoded credentials
  iam_instance_profile {
    arn = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:instance-profile/LabInstanceProfile"
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.seed_runner.id]
  }

  # User data: install Python, boto3, copy seed file from S3, run seeder
  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -e
    yum update -y
    yum install -y python3 python3-pip
    pip3 install boto3

    # Copy seed data from S3
    aws s3 cp s3://${aws_s3_bucket.seed_data.bucket}/experiences.json /home/ec2-user/experiences.json

    # Download seed script from S3
    aws s3 cp s3://${aws_s3_bucket.seed_data.bucket}/seed_data.py /home/ec2-user/seed_data.py

    # Run seed script
    cd /home/ec2-user
    python3 seed_data.py \
      --table ${aws_dynamodb_table.experiences.name} \
      --region ${var.aws_region} \
      --seed-file experiences.json \
      2>&1 | tee /var/log/seed_data.log

    echo "Seed complete at $(date)" >> /var/log/seed_data.log
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name      = "${var.project_name}-seed-runner"
      Project   = var.project_name
      ManagedBy = "Terraform"
    }
  }

  tags = {
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

# ── EC2 Seed Runner Instance (standalone for direct SSH access) ───────────────

resource "aws_instance" "seed_runner" {
  ami                    = var.ec2_ami_id
  instance_type          = var.ec2_instance_type
  vpc_security_group_ids = [aws_security_group.seed_runner.id]

  iam_instance_profile = "LabInstanceProfile"

  associate_public_ip_address = true

  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -e
    yum update -y
    yum install -y python3 python3-pip
    pip3 install boto3

    # Copy seed data from S3
    aws s3 cp s3://${aws_s3_bucket.seed_data.bucket}/experiences.json /home/ec2-user/experiences.json
    aws s3 cp s3://${aws_s3_bucket.seed_data.bucket}/seed_data.py /home/ec2-user/seed_data.py

    cd /home/ec2-user
    python3 seed_data.py \
      --table ${aws_dynamodb_table.experiences.name} \
      --region ${var.aws_region} \
      --seed-file experiences.json \
      2>&1 | tee /var/log/seed_data.log

    echo "Seed complete at $(date)" >> /var/log/seed_data.log
  EOF
  )

  tags = {
    Name      = "${var.project_name}-seed-runner"
    Project   = var.project_name
    ManagedBy = "Terraform"
  }

  depends_on = [
    aws_s3_object.experiences_seed,
    aws_dynamodb_table.experiences,
  ]
}

# ── Auto Scaling Group (satisfies EC2 Auto Scaling requirement) ───────────────

resource "aws_autoscaling_group" "seed_runner" {
  name                = "${var.project_name}-seed-runner-asg"
  min_size            = 0
  max_size            = 1
  desired_capacity    = 0 # Stays at 0 — spun up manually when re-seeding needed
  availability_zones  = ["${var.aws_region}a"]

  launch_template {
    id      = aws_launch_template.seed_runner.id
    version = "$Latest"
  }

  tag {
    key                 = "Project"
    value               = var.project_name
    propagate_at_launch = true
  }

  tag {
    key                 = "ManagedBy"
    value               = "Terraform"
    propagate_at_launch = true
  }
}

# ── Data source: get current AWS account ID ───────────────────────────────────

data "aws_caller_identity" "current" {}

# ── Upload seed_data.py to S3 so EC2 can download it ─────────────────────────

resource "aws_s3_object" "seed_script" {
  bucket       = aws_s3_bucket.seed_data.id
  key          = "seed_data.py"
  source       = "${path.module}/../backend/seed/seed_data.py"
  content_type = "text/x-python"
  etag         = filemd5("${path.module}/../backend/seed/seed_data.py")
}
