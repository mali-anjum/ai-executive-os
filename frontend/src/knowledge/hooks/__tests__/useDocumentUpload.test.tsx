// useDocumentUpload.test.ts
import { renderHookWithStore } from "@/common/store/test-utils";
import { useDocumentUpload } from "../useDocumentUpload";
import * as knowledgeApi from "@/common/api/endpoints/knowledge.api";

// Mock the RTK Query hooks
jest.mock("@/common/api/endpoints/knowledge.api", () => ({
  ...jest.requireActual("@/common/api/endpoints/knowledge.api"),
  useListDocumentsQuery: jest.fn(),
  useUploadDocumentMutation: jest.fn(),
}));

const mockUseListDocumentsQuery = knowledgeApi.useListDocumentsQuery as jest.Mock;
const mockUseUploadDocumentMutation = knowledgeApi.useUploadDocumentMutation as jest.Mock;

describe("useDocumentUpload", () => {
  const mockRefetch = jest.fn();
  const mockUploadDocument = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUploadDocumentMutation.mockReturnValue([
      mockUploadDocument,
      { isLoading: false },
    ]);
  });

  it("loads documents successfully", () => {
    mockUseListDocumentsQuery.mockReturnValue({
      data: [
        {
          id: "1",
          filename: "a.pdf",
          status: "ready",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      error: undefined,
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    const { result } = renderHookWithStore(() => useDocumentUpload());

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(result.current.apiUnreachable).toBe(false);
  });

  it("marks api unreachable when backend is down", () => {
    mockUseListDocumentsQuery.mockReturnValue({
      data: [],
      error: {
        status: "FETCH_ERROR",
        error: "Cannot reach the API. Start the backend (npm run dev or npm run prod in backend/).",
      },
      isLoading: false,
      isFetching: false,
      refetch: mockRefetch,
    });

    const { result } = renderHookWithStore(() => useDocumentUpload());

    expect(result.current.apiUnreachable).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeDefined();
  });
});