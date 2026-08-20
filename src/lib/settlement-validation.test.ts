import { describe, expect, it } from "vitest";
import { validateSettlementInput } from "./settlement-validation";

const memberIds = ["calvin", "harry", "amy"];

describe("validateSettlementInput", () => {
  it("accepts valid settlement input", () => {
    expect(
      validateSettlementInput({
        memberIds,
        payerId: "harry",
        receiverId: "calvin",
        amountMinor: 500,
      }),
    ).toEqual({ ok: true });
  });

  it("rejects invalid payer", () => {
    expect(
      validateSettlementInput({
        memberIds,
        payerId: "outside",
        receiverId: "calvin",
        amountMinor: 500,
      }),
    ).toEqual({ ok: false, errors: ["invalid_payer"] });
  });

  it("rejects invalid receiver", () => {
    expect(
      validateSettlementInput({
        memberIds,
        payerId: "harry",
        receiverId: "outside",
        amountMinor: 500,
      }),
    ).toEqual({ ok: false, errors: ["invalid_receiver"] });
  });

  it("rejects the same payer and receiver", () => {
    expect(
      validateSettlementInput({
        memberIds,
        payerId: "harry",
        receiverId: "harry",
        amountMinor: 500,
      }),
    ).toEqual({ ok: false, errors: ["same_member"] });
  });

  it("rejects zero amount", () => {
    expect(
      validateSettlementInput({
        memberIds,
        payerId: "harry",
        receiverId: "calvin",
        amountMinor: 0,
      }),
    ).toEqual({ ok: false, errors: ["invalid_amount"] });
  });

  it("rejects negative amount", () => {
    expect(
      validateSettlementInput({
        memberIds,
        payerId: "harry",
        receiverId: "calvin",
        amountMinor: -1,
      }),
    ).toEqual({ ok: false, errors: ["invalid_amount"] });
  });
});
