data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-2.0.*-x86_64-gp2"]
  }
}

# ── Look up the default VPC ───────────────────────────────────────────────────

data "aws_vpc" "default" {
  default = true
}

# ── Security Group for EC2 Seed Runner ───────────────────────────────────────

resource "aws_security_group" "seed_runner" {
  name        = "${var.project_name}-seed-runner-${random_id.suffix.hex}-sg"
  description = "Security group for PathMentor EC2 seed runner"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

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

# ── EC2 Launch Template (satisfies Compute #2 requirement) ───────────────────

resource "aws_launch_template" "seed_runner" {
  name_prefix   = "${var.project_name}-seed-runner-"
  image_id      = data.aws_ami.amazon_linux.id
  instance_type = var.ec2_instance_type

  network_interfaces {
    associate_public_ip_address = true
    security_groups             = [aws_security_group.seed_runner.id]
  }

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

# ── EC2 Seed Runner Instance ──────────────────────────────────────────────────

resource "aws_instance" "seed_runner" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = var.ec2_instance_type
  vpc_security_group_ids      = [aws_security_group.seed_runner.id]
  associate_public_ip_address = true

  tags = {
    Name      = "${var.project_name}-seed-runner"
    Project   = var.project_name
    ManagedBy = "Terraform"
  }
}

# ── Auto Scaling Group ────────────────────────────────────────────────────────

resource "aws_autoscaling_group" "seed_runner" {
  name               = "${var.project_name}-seed-runner-asg"
  min_size           = 0
  max_size           = 1
  desired_capacity   = 0
  availability_zones = ["${var.aws_region}a"]

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

# ── Upload seed files to S3 ───────────────────────────────────────────────────

resource "aws_s3_object" "seed_script" {
  bucket       = aws_s3_bucket.seed_data.id
  key          = "seed_data.py"
  source       = "${path.module}/../backend/seed/seed_data.py"
  content_type = "text/x-python"
  etag         = filemd5("${path.module}/../backend/seed/seed_data.py")
}
