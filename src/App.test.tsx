import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";

function renderProfileForm() {
  return {
    user: userEvent.setup(),
    ...render(<App />),
  };
}

describe("Profile settings form", () => {
  it("renders inline errors and clears the corresponding error when valid", async () => {
    const { user } = renderProfileForm();
    const displayName = screen.getByLabelText(/display name/i);

    await user.click(displayName);
    await user.tab();

    expect(screen.getByText("Display name is required.")).toBeInTheDocument();
    expect(displayName).toHaveAttribute("aria-invalid", "true");

    await user.type(displayName, "Ada Lovelace");

    expect(
      screen.queryByText("Display name is required."),
    ).not.toBeInTheDocument();
    expect(displayName).toHaveAttribute("aria-invalid", "false");
  });

  it("keeps submit disabled until the form is valid", async () => {
    const { user } = renderProfileForm();
    const submitButton = screen.getByRole("button", { name: /save profile/i });

    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/display name/i), "Ada Lovelace");

    expect(submitButton).toBeEnabled();

    await user.type(screen.getByLabelText(/website/i), "example.com");

    expect(submitButton).toBeDisabled();
    expect(
      screen.getByText(
        "Website must begin with http:// or https://, for example https://example.com.",
      ),
    ).toBeInTheDocument();
  });

  it("clears the website protocol error after the URL is corrected", async () => {
    const { user } = renderProfileForm();
    const website = screen.getByLabelText(/website/i);

    await user.type(screen.getByLabelText(/display name/i), "Ada Lovelace");
    await user.type(website, "example.com");

    expect(
      screen.getByText(
        "Website must begin with http:// or https://, for example https://example.com.",
      ),
    ).toBeInTheDocument();
    expect(website).toHaveAttribute("aria-invalid", "true");

    await user.clear(website);
    await user.type(website, "https://example.com");

    expect(
      screen.queryByText(
        "Website must begin with http:// or https://, for example https://example.com.",
      ),
    ).not.toBeInTheDocument();
    expect(website).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByRole("button", { name: /save profile/i })).toBeEnabled();
  });

  it("preserves valid input values when another field is invalid", async () => {
    const { user } = renderProfileForm();
    const displayName = screen.getByLabelText(/display name/i);
    const phone = screen.getByLabelText(/phone/i);
    const website = screen.getByLabelText(/website/i);
    const bio = screen.getByLabelText(/bio/i);

    await user.type(displayName, "Ada Lovelace");
    await user.type(phone, "+44 20 7946 0958");
    await user.type(bio, "Computing enthusiast.");
    await user.type(website, "example.com");

    expect(displayName).toHaveValue("Ada Lovelace");
    expect(phone).toHaveValue("+44 20 7946 0958");
    expect(bio).toHaveValue("Computing enthusiast.");
    expect(website).toHaveValue("example.com");
    expect(screen.getByRole("button", { name: /save profile/i })).toBeDisabled();
  });

  it("submits successfully when all fields are valid", async () => {
    const { user } = renderProfileForm();

    await user.type(screen.getByLabelText(/display name/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/phone/i), "+1 415 555 0132");
    await user.type(screen.getByLabelText(/website/i), "https://example.com");
    await user.type(screen.getByLabelText(/bio/i), "Computing enthusiast.");

    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Profile settings saved successfully.",
    );
  });
});
