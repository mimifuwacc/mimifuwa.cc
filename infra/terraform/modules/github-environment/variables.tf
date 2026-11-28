variable "repository" {
  description = "GitHub repository name (without the owner)."
  type        = string
}

variable "environment" {
  description = "GitHub Actions environment name."
  type        = string
}

variable "variables" {
  description = "Actions variables to manage in the environment."
  type        = map(string)
  default     = {}
}
