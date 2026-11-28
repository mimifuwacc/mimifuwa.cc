resource "github_repository_environment" "this" {
  repository  = var.repository
  environment = var.environment
}

resource "github_actions_environment_variable" "this" {
  for_each = var.variables

  repository    = var.repository
  environment   = github_repository_environment.this.environment
  variable_name = each.key
  value         = each.value
}
