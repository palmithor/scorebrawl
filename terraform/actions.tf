resource "auth0_action" "registration" {
  name    = "registration"
  runtime = "node16"

  supported_triggers {
    id      = "post-login"
    version = "v2"
  }

  deploy = true

  secrets {
    name  = "app_base_url"
    value = var.base_url
  }

  code = file("${path.module}/files/registration-action.js")
}


resource "auth0_trigger_binding" "post_login" {

  actions {
    id           = auth0_action.registration.id
    display_name = "User registration action"
  }

  trigger = "post-login"
}

resource "auth0_action" "credentials_exchange" {
  name    = "credentials exchange"
  runtime = "node16"

  supported_triggers {
    id      = "credentials-exchange"
    version = "v2"
  }

  deploy = true

  code = file("${path.module}/files/credentials-exchange-action.js")
}


resource "auth0_trigger_binding" "credentials_exchange" {

  actions {
    id           = auth0_action.credentials_exchange.id
    display_name = "Clien credentials exchange action"
  }

  trigger = "credentials-exchange"
}
