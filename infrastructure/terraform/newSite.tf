# AWS provider -----------------------------------------------
provider "aws" {
    access_key = "${var.aws_access_key}"
    secret_key = "${var.aws_secret_key}"
    region = "${var.region}"
}

# Instances -----------------------------------------------

resource "aws_instance" "newsite-es6" {
    ami = "${var.newsite-es6-ami}"
    key_name = "${var.newsite-keypair-name}"
    instance_type = "t2.small"
    count = "${var.count}"
    subnet_id = "${element(split(",", var.elb-subnets), count.index % length(split(",", var.elb-subnets)))}"
    associate_public_ip_address = true
    vpc_security_group_ids = ["${aws_security_group.newsite-sg.id}"]
    tags = {
      Name = "newsite-production-${count.index}"
      deploy-name = "newsite-production"
    }
    provisioner "file" {
      source = "./scripts/${var.set-hostname-script}"
      destination = "/tmp/${var.set-hostname-script}"
    }
    provisioner "remote-exec" {
      inline = ["sudo bash /tmp/${var.set-hostname-script} ${self.tags.Name}"]
    }
    connection {
        user = "ubuntu"
        type = "ssh"
        key_file = "${var.path-to-newsite-ssh-key}"
        host = "${self.private_ip}"
      }
}

#ELBs -----------------------------------------------

resource "aws_elb" "newsite-elb" {
  name = "newsite-elb"

  internal = true
  security_groups = ["${aws_security_group.newsite-elb-sg.id}"]
  subnets = ["${split(",", var.elb-subnets)}"]
  instances = ["${aws_instance.newsite-es6.*.id}"]

  listener {
    instance_port = 80
    instance_protocol = "http"
    lb_port = 80
    lb_protocol = "http"
  }

  health_check {
    healthy_threshold = 2
    unhealthy_threshold = 2
    timeout = 10
    target = "HTTP:80/healthCheck"
    interval = 15
  }
}


#Security Groups -----------------------------------------------

resource "aws_security_group" "newsite-elb-sg" {
  name = "newsite-elb-sg"
  description = "Allow incoming http traffic from php instances"
  vpc_id = "${var.nix-vpc-id}"

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
  egress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    security_groups = ["${aws_security_group.newsite-sg.id}"]
  }
}

resource "aws_security_group" "newsite-sg" {
  name = "newsite-sg"
  description = "Allow incoming http traffic from vpc"
  vpc_id = "${var.nix-vpc-id}"

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

#DNS Records -----------------------------------------------

resource "aws_route53_record" "route-53-newsite-elb-record" {
  zone_id = "${var.nixinternal-zone-id}"
  name = "${var.route-53-newsite-elb-dns-name}"
  type = "A"

  alias {
    name = "${aws_elb.newsite-elb.dns_name}"
    zone_id = "${aws_elb.newsite-elb.zone_id}"
    evaluate_target_health = false
  }

}

