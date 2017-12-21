variable "region" {
    default = "us-east-1"
}
variable "aws_access_key" {}
variable "aws_secret_key" {}

variable "newsite-ami" {}
variable "newsite-es6-ami" {
  default = "ami-dc1860cb"
}
variable "elb-subnets" {
  default = "subnet-42435904,subnet-3949b04e,subnet-1d64bc36"
}
variable "nix-vpc-id" {
  default = "vpc-01cf1764"
}
variable "count" {
  default = 2
}
variable "newsite-user" {
  default = "newsite"
}
variable "path-to-newsite-ssh-key" {}
variable "newsite-keypair-name" {
  default = "nix-NewSiteDesign"
}
variable "set-hostname-script" {
  default = "setHost.sh"
}
variable "nixinternal-zone-id" {
  default = "/hostedzone/ZCLOT67SKK1RX"
}
variable "route-53-newsite-elb-dns-name" {
  default = "newsite-elb.nixinternal.com"
}
variable "route-53-newsite-staging-elb-dns-name" {
  default = "newsite-staging-elb.nixinternal.com"
}
