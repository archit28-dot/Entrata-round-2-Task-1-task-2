# Profile Settings Form

A minimal Vite + React + TypeScript profile settings form.

## Run Locally

```bash
npm install
npm run dev
```

Test:

```bash
npm test
```

Build:

```bash
npm run build
```

## Validation Rules

- Display name is required after trimming whitespace.
- Phone is optional. When provided, it must start with `+`, use only digits, spaces, parentheses, hyphens, periods, and the leading plus sign, and contain 8 to 15 digits total including the country code. The first digit of the country code must be 1 to 9.
- Website is optional. When provided, it must begin with `http://` or `https://`, parse as a URL, and include a hostname with a dot, such as `https://example.com`. A value like `example.com` fails with a message explaining that the protocol is required.
- Bio is optional and limited to 160 characters.

Each field shows its own inline error, clears that error when the value becomes valid on change or blur, and valid values remain in place when another field is invalid.

## Assumptions

- Phone validation is a lightweight international pattern check, not full carrier or region-specific validation.
- Website validation intentionally requires a dotted hostname, so local or intranet URLs such as `http://localhost` are not accepted.
