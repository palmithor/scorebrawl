resource "auth0_resource_server" "main" {
  name       = "PointUp"
  identifier = "https://point.up"

  skip_consent_for_verifiable_first_party_clients = true
  allow_offline_access                            = true
  token_lifetime                                  = 3600
  token_lifetime_for_web                          = 1800
}
