terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
    region = "ap_southeast_2"
    profile = "customprofile"
}


/// run this command to init the provider
/// aws confgure --profile customprofile 
/// terraform init 