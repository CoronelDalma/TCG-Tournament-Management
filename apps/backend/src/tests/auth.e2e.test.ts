import { describe, test, expect, beforeEach, beforeAll,afterAll} from "vitest"
import request from "supertest"
import app from "../server"
import { User, UserRole } from "domain/src/entities";
import { PrismaClient, UserRole as PrismaUserRole } from "@prisma/client"

const urlRegister= "/api/auth/register";
const urlLogin = "/api/auth/login";

/// ----------mocks
const PLAYER_ROLE = "player";

const validUser: Omit<User, 'id'> = {
    name: 'Mock User',
    email: 'valid@email.com',
    passwordHash: 'hashedpassword', // aaaaah me equivoque de nombreeeee . debo retocar
    role: PLAYER_ROLE,
}

export function newUserMock(opts?: Partial<Omit<User, 'id'>>): Omit<User, 'id'> {
    return {
        ...validUser,
        ...opts,
    };
}

const LOGIN_EMAIL = 'login_test@example.com';
const LOGIN_PASSWORD = 'password123';

const prisma = new PrismaClient();

//----------------
describe("Auth endpoints", () => {
    beforeAll(async () => {
        // Asegura que Prisma esté listo
        await prisma.$connect();
    });

    beforeEach(async () => {
        // Limpia la tabla antes de cada test
        await prisma.tournament.deleteMany({});
        await prisma.user.deleteMany({});

        await prisma.user.create({
            data: {
                id: '12345678-1234-1234-1234-123456789012', // ID fijo para referencia
                name: 'Login Tester',
                email: LOGIN_EMAIL,
                passwordHash: 'hashedPassword', // Usamos la versión hasheada
                role: PLAYER_ROLE,
            }
        });
    });

    afterAll(async () => {
        // Cierra la conexión al final
        await prisma.$disconnect();
    });

    test("register a new user valid", async() => {
        const res = await request(app).post(urlRegister).send({
            name: "Dalma",
            email: "dalma@email.com",
            password: "secure123",
            role: "player" as UserRole
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
    })

    test("reject duplicate email registration", async() => {
        let res = (await request(app).post(urlRegister).send({
            name: "Dalma",
            email: "dalma@email.com",
            password: "secure123",
            role: "player"
        }))
        expect(res.status).toBe(201);

        res = (await request(app).post(urlRegister).send({
            name: "Dalma",
            email: "dalma@email.com",
            password: "secure123",
            role: "player"
        }))
        expect(res.status).toBe(400);
    })

    test("register 2 users with different ids ", async() => {
        let res1 = (await request(app).post(urlRegister).send({
            name: "Dalma",
            email: "dalma@email.com",
            password: "secure123",
            role: "player"
        }))
        expect(res1.status).toBe(201);

        const res2 = (await request(app).post(urlRegister).send({
            name: "Dalma",
            email: "dalma2@email.com",
            password: "secure123",
            role: "player"
        }))
        expect(res2.status).toBe(201);

        expect(res1.body.id).not.toEqual(res2.body.id);
    })

    test("login with valid credentials", async () => {
        const result = await request(app).post(urlRegister).send({
            name: "Dalma",
            email: "dalma@email.com",
            password: "secure123",
            role: "player"
            });
        expect(result.status).toBe(201);

        const res = await request(app).post("/api/auth/login").send({
        email: "dalma@email.com",
        password: "secure123"
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(typeof res.body.token).toBe("string");
        expect(res.body.token.length).toBeGreaterThan(10);
        expect(res.body.token.split('.').length).toBe(3);
    });

    test("should reject login with non-existent email", async () => {
        const res = await request(app).post(urlLogin).send({
            email: 'nonexistent@example.com',
            password: "nothing",
        });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toContain("Invalid credentials");
    });

    test("should reject login with incorrect password", async () => {
        const res = await request(app).post(urlLogin).send({
            email: LOGIN_EMAIL,
            password: 'wrongpassword',
        });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error");
        expect(res.body.error).toContain("Incorrect password");
    });

    test("should reject login without required fields (email or password)", async () => {
        // Sin email
        let res = await request(app).post(urlLogin).send({
            password: LOGIN_PASSWORD,
        });
        expect(res.status).toBe(401); 
        expect(res.body.error).toContain("Email and password are required");

        // Sin password
        res = await request(app).post(urlLogin).send({
            email: LOGIN_EMAIL,
        });
        expect(res.status).toBe(401);
        expect(res.body.error).toContain("Email and password are required");
    });
})
