import { act } from "@testing-library/react";
import { renderHookWithStore } from "@/common/store/test-utils";
import { useTenant } from "@/common/tenancy";

describe("useTenant", () => {
  it("exposes the active tenant and admin flag for an owner", () => {
    const { result, store } = renderHookWithStore(() => useTenant());
    act(() => {
      store.dispatch({
        type: "org/setOrg",
        payload: { orgId: "org-a", orgName: "Org A" },
      });
    });
    act(() => {
      store.dispatch({
        type: "user/setUser",
        payload: { email: "owner@org-a.test", role: "owner" },
      });
    });

    expect(result.current.orgId).toBe("org-a");
    expect(result.current.orgName).toBe("Org A");
    expect(result.current.role).toBe("owner");
    expect(result.current.isAdmin).toBe(true);
  });

  it("allows access only within the same organization (Org A ≠ Org B)", () => {
    const { result, store } = renderHookWithStore(() => useTenant());
    act(() => {
      store.dispatch({
        type: "org/setOrg",
        payload: { orgId: "org-a", orgName: "Org A" },
      });
    });

    expect(result.current.canAccess("org-a")).toBe(true);
    expect(result.current.canAccess("org-b")).toBe(false);
    expect(result.current.canAccess(null)).toBe(false);
  });

  it("exposes the tenant role for managers", () => {
    const { result, store } = renderHookWithStore(() => useTenant());
    act(() => {
      store.dispatch({
        type: "org/setOrg",
        payload: { orgId: "org-a", orgName: "Org A" },
      });
    });
    act(() => {
      store.dispatch({
        type: "user/setUser",
        payload: { email: "manager@org-a.test", role: "manager" },
      });
    });

    expect(result.current.role).toBe("manager");
    expect(result.current.isAdmin).toBe(false);
  });
});