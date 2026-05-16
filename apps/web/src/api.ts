const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export interface ApiClient {
  setToken(token: string | null): void;
  get<T>(path: string): Promise<T>;
  post<T>(path: string, body?: unknown): Promise<T>;
  del<T>(path: string): Promise<T>;
}

class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
  }
}

const parseErrorMessage = async (response: Response) => {
  try {
    const payload = (await response.json()) as {
      message?: string;
      error?: string;
    };
    return (
      payload.message ??
      payload.error ??
      `Request failed with status ${response.status}`
    );
  } catch {
    return `Request failed with status ${response.status}`;
  }
};

export const createApiClient = (): ApiClient => {
  let token: string | null = null;

  const request = async <T>(
    method: "GET" | "POST" | "DELETE",
    path: string,
    body?: unknown
  ): Promise<T> => {
    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const init: RequestInit = {
      method,
      headers
    };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${path}`, init);

    if (!response.ok) {
      throw new HttpError(response.status, await parseErrorMessage(response));
    }
    if (response.status === 204) {
      return undefined as T;
    }
    return (await response.json()) as T;
  };

  return {
    setToken(nextToken: string | null) {
      token = nextToken;
    },
    get: <T>(path: string) => request<T>("GET", path),
    post: <T>(path: string, body?: unknown) => request<T>("POST", path, body),
    del: <T>(path: string) => request<T>("DELETE", path)
  };
};

export { HttpError };
