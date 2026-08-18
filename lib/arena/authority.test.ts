import { test } from "node:test";
import assert from "node:assert/strict";
import {
  resolveArenaAuthority,
  mayHavePrizePool,
  type CompanyStanding,
} from "./authority";

const seat = (over: Partial<CompanyStanding> = {}): CompanyStanding => ({
  companyId: "company-1",
  role: "RECRUITER",
  isAccepted: true,
  isApproved: true,
  ...over,
});

test("a plain developer gets COMMUNITY, whatever they asked for", () => {
  // The hole this file closes: `authority` used to come from the request body,
  // so this caller could have named their own tier.
  const decision = resolveArenaAuthority({ roles: ["USER"] });
  assert.deepEqual(decision, { ok: true, authority: "COMMUNITY", companyId: null });
});

test("a platform admin with no company gets OFFICIAL", () => {
  const decision = resolveArenaAuthority({ roles: ["USER", "ADMIN"] });
  assert.deepEqual(decision, { ok: true, authority: "OFFICIAL", companyId: null });
});

test("an accepted, approved recruiter may host for their company", () => {
  const decision = resolveArenaAuthority({
    roles: ["USER"],
    requestedCompanyId: "company-1",
    standing: seat(),
  });
  assert.deepEqual(decision, { ok: true, authority: "COMPANY", companyId: "company-1" });
});

test("OWNER and ADMIN of a company may host too", () => {
  for (const role of ["OWNER", "ADMIN"]) {
    const decision = resolveArenaAuthority({
      roles: ["USER"],
      requestedCompanyId: "company-1",
      standing: seat({ role }),
    });
    assert.equal(decision.ok, true, role);
  }
});

test("a billing manager may not - paying is not publishing", () => {
  const decision = resolveArenaAuthority({
    roles: ["USER"],
    requestedCompanyId: "company-1",
    standing: seat({ role: "BILLING_MANAGER" }),
  });
  assert.equal(decision.ok, false);
});

test("a pending or unapproved seat is not a seat", () => {
  const pending = resolveArenaAuthority({
    roles: ["USER"],
    requestedCompanyId: "company-1",
    standing: seat({ isAccepted: false }),
  });
  assert.equal(pending.ok, false);

  const unapproved = resolveArenaAuthority({
    roles: ["USER"],
    requestedCompanyId: "company-1",
    standing: seat({ isApproved: false }),
  });
  assert.equal(unapproved.ok, false);
});

test("naming a company you have no membership in is refused, not downgraded", () => {
  // Refusing rather than quietly writing COMMUNITY: a host who believed they
  // were publishing for their employer must be told they cannot, not find out
  // afterwards that the arena went out unattributed.
  const decision = resolveArenaAuthority({
    roles: ["USER"],
    requestedCompanyId: "someone-elses-company",
    standing: null,
  });
  assert.equal(decision.ok, false);
});

test("a platform admin may attribute to any company", () => {
  const decision = resolveArenaAuthority({
    roles: ["ADMIN"],
    requestedCompanyId: "company-9",
    standing: null,
  });
  assert.deepEqual(decision, { ok: true, authority: "COMPANY", companyId: "company-9" });
});

test("an empty company id is treated as no company, not as a company", () => {
  const decision = resolveArenaAuthority({ roles: ["USER"], requestedCompanyId: "" });
  assert.deepEqual(decision, { ok: true, authority: "COMMUNITY", companyId: null });
});

test("JUDGE and COMPANY platform roles do not grant OFFICIAL", () => {
  // Only ADMIN does. JUDGE exists to score, and the self-assignable COMPANY
  // role at signup says nothing about belonging to an actual company.
  for (const role of ["JUDGE", "COMPANY"]) {
    const decision = resolveArenaAuthority({ roles: ["USER", role] });
    assert.deepEqual(decision, { ok: true, authority: "COMMUNITY", companyId: null }, role);
  }
});

test("prize money is blocked on COMMUNITY, allowed above it", () => {
  assert.equal(mayHavePrizePool("COMMUNITY"), false);
  assert.equal(mayHavePrizePool("COMPANY"), true);
  assert.equal(mayHavePrizePool("OFFICIAL"), true);
});
