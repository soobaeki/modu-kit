import { AuthPayload, AuthProvider } from "../types";

export class ExternalApiProvider implements AuthProvider {
  async authenticate(
    username: string,
    password: string,
  ): Promise<AuthPayload | null> {
    const apiUrl = process.env.BACKEND_API_URL || process.env.DB_API_URL;

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  }
}
