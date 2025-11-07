import type { UserRole, UserWithoutHash } from "domain/src";
import type { IAuthUseCases } from "../domain/Auth.types";
import { ApiError, AuthHttpGateway } from "../infra/AuthHttpGatewat";


export const MockAuthUseCases: IAuthUseCases = {
    async login(email: string, password: string): Promise<{ user: UserWithoutHash, token: string }> {
        try {
            const data = await AuthHttpGateway.login(email, password);
            console.log('AuthUseCases login data:', data);
            // Ensure the gateway returned both user and token so we satisfy UserData (non-optional)
            if (!data || !data.user || !data.token) {
                throw new Error("Respuesta inválida del servidor al iniciar sesión.");
            }

            // Ensure email is present (UserWithoutHash.email must be a string)
            if (!data.user.email) {
                throw new Error("Respuesta inválida del servidor: el usuario no tiene email.");
            }

            localStorage.setItem('authToken', data.token);

            const user = {
                id: data.user.id,
                name: data.user.name,
                role: data.user.role,
                email: data.user.email as string,
            };

            return { user, token: data.token };

        } catch (error: unknown) {
            if (error instanceof ApiError && error.status === 401) {
                throw new Error("El email o la contraseña son incorrectos.");
            }
            const message =
                error instanceof Error && typeof error.message === "string"
                    ? error.message
                    : typeof error === "string"
                    ? error
                    : "Error de red inesperado durante el inicio de sesión.";
            throw new Error(message);
        }
    },

    async register(name: string, email: string, password: string, role: UserRole) {
        try {
            await AuthHttpGateway.register(name, email, password, role);
        } catch (error: unknown) {
            if (error instanceof ApiError && error.status === 400) {
                throw new Error("Ese email ya se encuentra registrado.");
            }
            const message =
                error instanceof Error && typeof error.message === "string"
                    ? error.message
                    : typeof error === "string"
                    ? error
                    : "Error de red inesperado durante el registro.";
            throw new Error(message);
        }
    },
};