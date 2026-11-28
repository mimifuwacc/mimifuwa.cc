variable "github_owner" {
  description = "GitHub account that owns the site repository."
  type        = string
  default     = "mimifuwacc"
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID used for the preview deployment."
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for mimifuwa.cc."
  type        = string
}

variable "preview_site_url" {
  description = "Canonical URL for the preview Worker."
  type        = string
  default     = "https://preview.mimifuwa.cc"
}

variable "preview_worker_name" {
  description = "Cloudflare Worker name used by the preview deployment."
  type        = string
  default     = "mimifuwa-cc-preview"
}

resource "github_repository_environment" "preview" {
  repository  = "mimifuwa.cc"
  environment = "preview"
}

resource "github_actions_environment_variable" "site_url" {
  repository    = "mimifuwa.cc"
  environment   = github_repository_environment.preview.environment
  variable_name = "SITE_URL"
  value         = var.preview_site_url
}

resource "github_actions_environment_variable" "cloudflare_account_id" {
  repository    = "mimifuwa.cc"
  environment   = github_repository_environment.preview.environment
  variable_name = "CLOUDFLARE_ACCOUNT_ID"
  value         = var.cloudflare_account_id
}

resource "github_actions_environment_variable" "cloudflare_worker_name" {
  repository    = "mimifuwa.cc"
  environment   = github_repository_environment.preview.environment
  variable_name = "CLOUDFLARE_WORKER_NAME"
  value         = var.preview_worker_name
}

resource "cloudflare_workers_custom_domain" "preview" {
  account_id = var.cloudflare_account_id
  hostname   = "preview.mimifuwa.cc"
  service    = var.preview_worker_name
  zone_id    = var.cloudflare_zone_id
}
