locals {
  auth0_client_ids = {
    "web" = auth0_client.web.client_id
  }
}

resource "auth0_connection" "username_password" {
  name                 = "username-password"
  is_domain_connection = true
  strategy             = "auth0"

  options {
    password_policy                = "excellent"
    brute_force_protection         = true
    enabled_database_customization = false
    import_mode                    = false
    requires_username              = false
    disable_signup                 = false

    password_history {
      enable = true
      size   = 3
    }

    password_no_personal_info {
      enable = true
    }

    password_dictionary {
      enable     = true
      dictionary = ["password", "admin", "1234"]
    }

    password_complexity_options {
      min_length = 12
    }

    validation {
      username {
        min = 10
        max = 40
      }
    }

    mfa {
      active                 = true
      return_enroll_settings = true
    }
  }
}

resource "auth0_connection" "google" {
  name     = "Google"
  strategy = "google-oauth2"

  options {
    scopes                   = ["email", "profile"]
    set_user_root_attributes = "on_each_login"
  }
}

resource "auth0_connection_client" "google" {
  for_each      = local.auth0_client_ids
  connection_id = auth0_connection.google.id
  client_id     = each.value
}

resource "auth0_connection_client" "username-password" {
  for_each      = local.auth0_client_ids
  connection_id = auth0_connection.username_password.id
  client_id     = each.value
}
