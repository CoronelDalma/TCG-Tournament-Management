export interface AuthService {
    comparePassword(password: string, passwordHash: string): Promise<boolean>;
    generateToken(userId: string): Promise<string>;
}