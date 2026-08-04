import { act, waitFor } from "@testing-library/react";
import { renderHookWithStore } from "@/common/store/test-utils";
import { useTickets } from "../useTickets";
import * as ticketsApi from "@/common/api/endpoints/tickets.api";

jest.mock("@/common/api/endpoints/tickets.api", () => ({
  ...jest.requireActual("@/common/api/endpoints/tickets.api"),
  useListTicketsQuery: jest.fn(),
}));

const mockUseListTicketsQuery = ticketsApi.useListTicketsQuery as jest.Mock;

describe("useTickets", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("finishes loading with empty tickets", async () => {
    mockUseListTicketsQuery.mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    });

    const { result } = renderHookWithStore(() => useTickets());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.tickets).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it("surfaces API unreachable errors", async () => {
    const mockRefresh = jest.fn();
    mockUseListTicketsQuery.mockReturnValue({
      data: [],
      error: {
        status: "FETCH_ERROR",
        error: "Cannot reach the API. Start the backend (pnpm run dev or pnpm run prod in backend/).",
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefresh,
    });

    const { result } = renderHookWithStore(() => useTickets());

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.apiUnreachable).toBe(true);
    expect(result.current.error).toMatchObject({ status: "FETCH_ERROR" });
  });
});
