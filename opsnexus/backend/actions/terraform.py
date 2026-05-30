"""
Terraform action handler - mock/demo mode.
Replace with a real Terraform plan output parser when real integrations are enabled.
"""


def handle_terraform(message: str, environment: str) -> dict:
    response = f"""## Terraform Plan Review

**Environment:** {environment.upper()}

---

### Plan Review Checklist
- [ ] Run `terraform plan` and save output: `terraform plan -out=tfplan.binary`
- [ ] Review the plan output for any unexpected **destroy** or **replace** operations
- [ ] Confirm the number of resources to add / change / destroy is expected
- [ ] Look for any data source changes that could affect downstream resources
- [ ] Verify no sensitive variables are printed in plain text in the plan output

### State and Backend Checks
- [ ] Confirm the Terraform state backend is configured correctly in `backend.tf`
- [ ] Run `terraform state list` to review the current managed resources
- [ ] Check if state lock is held by another process: `terraform force-unlock` (requires approval)
- [ ] Verify the remote state version matches the local Terraform version

### Variable Validation
- [ ] Confirm all required variables are set in `terraform.tfvars` or CI/CD variables
- [ ] Verify sensitive variables (tokens, keys, connection strings) are stored in a secret manager, not in code
- [ ] Review variable defaults for unexpected values in the target environment

### Approval Gate
Before running `terraform apply`:
1. Save the plan output for review: `terraform show tfplan.binary > plan_review.txt`
2. Share the plan summary with the infrastructure team lead
3. Get written approval (ticket or chat confirmation)
4. Apply only in a maintenance window if production resources are affected
5. Monitor the apply output and be ready to rollback

```bash
# Safe plan command (read-only)
terraform plan -out=tfplan.binary

# Review plan (read-only)
terraform show tfplan.binary

# Apply only after approval
# terraform apply tfplan.binary
```

---
⚠️ **Human approval required before terraform apply in any environment.**
🔒 *Demo mode — no real Terraform commands have been executed.*"""

    return {
        "summary": "Terraform plan review checklist and approval guidance",
        "response": response,
    }
