import { describe, test, expect } from 'vitest';
import { UserSchema } from './user.schema';

describe('UserSchema', () => {
    test('valida un usuario válido', () => {
        const result = UserSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Dalma Giselle',
        email: 'dalma@example.com',
        passwordHash: 'supersecurepassword',
        role: 'admin',
        });

        expect(result.success).toBe(true);
    });

    test('falla si el rol no es válido', () => {
        const result = UserSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Dalma Giselle',
        email: 'dalma@example.com',
        passwordHash: 'supersecurepassword',
        role: 'superadmin', // ❌ no es un rol válido
    });

        expect(result.success).toBe(false);
        expect(result.error!.issues.length).toBeGreaterThan(0);
        expect(result.error!.issues[0]!.message).toMatch(/expected one of/);
    });

    test('falla si el nombre es muy corto', () => {
        const result = UserSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Da',
        email: 'dalma@example.com',
        passwordHash: 'supersecurepassword',
        role: 'player',
        });

        expect(result.success).toBe(false);
        expect(result.error!.issues[0]!.path).toContain('name');
    });
});
