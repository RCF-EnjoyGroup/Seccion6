import { describe, it, expect } from "vitest";
import { decideEnrollmentAction, type EnrollmentDecision } from "./enrollment";

function assertCheckout(result: EnrollmentDecision): asserts result is { type: "checkout"; url: string } {
  expect(result.type).toBe("checkout");
}

describe("decideEnrollmentAction (pure logic for agent route)", () => {
  it("returns 'enroll' for free course (price = 0)", () => {
    const result = decideEnrollmentAction({ id: "c1", title: "Curso Gratis", price: 0 });
    expect(result).toEqual({ type: "enroll" });
  });

  it("returns 'checkout' for negative price (not === 0)", () => {
    const result = decideEnrollmentAction({ id: "c1", title: "Curso", price: -1 });
    assertCheckout(result);
    expect(result.url).toContain("/checkout/simulated/c1");
  });

  it("returns 'checkout' with simulated URL for paid course (price > 0)", () => {
    const result = decideEnrollmentAction({ id: "c2", title: "Curso Pago", price: 50 });
    assertCheckout(result);
    expect(result.url).toContain("/checkout/simulated/c2");
  });

  it("returns 'checkout' for minimal paid price (0.01)", () => {
    const result = decideEnrollmentAction({ id: "c3", title: "Curso Barato", price: 0.01 });
    assertCheckout(result);
    expect(result.url).toContain("/checkout/simulated/c3");
  });

  it("uses NEXT_PUBLIC_SITE_URL for checkout URL base", () => {
    const originalUrl = process.env.NEXT_PUBLIC_SITE_URL;
    process.env.NEXT_PUBLIC_SITE_URL = "https://myapp.com";
    try {
      const result = decideEnrollmentAction({ id: "c4", title: "Curso", price: 10 });
      assertCheckout(result);
      expect(result.url).toBe("https://myapp.com/checkout/simulated/c4");
    } finally {
      process.env.NEXT_PUBLIC_SITE_URL = originalUrl;
    }
  });

  it("falls back to localhost when NEXT_PUBLIC_SITE_URL not set", () => {
    const originalUrl = process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
    try {
      const result = decideEnrollmentAction({ id: "c5", title: "Curso", price: 10 });
      assertCheckout(result);
      expect(result.url).toBe("http://localhost:3000/checkout/simulated/c5");
    } finally {
      process.env.NEXT_PUBLIC_SITE_URL = originalUrl;
    }
  });
});