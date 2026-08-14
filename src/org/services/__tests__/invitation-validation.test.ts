import {
  canAssignRole,
  invitableRolesFor,
  isWorkEmail,
} from "@/org/services/invitation-validation";

describe("isWorkEmail", () => {
  it("accepts a normal email", () => {
    expect(isWorkEmail("jane@acme.com")).toBe(true);
  });

  it("rejects emails without @", () => {
    expect(isWorkEmail("jane")).toBe(false);
  });

  it("rejects emails containing spaces", () => {
    expect(isWorkEmail("jane @acme.com")).toBe(false);
  });

  it("rejects empty local part", () => {
    expect(isWorkEmail("@acme.com")).toBe(false);
  });
});

describe("canAssignRole", () => {
  it("only an owner may assign the owner role", () => {
    expect(canAssignRole("owner", "owner")).toBe(true);
    expect(canAssignRole("admin", "owner")).toBe(false);
    expect(canAssignRole("manager", "owner")).toBe(false);
    expect(canAssignRole("employee", "owner")).toBe(false);
  });

  it("owner and admin may assign non-owner roles", () => {
    expect(canAssignRole("owner", "admin")).toBe(true);
    expect(canAssignRole("admin", "manager")).toBe(true);
    expect(canAssignRole("owner", "employee")).toBe(true);
    expect(canAssignRole("admin", "employee")).toBe(true);
  });

  it("manager and employee cannot assign any role", () => {
    expect(canAssignRole("manager", "employee")).toBe(false);
    expect(canAssignRole("employee", "employee")).toBe(false);
  });
});

describe("invitableRolesFor", () => {
  it("owner can invite every role", () => {
    expect(invitableRolesFor("owner")).toEqual([
      "owner",
      "admin",
      "manager",
      "employee",
    ]);
  });

  it("admin cannot invite owners", () => {
    expect(invitableRolesFor("admin")).toEqual(["admin", "manager", "employee"]);
    expect(invitableRolesFor("admin")).not.toContain("owner");
  });
});
