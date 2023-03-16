terraform {
  backend "local" {
    path = "../.terraform.tfstate"
  }
  required_providers {
    auth0 = {
      source  = "auth0/auth0"
      version = "0.43.0"
    }
    null = {
      source  = "hashicorp/null"
      version = "3.2.1"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.4.3"
    }
  }
}

provider "auth0" {
  domain        = var.auth0_domain
  client_id     = var.auth0_client_id
  client_secret = var.auth0_client_secret
  debug         = true
}
