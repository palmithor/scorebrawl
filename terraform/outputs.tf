output "domain" {
  value = var.auth0_domain
}

output "web_client_id" {
  value = auth0_client.web.client_id
}

output "web_client_secret" {
  value     = auth0_client.web.client_secret
  sensitive = true
}

output "audience" {
  value = auth0_resource_server.main.identifier
}
