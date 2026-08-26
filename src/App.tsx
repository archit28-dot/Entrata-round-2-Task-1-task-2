import { ChangeEvent, FormEvent, FocusEvent, useMemo, useState } from "react";
import {
  BIO_MAX_LENGTH,
  FieldName,
  ProfileFormValues,
  ValidationErrors,
  isFormValid,
  validateField,
  validateForm,
} from "./validation";

const initialValues: ProfileFormValues = {
  displayName: "",
  phone: "",
  website: "",
  bio: "",
};

const fieldLabels: Record<FieldName, string> = {
  displayName: "Display name",
  phone: "Phone",
  website: "Website",
  bio: "Bio",
};

function App() {
  const [values, setValues] = useState<ProfileFormValues>(initialValues);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const formIsValid = useMemo(() => isFormValid(values), [values]);
  const remainingBioCharacters = BIO_MAX_LENGTH - values.bio.length;

  function syncFieldError(fieldName: FieldName, nextValue: string) {
    const nextError = validateField(fieldName, nextValue);

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      if (nextError) {
        nextErrors[fieldName] = nextError;
      } else {
        delete nextErrors[fieldName];
      }
      return nextErrors;
    });
  }

  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const fieldName = event.target.name as FieldName;
    const nextValue = event.target.value;

    setValues((currentValues) => ({
      ...currentValues,
      [fieldName]: nextValue,
    }));

    syncFieldError(fieldName, nextValue);
    setShowSuccess(false);
  }

  function handleBlur(
    event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    syncFieldError(event.target.name as FieldName, event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateForm(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length === 0) {
      setShowSuccess(true);
    }
  }

  function getDescribedBy(fieldName: FieldName) {
    const ids = [`${fieldName}-hint`];
    if (errors[fieldName]) {
      ids.push(`${fieldName}-error`);
    }
    return ids.join(" ");
  }

  return (
    <main className="app-shell">
      <section className="form-panel" aria-labelledby="page-title">
        <div className="form-heading">
          <p className="eyebrow">Account</p>
          <h1 id="page-title">Profile settings</h1>
        </div>

        {showSuccess && (
          <div className="success-banner" role="status" aria-live="polite">
            Profile settings saved successfully.
          </div>
        )}

        <form className="profile-form" onSubmit={handleSubmit} noValidate>
          <div className="field-group">
            <label htmlFor="displayName">{fieldLabels.displayName}</label>
            <input
              id="displayName"
              name="displayName"
              type="text"
              value={values.displayName}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(errors.displayName)}
              aria-describedby={getDescribedBy("displayName")}
              autoComplete="name"
            />
            <p className="field-hint" id="displayName-hint">
              The name shown on your public profile.
            </p>
            {errors.displayName && (
              <p className="field-error" id="displayName-error">
                {errors.displayName}
              </p>
            )}
          </div>

          <div className="field-row">
            <div className="field-group">
              <label htmlFor="phone">{fieldLabels.phone}</label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(errors.phone)}
                aria-describedby={getDescribedBy("phone")}
                autoComplete="tel"
                placeholder="+1 415 555 0132"
              />
              <p className="field-hint" id="phone-hint">
                Optional. Include country code, such as +1 or +44.
              </p>
              {errors.phone && (
                <p className="field-error" id="phone-error">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="field-group">
              <label htmlFor="website">{fieldLabels.website}</label>
              <input
                id="website"
                name="website"
                type="url"
                value={values.website}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-invalid={Boolean(errors.website)}
                aria-describedby={getDescribedBy("website")}
                autoComplete="url"
                placeholder="https://example.com"
              />
              <p className="field-hint" id="website-hint">
                Optional. Must start with http:// or https://.
              </p>
              {errors.website && (
                <p className="field-error" id="website-error">
                  {errors.website}
                </p>
              )}
            </div>
          </div>

          <div className="field-group">
            <div className="label-line">
              <label htmlFor="bio">{fieldLabels.bio}</label>
              <span
                className={remainingBioCharacters < 0 ? "counter error" : "counter"}
                aria-live="polite"
              >
                {remainingBioCharacters} left
              </span>
            </div>
            <textarea
              id="bio"
              name="bio"
              value={values.bio}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={5}
              aria-invalid={Boolean(errors.bio)}
              aria-describedby={getDescribedBy("bio")}
              placeholder="A short introduction for your profile."
            />
            <p className="field-hint" id="bio-hint">
              Optional. Keep it concise, up to {BIO_MAX_LENGTH} characters.
            </p>
            {errors.bio && (
              <p className="field-error" id="bio-error">
                {errors.bio}
              </p>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" disabled={!formIsValid}>
              Save profile
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default App;
