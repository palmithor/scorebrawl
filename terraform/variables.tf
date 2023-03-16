variable "auth0_domain" {
  type = string
}

variable "auth0_client_id" {
  type = string
}

variable "auth0_client_secret" {
  type      = string
  sensitive = true
}

#
variable "base_url" {
  type    = string
  default = "http://localhost:3000"
}
