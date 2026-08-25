export const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export const adminTokenStorageKey = "purehive-admin-token";

export type WaitlistSubmission = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  jobTitle: string;
  companySize: string;
  region: string;
  publicSector: string;
  challenge: string;
  evidenceMethods: string[];
  timeSpent: string;
  interests: string[];
  createdAt: string;
};

export type AdminSession = {
  token: string;
  username: string;
  expiresAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
};

export class AdminUnauthorizedError extends Error {
  constructor(message = "Unauthorized.") {
    super(message);
    this.name = "AdminUnauthorizedError";
  }
}

const readJson = async <T>(response: Response): Promise<ApiResponse<T>> => {
  return (await response.json()) as ApiResponse<T>;
};

export async function loginAdmin(username: string, password: string): Promise<AdminSession> {
  const response = await fetch(`${apiUrl}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
    cache: "no-store",
  });

  const payload = await readJson<AdminSession>(response);

  if (!response.ok || !payload.data?.token) {
    throw new Error(payload.message || "Could not sign in.");
  }

  return payload.data;
}

export async function fetchWaitlistSubmissions(token: string): Promise<WaitlistSubmission[]> {
  const response = await fetch(`${apiUrl}/api/waitlist`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  const payload = await readJson<WaitlistSubmission[]>(response);

  if (response.status === 401) {
    throw new AdminUnauthorizedError(payload.message || "Unauthorized.");
  }

  if (!response.ok) {
    throw new Error(payload.message || "Could not load waitlist submissions.");
  }

  return payload.data ?? [];
}
