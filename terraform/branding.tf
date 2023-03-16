resource "auth0_prompt" "main" {
  universal_login_experience = "new"
  # Setting this to true is required for passwordless
  identifier_first               = false
  webauthn_platform_first_factor = false
}

resource "auth0_branding_theme" "main" {
  borders {
    button_border_radius = 1
    button_border_weight = 1
    buttons_style        = "sharp"
    input_border_radius  = 3
    input_border_weight  = 1
    inputs_style         = "sharp"
    show_widget_shadow   = true
    widget_border_weight = 0
    widget_corner_radius = 5
  }

  colors {
    body_text                 = "#1e212a"
    error                     = "#d03c38"
    header                    = "#1e212a"
    icons                     = "#65676e"
    input_background          = "#ffffff"
    input_border              = "#c9cace"
    input_filled_text         = "#000000"
    input_labels_placeholders = "#65676e"
    links_focused_components  = "#635dff"
    primary_button            = "#003366"
    primary_button_label      = "#ffffff"
    secondary_button_border   = "#c9cace"
    secondary_button_label    = "#1e212a"
    success                   = "#13a688"
    widget_background         = "#ffffff"
    widget_border             = "#c9cace"
  }

  fonts {
    font_url            = "https://google.com/font.woff"
    links_style         = "normal"
    reference_text_size = 16

    body_text {
      bold = false
      size = 87.5
    }

    buttons_text {
      bold = false
      size = 100
    }

    input_labels {
      bold = false
      size = 100
    }

    links {
      bold = true
      size = 87.5
    }

    title {
      bold = false
      size = 150
    }

    subtitle {
      bold = false
      size = 87.5
    }
  }

  page_background {
    background_color     = "#F1F5FA"
    page_layout          = "center"
    background_image_url = ""
  }

  widget {
    header_text_alignment = "center"
    logo_height           = 55
    logo_position         = "center"
    logo_url              = "https://lh6.googleusercontent.com/J-d4iaaWdvc_4YwHMfGK0kAIohuNrOh7rYOEGGtiMovY0kp5SIO04XYgAWvJ_N6MgM0=w2400"
    social_buttons_layout = "top"
  }
}

resource "auth0_prompt_custom_text" "login_english" {
  prompt   = "login"
  language = "en"
  body = jsonencode(
    {
      "login" : {
        "alertListTitle" : "Alerts",
        "buttonText" : "Continue",
        "description" : "Login to",
        "editEmailText" : "Edit",
        "emailPlaceholder" : "Email address",
        "federatedConnectionButtonText" : "Continue with $${connectionName}",
        "footerLinkText" : "Sign up",
        "footerText" : "Don't have an account?",
        "forgotPasswordText" : "Forgot password?",
        "invitationDescription" : "Log in to accept $${inviterName}'s invitation to join $${companyName} on $${clientName}.",
        "invitationTitle" : "You've Been Invited!",
        "logoAltText" : "$${companyName}",
        "pageTitle" : "Log in | $${clientName}",
        "passwordPlaceholder" : "Password",
        "separatorText" : "Or",
        "signupActionLinkText" : "$${footerLinkText}",
        "signupActionText" : "$${footerText}",
        "title" : "Welcome",
        "usernamePlaceholder" : "Username or email address"
      }
    }
  )
}
