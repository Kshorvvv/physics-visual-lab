# Security Policy

## Supported release

Security fixes target the current stable release shown in `version.json`.

## Reporting

For a vulnerability that could expose visitor data, execute unintended script, bypass a future account boundary, or corrupt saved experiments, use GitHub's private vulnerability reporting feature if it is enabled for this repository.

If private reporting is unavailable, open a minimal issue that says a private security report is needed, but do not publish exploit code, access tokens, personal data, raw IP addresses, or another person's identity in the issue.

Repository: <https://github.com/Kshorvvv/physics-visual-lab>

## Current architecture

The current site is static and has no first-party backend, account database, payment flow, analytics collector, or secrets in the browser bundle. Any future serverless function, form, analytics product, authentication system, or payment provider must receive a separate threat-model and privacy review before release.
