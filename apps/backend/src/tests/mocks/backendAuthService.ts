import { AuthService } from "domain/services"

export const backendAuthServiceMock = {
  // returns a predictable mocked hash for tests
  hashPassword: async (password: string) => `hashedpassword`,

  // compares against the predictable mocked hash
  comparePassword: async (password: string, hash: string) =>
	hash === `mocked-hash:${password}`,

  // simple deterministic token generator for tests
  generateToken: (payload: any) =>
	`mocked-token:${typeof payload === "string" ? payload : JSON.stringify(payload)}`,
} as unknown as AuthService