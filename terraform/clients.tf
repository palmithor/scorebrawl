locals {
  refresh_token_lifetime  = 604800 # 7 days
  management_api_audience = "https://${var.auth0_domain}/api/v2/"
}

resource "auth0_client" "m2m" {
  name     = "M2M"
  app_type = "non_interactive"
}

resource "auth0_client" "web" {
  name               = "PointUp"
  app_type           = "regular_web"
  initiate_login_uri = ""
  oidc_conformant    = true
  grant_types = [
    "authorization_code",
    "refresh_token"
  ]
  jwt_configuration {
    secret_encoded = true
    alg            = "RS256"
  }
  refresh_token {
    expiration_type     = "expiring"
    rotation_type       = "non-rotating"
    token_lifetime      = local.refresh_token_lifetime
    leeway              = 300                                # 5 minutes
    idle_token_lifetime = (local.refresh_token_lifetime - 1) # idle token lifetime must be less than token lifetime
  }
  is_first_party      = true
  callbacks           = ["http://localhost:3000/api/auth/callback/auth0"]
  allowed_logout_urls = ["http://localhost:3000"]
}

resource "auth0_client_grant" "m2m_management_api" {
  client_id = auth0_client.m2m.id
  audience  = local.management_api_audience
  scope     = []
}
