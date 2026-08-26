# Task 1 Prompts

The implementation was guided by the following prompts in chronological order.

## 1. Repository/Workspace Inspection

Task : Profile Settings Form

The current VS Code workspace may be empty, so first inspect the workspace and determine whether any project files exist.

Do NOT start implementing yet.

Requirements:

Profile settings form
Display name
Phone with country-code validation
Website URL validation
Bio length limit
Inline, specific validation errors near each field
Disable submit until the form is valid
Preserve valid field values when another field fails                                    
Responsive UI
- Accessible labels
- Show a success toast/banner after valid submission
- URL such as "example.com" must fail with a helpful message explaining that http/https is required
- Correcting an invalid field should clear its error on blur or change

First:
1. Inspect the workspace.
2. Identify whether a project/framework already exists.
3. If empty, recommend a minimal appropriate stack for completing this challenge within 120 minutes.
4. Give me a concise implementation plan.
5. Do not modify files yet.

## 2. Implementation Planning

The implementation planning was requested as part of the initial workspace-inspection prompt above. The plan was to use a minimal Vite + React + TypeScript application, build a controlled profile settings form, extract validation rules, show inline field errors, disable submit until valid, preserve valid values, add a success banner, and verify the result.

## 3. MVP Implementation

Proceed with the implementation plan.

First scaffold the minimal Vite + React + TypeScript application in the current workspace.

Then implement the Profile Settings Form MVP end-to-end.

Requirements:
- display name: required
- phone: optional, but when provided it must include a country code and follow a sensible international phone pattern
- website: optional, but when provided must be a valid URL beginning with http:// or https://
- bio: optional with a clear maximum length
- show specific inline errors near the corresponding field
- preserve all valid input values when another field is invalid
- disable submit while the form is invalid
- clear an error when the corresponding field becomes valid on change or blur
- use accessible labels, aria-invalid, and aria-describedby where appropriate
- make the layout responsive
- show a clear success banner/toast after a successful submit
- do not introduce unnecessary dependencies

Choose reasonable validation rules where the task does not specify an exact limit, and document those choices in the README.

After implementing:
1. Run the application/build.
2. Run any available tests.
3. Fix compilation/runtime/test errors.
4. Give me a concise summary of files changed and validation rules used.

Do not stop after scaffolding; complete the working MVP.

## 4. Test and Edge-Case Upgrade

Now improve the MVP rather than rewriting it.

First inspect the current implementation and requirements again.

Important: the challenge explicitly evaluates error handling and unit test coverage, so add a proper test setup and comprehensive unit tests without unnecessarily complicating the project.

Tasks:

1. Add an appropriate lightweight testing setup for this Vite + React + TypeScript project.
2. Extract or reuse validation logic so it can be tested independently where appropriate.
3. Add tests covering:
   - required display name
   - whitespace-only display name
   - valid and invalid international phone numbers
   - phone numbers without a country code
   - valid http/https URLs
   - "example.com" being rejected with the required protocol-specific message
   - malformed URLs
   - empty optional phone/website fields
   - bio at the maximum length
   - bio exceeding the maximum length
   - preservation of valid values when another field is invalid
   - form submission success
4. Add tests for important UI behaviour such as inline error rendering and submit-button disabled/enabled state.
5. Run the complete test suite.
6. Run the production build.
7. Fix every failure you encounter.

Do not add unnecessary features or dependencies.

Afterward, summarize:

- tests added
- important edge cases covered
- commands run
- any remaining limitations

## 5. Final Requirements and Quality Review

Do a final requirements and quality review of Task 1 without rewriting working code unnecessarily.

Compare the current implementation against every requirement in the challenge:

- display name
- phone with country-code pattern
- website URL validation
- bio length limit
- specific inline errors near fields
- submit disabled until valid
- responsive layout
- accessible labels
- valid values preserved on partial failure
- success banner/toast
- example.com rejected with a helpful http/https message
- correction clears the relevant error

Also review:

- accessibility
- mobile responsiveness
- error handling
- code organization
- unnecessary dependencies
- test coverage

Fix only genuine issues you find.

Then run:

1. npm test
2. npm run build

Finally, list any remaining limitations or assumptions that should be documented in the README.

## Verification Note

The implementation was iteratively reviewed and verified with unit tests and a production build. The final verification passed with the complete test suite and `npm run build`.
