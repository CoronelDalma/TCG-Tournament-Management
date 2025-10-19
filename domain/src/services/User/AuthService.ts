export interface AuthService {
    hashPassword(password: string): Promise<string>;
    comparePassword(password: string, passwordHash: string): Promise<boolean>;
    generateToken(userId: string, role: string): Promise<string>;
}