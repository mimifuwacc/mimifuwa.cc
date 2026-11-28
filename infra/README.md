# Preview infrastructure

This Terraform root manages the `preview` GitHub Actions environment and the
`preview.mimifuwa.cc` Worker custom domain in `mimifuwa.cc`. Production
configuration lives in the `mimifuwa.cc-content`
repository so each repository owns its own deployment settings.

| Setting                                         | Source                                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| Preview URL (`SITE_URL`)                        | Terraform variable                                                        |
| Cloudflare account ID (`CLOUDFLARE_ACCOUNT_ID`) | Terraform-managed GitHub environment variable                             |
| Worker name (`CLOUDFLARE_WORKER_NAME`)          | GitHub Actions variable and Terraform input                               |
| Cloudflare zone ID                              | Terraform variable                                                        |
| Cloudflare API token                            | GitHub environment secret; export as `CLOUDFLARE_API_TOKEN` for Terraform |

Void declares and deploys Worker code, bindings, and generated static assets in
`apps/web/void.config.ts`. This Terraform root does not manage Worker scripts.

## Adopt existing settings

1. Enter `nix develop` (it provides OpenTofu and GitHub CLI), then authenticate
   with `gh auth login`.
2. Export `GITHUB_TOKEN` with administration permission for `mimifuwa.cc`
   (for example, `export GITHUB_TOKEN="$(gh auth token)"`).
   Export a Cloudflare API token with Workers Scripts edit and zone read access
   as `CLOUDFLARE_API_TOKEN` for the OpenTofu provider.
3. Copy `terraform.tfvars.example` to `terraform.tfvars` and set the
   Cloudflare account ID and `mimifuwa.cc` zone ID.
4. Run `tofu init`.
5. Import the existing environment, then inspect the plan before applying:

   ```sh
   tofu import github_repository_environment.preview mimifuwa.cc:preview
   tofu plan
   ```

   Import variables only if they already exist in `preview`:

   ```sh
   tofu import github_actions_environment_variable.site_url mimifuwa.cc:preview:SITE_URL
   tofu import github_actions_environment_variable.cloudflare_account_id mimifuwa.cc:preview:CLOUDFLARE_ACCOUNT_ID
   tofu import github_actions_environment_variable.cloudflare_worker_name mimifuwa.cc:preview:CLOUDFLARE_WORKER_NAME
   ```

   Repository-level variables do not need importing. Apply only after
   confirming the plan has no resource replacement or deletion.

6. After the preview Worker has been deployed once, apply the custom domain
   and GitHub environment configuration. The Cloudflare token used by OpenTofu
   needs permission to edit Workers and read the zone. Import the custom domain
   first if `preview.mimifuwa.cc` already exists. Cloudflare's custom domain
   API cannot attach a hostname while it has a conflicting CNAME record; check
   and remove a conflicting record before applying, if present.

   ```sh
   tofu import cloudflare_workers_custom_domain.preview ACCOUNT_ID/DOMAIN_ID
   tofu plan
   tofu apply
   ```

7. Set the preview token without putting it in Terraform state:

   ```sh
   gh secret set CLOUDFLARE_API_TOKEN --repo mimifuwacc/mimifuwa.cc --env preview
   ```

`gh secret set` prompts for the value securely or reads it from standard input.
The preview token should have only the Cloudflare permissions needed for the
preview Worker and its content storage.

Terraform state contains account metadata. Keep state out of Git and use an
encrypted, access-controlled backend before running Terraform from multiple
machines.

The GitHub provider can manage environment variables but cannot retrieve
secret values. Keep `CLOUDFLARE_API_TOKEN` out of Terraform and add it with
`gh secret set` as shown above.
