import { describe, test, expect, beforeEach, beforeAll,afterAll} from "vitest"
import request from "supertest"
import app from "../server"
import { User, UserRole } from "domain/src/entities";
import { PrismaClient } from "@prisma/client"

const urlRegister= "/api/auth/register";
/// ----------mocks
const validUser: Omit<User, 'id'> = {
    name: 'Mock User',
    email: 'valid@email.com',
    passwordHash: 'hashedpassword', // aaaaah me equivoque de nombreeeee . debo retocar
    role: UserRole.PLAYER,
}
export function newUserMock(opts?: Partial<Omit<User, 'id'>>): Omit<User, 'id'> {
    return {
        ...validUser,
        ...opts,
    };
}

const prisma = new PrismaClient();

//----------------
describe("Auth endpoints", () => {
    beforeAll(async () => {
        // Asegura que Prisma esté listo
        await prisma.$connect();
    });

    beforeEach(async () => {
        // Limpia la tabla antes de cada test
        await prisma.user.deleteMany();
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
            role: "player"
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
})
