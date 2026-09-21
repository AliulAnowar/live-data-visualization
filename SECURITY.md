# Security Policy

## Supported Versions

This project is actively maintained on the `main` branch. Security fixes, when applicable, are made against the latest version.

| Version | Supported |
| --- | --- |
| `main` | ✅ |
| Older commits | ❌ |

## Reporting a Vulnerability

Please do **not** report security vulnerabilities in a public issue.

If GitHub's private vulnerability reporting is enabled for this repository, use the **Security** tab and choose **Report a vulnerability**. Otherwise, contact the repository owner privately through GitHub before disclosing the issue publicly.

When reporting, include:

- A clear description of the vulnerability
- Steps to reproduce it
- The affected file, workflow, or commit
- Potential impact
- Any suggested remediation

Please avoid including passwords, access tokens, personal data, or other secrets in the report.

## Response Process

We will acknowledge a valid private report as soon as practical, investigate and reproduce the issue, and coordinate a fix or mitigation. Please allow reasonable time for remediation before making details public.

## Repository Security Practices

- Keep GitHub Actions dependencies and third-party packages up to date.
- Use the minimum permissions required by workflows.
- Never commit passwords, API keys, access tokens, or other secrets.
- Store sensitive values in GitHub Actions secrets or environment variables.
- Review workflow changes carefully because workflows with write permissions can modify repository contents.
- Enable two-factor authentication and review account sessions, SSH keys, personal access tokens, collaborators, and GitHub Actions regularly.
