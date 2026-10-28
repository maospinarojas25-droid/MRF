# Security policy

## Reporting a vulnerability

Please report suspected security vulnerabilities privately through GitHub's
"Report a vulnerability" feature on this repository. Do not publish exploit
details, credentials, or personal data in a public issue.

## Supported deployment

The production site is deployed through Vercel. Preview deployments are for
testing and must use the separate QA Supabase project.

## Secret handling

- Never commit passwords, Supabase secret/service-role keys, access tokens, or
  private keys.
- The browser app may contain only the Supabase project URL and publishable key;
  database access must be restricted by Row Level Security policies.
- If a secret is exposed, revoke/rotate it at its provider immediately. Deleting
  it from the latest commit does not remove it from Git history.
