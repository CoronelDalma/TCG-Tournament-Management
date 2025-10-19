import { describe, test, expect, beforeEach} from "vitest"
import request from "supertest"
import app from "../server"

describe("Auth endpoints", () => {
    test("register a new user valid", async() => {
        const res = await request(app).post("/api/auth/register").send({
            name: "Dalma",
            email: "dalma@email.com",
            password: "secure123",
            role: "player"
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
    })
})
