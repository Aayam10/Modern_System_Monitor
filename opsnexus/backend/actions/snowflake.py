"""
Snowflake action handler - mock/demo mode.
Replace mock_snowflake integration with a real Snowflake connector when ready.
"""
from integrations.mock_snowflake import MockSnowflakeAdapter

adapter = MockSnowflakeAdapter()


def handle_snowflake(message: str, environment: str) -> dict:
    data = adapter.get_permission_context()
    response = f"""## Snowflake Permission Analysis

**Environment:** {environment.upper()}
**Database:** {data['database']}
**Schema:** {data['schema']}
**User/Role in question:** {data['role']}

---

### Suggested Grant SQL (Review Before Executing)
```sql
-- Verify the target role exists first
SHOW ROLES LIKE '{data['role']}';

-- Grant usage on database
GRANT USAGE ON DATABASE {data['database']} TO ROLE {data['role']};

-- Grant usage on schema
GRANT USAGE ON SCHEMA {data['database']}.{data['schema']} TO ROLE {data['role']};

-- Grant SELECT on all tables in schema
GRANT SELECT ON ALL TABLES IN SCHEMA {data['database']}.{data['schema']} TO ROLE {data['role']};

-- Grant SELECT on future tables
GRANT SELECT ON FUTURE TABLES IN SCHEMA {data['database']}.{data['schema']} TO ROLE {data['role']};
```

### Role Validation Checklist
- [ ] Confirm role `{data['role']}` exists in Snowflake
- [ ] Confirm the requesting user has been assigned this role
- [ ] Verify no conflicting DENY or REVOKE policies exist
- [ ] Confirm warehouse access is granted to the role
- [ ] Check if this role should be added to a role hierarchy

### Database / Schema Confirmation Warning
>  Before executing any GRANT statements, confirm the database and schema names are correct for the **{environment.upper()}** environment. Granting permissions in the wrong environment is not easily reversible.

### Approval Note
All Snowflake permission changes require approval from the data platform owner before execution.

---
 ** approval required before production execution.**
 *Demo mode — no real Snowflake commands have been executed.*"""

    return {
        "summary": f"Snowflake permission analysis for role {data['role']}",
        "response": response,
    }
