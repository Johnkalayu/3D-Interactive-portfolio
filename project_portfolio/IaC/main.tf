///  aws route53 and acm cert resources

resource "aws_route53domains_registered_domain" "portfolio_domain" {
    domain_name = "jonikalayu.com"
    auto_renew = false
}

data "aws_route53_zone" "host_zone" {
    name         = "jonikalayu.com."
    private_zone = false
}

/// ACM certificate resource
resource "aws_acm_certificate" "portfolio_cert" {
    domain_name       = "jonikalayu.com"
    validation_method = "DNS"
    lifecycle {
        create_before_destroy = true
    }
}

/// route53 record for alb alias
resource "aws_route53_record" "portfolio_record" {
    zone_id = data.aws_route53_zone.host_zone.zone_id
    name    = "www"
    type    = "A"
    alias {
        name                   = aws_alb.portfolio_alb.dns_name
        zone_id                = aws_alb.portfolio_alb.zone_id
        evaluate_target_health = true
    }
}

/// acm cert validation resources
resource "aws_acm_certificate_validation" "portfolio_cert_validation" {
    certificate_arn         = aws_acm_certificate.portfolio_cert.arn
    validation_record_fqdns = [for dvo in aws_acm_certificate.portfolio_cert.domain_validation_options : aws_route53_record.portfolio_validation[dvo.domain_name].fqdn]
}



/// VPC module with Internet Gateway included
module "aws_vpc" {
    source = "terraform-aws-modules/vpc/aws"

    name = "portfolio-vpc"
    cidr = "192.168.0.0/16"

    azs             = ["ap-southeast-2a"]
    public_subnets  = ["192.168.1.0/24"]
    database_subnets = ["192.168.2.0/24"]

    enable_dns_hostnames = true
    enable_dns_support   = true

    create_igw = true
}

/// alb security group resource
resource "aws_security_group" "portfolio_alb_sg" {
    name        = "portfolio_alb_sg"
    description = "allow http traffic to alb"
    vpc_id     = module.aws_vpc.vpc_id

    ingress {
        description = "Allow HTTP from anywhere"
        from_port   = 80
        to_port     = 80
        protocol    = "TCP"
        cidr_blocks = ["0.0.0.0/0"]
    }

    ingress {
        description = "Allow HTTPS from anywhere"
        from_port   = 443
        to_port     = 443
        protocol    = "TCP"
        cidr_blocks = ["0.0.0.0/0"]
    }

    egress {
        description = "Allow all outbound traffic"
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

/// alb resource
resource "aws_lb" "portfolio_alb" {
    name               = "portfolio-alb"
    internal           = false
    load_balancer_type = "application"
    security_groups   = [aws_security_group.portfolio_alb_sg.id]
    subnets           = module.aws_vpc.public_subnets

    tags = {
        name = "portfolio-alb"
    }
}

/// alb target group resource
resource "aws_lb_target_group" "portfolio_alb_tg" {
    name        = "portfolio_alb_tg"
    port        = 8000
    protocol    = "HTTP"
    target_type = "instance"
    vpc_id     = module.aws_vpc.vpc_id

    health_check {
        enabled            = true
        interval           = 30
        path               = "/"
        timeout            = 5
        matcher             = "200"
        healthy_threshold   = 5
        unhealthy_threshold = 2
    }
}

/// alb listener resource
resource "aws_lb_listener" "portfolio_alb_listener" {
    load_balancer_arn = aws_lb.portfolio_alb.arn
    port              = "80"
    protocol          = "HTTP"

    default_action {
        type             = "forward"
        target_group_arn = aws_lb_target_group.portfolio_alb_tg.arn
    }
}

/// ec2 instance and sg resource
resource "aws_security_group" "portfolio_ec2_sg" {
    name        = "portfolio_ec2_sg"
    description = "allow http traffic to ec2 instances"
    vpc_id     = module.aws_vpc.vpc_id

    ingress {
        description = "Allow HTTP from alb security group"
        from_port   = 22
        to_port     = 22
        protocol    = "TCP"
        cidr_blocks = ["101.185.7.47/32"]
    }

    ingress {
        description = "Allow HTTP from alb security group"
        from_port   = 8000
        to_port     = 8000
        protocol    = "TCP"
        security_groups = [aws_security_group.portfolio_alb_sg.id]
    }
    egress {
        description = "Allow all outbound traffic"
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

/// ec2 key pair resource
resource "aws_key_pair" "portfolio_keypair" {
    key_name   = "portfolio_keypair"
    public_key = file("~/.ssh/id_rsa.pub")
}

/// ec2 instance resource
resource "aws_instance" "portfolio_instance" {
    ami = "ami-0c55b159cbfafe1f0"
    instance_type = "t2.small"
    availability_zone = "ap-southeast-2a"
    subnet_id = module.aws_vpc.public_subnets[0]
    vpc_security_group_ids = [aws_security_group.portfolio_ec2_sg.id]
    key_name = aws_key_pair.portfolio_keypair.key_name
    user_data = file("project_portfolio/IaC/project.sh")

    tags = {
        Name = "portfolio-instance"
    } 
}

/// rds sg resource
resource "aws_security_group" "portfolio_rds_sg" {
    name = "portfolio_rds_sg"
    description = "allow ec2 to access rds"
    vpc_id = module.aws_vpc.vpc_id

    ingress {
        description = "Allow django app from ec2 instances"
        from_port   = 5432
        to_port     = 5432
        protocol    = "TCP"
        security_groups = [aws_security_group.portfolio_ec2_sg.id]
    } 

    egress {
        description = "Allow all outbound traffic"
        from_port   = 0
        to_port     = 0
        protocol    = "-1"
        cidr_blocks = ["0.0.0.0/0"]
    }
}

/// rds postgresql instance resource
resource "aws_db_instance" "portfolio_postgres" {
    identifier = "portfolio-db-1"
    allocated_storage = 20
    auto_minor_version_upgrade  = false 
    engine = "postgres"
    engine_version = "18.1"
    instance_class = "db.t3.micro"
    db_name = "portfolio_db"
    username = "postgres_admin"
    password = ""
    db_subnet_group_name = module.aws_vpc.database_subnets_ids
    vpc_security_group_ids = [aws_security_group.portfolio_rds_sg.id]
    skip_final_snapshot = true
} 


output "ec2_instance_public_ip" {
    value = aws_instance.portfolio_instance.public_ip
}
output "rds_endpoint" {
    value = aws_db_instance.portfolio_postgres.endpoint
}
output "key_pair_id" {
    value = aws_key_pair.portfolio_keypair.id
}