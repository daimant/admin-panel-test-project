import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import LoginPage from "./LoginPage";

let mockLogin = vi.fn();

vi.mock("../context/AuthContext", () => {
  return {
    useAuth: () => ({
      login: (...args: any[]) => mockLogin(...args),
      isLoading: false,
      logout: () => {},
    }),
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    mockLogin = vi.fn();
  });

  it("shows validation errors when submitting empty form", async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    const loginButton = screen.getByRole("button", { name: /login/i });
    fireEvent.click(loginButton);

    expect(
      await screen.findByText(/Username is required/i),
    ).toBeInTheDocument();
    expect(
      await screen.findByText(/Password is required/i),
    ).toBeInTheDocument();
  });

  it("calls login with correct values when form is valid", async () => {
    mockLogin = vi.fn().mockResolvedValue(undefined);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>,
    );

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberCheckbox = screen.getByRole("checkbox", {
      name: /remember me/i,
    });
    const loginButton = screen.getByRole("button", { name: /login/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });
    fireEvent.click(rememberCheckbox); // toggle remember

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    expect(mockLogin).toHaveBeenCalledWith("testuser", "testpass", true);
  });
});
