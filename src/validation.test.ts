import { describe, expect, it } from "vitest";
import {
  BIO_MAX_LENGTH,
  ProfileFormValues,
  isFormValid,
  validateField,
  validateForm,
} from "./validation";

const validValues: ProfileFormValues = {
  displayName: "Ada Lovelace",
  phone: "+44 20 7946 0958",
  website: "https://example.com",
  bio: "Computing enthusiast.",
};

describe("profile validation", () => {
  it("requires a display name", () => {
    expect(validateField("displayName", "")).toBe("Display name is required.");
  });

  it("rejects a whitespace-only display name", () => {
    expect(validateField("displayName", "   ")).toBe(
      "Display name is required.",
    );
  });

  it("accepts valid international phone numbers", () => {
    expect(validateField("phone", "+1 415 555 0132")).toBeUndefined();
    expect(validateField("phone", "+44 (20) 7946-0958")).toBeUndefined();
    expect(validateField("phone", "+81.3.1234.5678")).toBeUndefined();
  });

  it("rejects invalid international phone numbers", () => {
    expect(validateField("phone", "+1 abc 555 0132")).toBe(
      "Phone number can only include digits, spaces, parentheses, hyphens, periods, and a leading +.",
    );
    expect(validateField("phone", "+1234567")).toBe(
      "Phone number must contain 8 to 15 digits, including the country code.",
    );
    expect(validateField("phone", "+1234567890123456")).toBe(
      "Phone number must contain 8 to 15 digits, including the country code.",
    );
  });

  it("rejects phone numbers without a country code", () => {
    expect(validateField("phone", "415 555 0132")).toBe(
      "Phone number must include a country code, starting with +.",
    );
  });

  it("accepts valid http and https URLs", () => {
    expect(validateField("website", "http://example.com")).toBeUndefined();
    expect(validateField("website", "https://example.com/profile")).toBeUndefined();
  });

  it("rejects example.com with the protocol-specific message", () => {
    expect(validateField("website", "example.com")).toBe(
      "Website must begin with http:// or https://, for example https://example.com.",
    );
  });

  it("rejects malformed URLs", () => {
    expect(validateField("website", "https://")).toBe(
      "Enter a valid website URL, for example https://example.com.",
    );
    expect(validateField("website", "https://example")).toBe(
      "Enter a complete website URL, for example https://example.com.",
    );
  });

  it("allows empty optional phone and website fields", () => {
    expect(validateField("phone", "")).toBeUndefined();
    expect(validateField("website", "")).toBeUndefined();
    expect(
      isFormValid({
        ...validValues,
        phone: "",
        website: "",
      }),
    ).toBe(true);
  });

  it("allows bio at the maximum length", () => {
    expect(validateField("bio", "a".repeat(BIO_MAX_LENGTH))).toBeUndefined();
  });

  it("rejects bio exceeding the maximum length", () => {
    expect(validateField("bio", "a".repeat(BIO_MAX_LENGTH + 1))).toBe(
      `Bio must be ${BIO_MAX_LENGTH} characters or fewer.`,
    );
  });

  it("preserves valid values when another field is invalid", () => {
    const values = {
      ...validValues,
      website: "example.com",
    };

    expect(validateForm(values)).toEqual({
      website:
        "Website must begin with http:// or https://, for example https://example.com.",
    });
    expect(values.displayName).toBe(validValues.displayName);
    expect(values.phone).toBe(validValues.phone);
    expect(values.bio).toBe(validValues.bio);
  });
});
