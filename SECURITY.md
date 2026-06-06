# Security Policy

## Supported Versions

Banban is currently in early `0.x` development. Security fixes should target the latest `main` branch until stable releases begin.

## Reporting A Vulnerability

Please do not open a public issue for security problems.

Use GitHub Security Advisories after the repository is created:

`https://github.com/your-org/banban-app/security/advisories/new`

Until then, contact the maintainer privately and include:

- A clear description of the issue.
- Steps to reproduce.
- Affected platform: iOS, Android, Web, or build tooling.
- Whether DeepSeek API Key storage, local data export, reminders, or model requests are involved.

Do not include real API keys, tokens, passwords, or private user data.

## Security Boundaries

Banban is designed around these boundaries:

- The app does not ship with a shared DeepSeek API Key.
- Users provide their own DeepSeek API Key.
- Mobile keys are stored with system secure storage.
- Web preview uses browser localStorage only as a development fallback.
- Tasks, memories, reminders, setup state, and chat history are local-first.
- Exported JSON may contain sensitive personal data and should be handled carefully.

## Known Early-Stage Limitations

- No account system or cloud sync exists yet.
- Web preview is not equivalent to a hardened production web app.
- Store URLs, support contacts, and security advisory URLs still need final repository details.
