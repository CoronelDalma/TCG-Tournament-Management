
export  const UserRole = {
    ADMIN: 'admin',
    ORGANIZER: 'organizer',
    PLAYER: 'player',
} as const;

export type UserRole = (typeof UserRole)[keyof typeof UserRole];
