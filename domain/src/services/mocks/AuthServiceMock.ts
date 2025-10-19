export const AuthServiceMock = {
    hashPassword: async (password: string) => {
        return password+"-hashed";
    },
    comparePassword: async (password: string, passwordHash: string) => {
        const hashed = password === 'passAdmin' ? 'hashedAdmin' : 'hashedPlayer';
        // return password === 'passAdmin' && passwordHash === hashed;
        return passwordHash === hashed;
    },
    generateToken: async (userId: string) => {
        return `token-for-${userId}`;
    }
}