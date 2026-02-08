import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { screen, fireEvent } from "@testing-library/dom";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { GlobalFilters } from "./GlobalFilters";

// Mock useAuth hook
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Variable to control mock user state
let mockUser: { id: string } | null = null;

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: mockUser }),
}));

const defaultProps = {
  filters: {
    market: "all",
    propertyType: "all",
    brokerRole: "all",
    entityType: "all",
  },
  setFilters: vi.fn(),
  markets: ["Dallas", "Houston"],
  propertyTypes: ["office", "retail"],
  brokerRoles: ["buyer", "seller"],
  entityTypes: ["broker", "brokerage"],
};

describe("GlobalFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
  });

  it("shows 'Sign in to filter' message when user is not authenticated", () => {
    render(
      <BrowserRouter>
        <GlobalFilters {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.getByText("Sign in to filter")).toBeInTheDocument();
  });

  it("does not show 'Sign in to filter' message when user is authenticated", async () => {
    mockUser = { id: "test-user-id" };

    render(
      <BrowserRouter>
        <GlobalFilters {...defaultProps} />
      </BrowserRouter>
    );

    expect(screen.queryByText("Sign in to filter")).not.toBeInTheDocument();
  });

  it("redirects to /auth when unauthenticated user clicks a filter", () => {
    mockUser = null;

    render(
      <BrowserRouter>
        <GlobalFilters {...defaultProps} />
      </BrowserRouter>
    );

    // Find all comboboxes - the first one is the Market filter
    const triggers = screen.getAllByRole("combobox");
    fireEvent.pointerDown(triggers[0]);

    expect(mockNavigate).toHaveBeenCalledWith("/auth");
  });

  it("does not redirect when authenticated user clicks a filter", () => {
    mockUser = { id: "test-user-id" };

    render(
      <BrowserRouter>
        <GlobalFilters {...defaultProps} />
      </BrowserRouter>
    );

    const triggers = screen.getAllByRole("combobox");
    fireEvent.pointerDown(triggers[0]);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("filters are disabled when user is not authenticated", () => {
    mockUser = null;

    render(
      <BrowserRouter>
        <GlobalFilters {...defaultProps} />
      </BrowserRouter>
    );

    const triggers = screen.getAllByRole("combobox");
    triggers.forEach((trigger) => {
      expect(trigger).toBeDisabled();
    });
  });

  it("filters are enabled when user is authenticated", () => {
    mockUser = { id: "test-user-id" };

    render(
      <BrowserRouter>
        <GlobalFilters {...defaultProps} />
      </BrowserRouter>
    );

    const triggers = screen.getAllByRole("combobox");
    triggers.forEach((trigger) => {
      expect(trigger).not.toBeDisabled();
    });
  });
});
