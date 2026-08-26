export const BIO_MAX_LENGTH = 160;

export type ProfileFormValues = {
  displayName: string;
  phone: string;
  website: string;
  bio: string;
};

export type FieldName = keyof ProfileFormValues;
export type ValidationErrors = Partial<Record<FieldName, string>>;

const allowedPhoneCharacters = /^\+[\d\s().-]+$/;

export function validateField(
  fieldName: FieldName,
  value: string,
): string | undefined {
  const trimmedValue = value.trim();

  if (fieldName === "displayName" && trimmedValue.length === 0) {
    return "Display name is required.";
  }

  if (fieldName === "phone" && trimmedValue.length > 0) {
    if (!trimmedValue.startsWith("+")) {
      return "Phone number must include a country code, starting with +.";
    }

    if (!allowedPhoneCharacters.test(trimmedValue)) {
      return "Phone number can only include digits, spaces, parentheses, hyphens, periods, and a leading +.";
    }

    const digits = trimmedValue.replace(/\D/g, "");
    if (digits.length < 8 || digits.length > 15) {
      return "Phone number must contain 8 to 15 digits, including the country code.";
    }

    if (digits.startsWith("0")) {
      return "Country code must start with a digit from 1 to 9.";
    }
  }

  if (fieldName === "website" && trimmedValue.length > 0) {
    if (!/^https?:\/\//i.test(trimmedValue)) {
      return "Website must begin with http:// or https://, for example https://example.com.";
    }

    try {
      const parsedUrl = new URL(trimmedValue);
      const usesWebProtocol =
        parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
      const hasPublicHostname = parsedUrl.hostname.includes(".");

      if (!usesWebProtocol || !hasPublicHostname) {
        return "Enter a complete website URL, for example https://example.com.";
      }
    } catch {
      return "Enter a valid website URL, for example https://example.com.";
    }
  }

  if (fieldName === "bio" && value.length > BIO_MAX_LENGTH) {
    return `Bio must be ${BIO_MAX_LENGTH} characters or fewer.`;
  }

  return undefined;
}

export function validateForm(values: ProfileFormValues): ValidationErrors {
  return (Object.keys(values) as FieldName[]).reduce<ValidationErrors>(
    (errors, fieldName) => {
      const error = validateField(fieldName, values[fieldName]);
      if (error) {
        errors[fieldName] = error;
      }
      return errors;
    },
    {},
  );
}

export function isFormValid(values: ProfileFormValues): boolean {
  return Object.keys(validateForm(values)).length === 0;
}
