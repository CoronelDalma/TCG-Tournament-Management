import { vi, describe, test, expect, beforeEach, beforeAll, afterAll, afterEach} from "vitest"
import request from "supertest"
import app from "../server"
import { UserRole, TournamentStatus, User } from "domain/src";
import { PrismaClient } from "@prisma/client"
import { AuthServiceImplementation } from "../services/AuthServise";
import { PrismaUserService } from "src/services/PrismaUserService";

const urlTournament = "/api/tournaments";

const prisma = new PrismaClient();
const authService = new AuthServiceImplementation();
const userService = new PrismaUserService();

const ADMIN_CREDENTIALS = { email: 'admin_creator@test.com', password: 'secure_admin_pwd', role: UserRole.ADMIN };
const ORGANIZER_CREDENTIALS = { email: 'organizer_creator@test.com', password: 'secure_organizer_pwd', role: UserRole.ORGANIZER };
const PLAYER_CREDENTIALS = { email: 'player_creator@test.com', password: 'secure_player_pwd', role: UserRole.PLAYER };
const PLAYER_TWO_CREDENTIALS = { email: 'player_two@test.com', password: 'secure_player_pwd', role: UserRole.PLAYER };
const PLAYER_THREE_EMAIL = 'player_three@test.com'; // Email temporal
const PLAYER_FOUR_CREDENTIALS =  { email: 'player_four@test.com', password: 'secure_player_pwd', role: UserRole.PLAYER };
const PLAYER_FIVE_CREDENTIALS = { email: 'player_five@test.com', password: 'secure_player_pwd', role: UserRole.PLAYER };

const BASE_TOURNAMENT_PAYLOAD = (organizerId: string, maxPlayers: number = 2) => ({
    name: "Weekly Standard Tournament",
    description: "Standard competitive event.",
    maxPlayers: maxPlayers,
    startDate: new Date(Date.now() + 86400000).toISOString(), // Mañana
    format: "Standard",
    organizedId: organizerId
});

// FUNCIÓN DE RETRY: CRUCIAL para manejar fallos de sincronización de DB en E2E.
async function retryOperation<T>(operation: () => Promise<T>, maxAttempts: number = 3, delayMs: number = 200): Promise<T> {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            const isLastAttempt = attempt === maxAttempts;
            if (isLastAttempt) {
                console.error(`[RETRY FAIL] Falló después de ${maxAttempts} intentos.`);
                throw error;
            }
            console.warn(`[RETRY] Intento ${attempt}/${maxAttempts} fallido. Reintentando en ${delayMs}ms...`);
            await new Promise(resolve => setTimeout(resolve, delayMs));
        }
    }
    throw new Error("Retry function failed unexpectedly.");
}

describe("Tournament Endpoints (Creation , Registration & Start)", () => {
    let adminToken: string;
    let organizerToken: string;
    let playerOneToken: string;
    let playerTwoToken: string;
    let playerThreeToken: string;
    let playerFourToken: string;
    let adminId: string;
    let organizerId: string;
    let playerOneId: string;
    let playerTwoId: string;
    let playerThreeId: string;
    let playerFourId: string;
    let tournamentId: string;
    let startTournamentId: string;

    const createAndLogin = async (credentials: any, role: UserRole) => {
        let passwordHash =await authService.hashPassword(credentials.password);

        // 1. Intentar encontrar el usuario por email
        let prismaUser = await prisma.user.upsert({ 
            where: { email: credentials.email },
            update: { 
                passwordHash: passwordHash,
                // Aseguramos que el rol en Prisma sea mayúsculas
                role: role, 
            },
            create: {
                email: credentials.email,
                name: credentials.email,
                passwordHash: passwordHash,
                // Aseguramos que el rol en Prisma sea mayúsculas
                role: role, 
            },
        });

        // Mapeamos de nuevo al objeto de dominio para el token
        const createdUser: User = {
            id: prismaUser.id,
            name: prismaUser.name,
            email: prismaUser.email,
            passwordHash: prismaUser.passwordHash,
            // El rol del token siempre es minúsculas (UserRole)
            role: prismaUser.role.toLowerCase() as UserRole, 
        };

        // Generar token con el ID real y rol del usuario
        const token = await authService.generateToken(createdUser.id, createdUser.role);
        return { userId: createdUser.id, token };
    };

    beforeAll(async () => {
        await prisma.$connect();
        await prisma.match.deleteMany({});
        await prisma.round.deleteMany({});
        await prisma.tournament.deleteMany({});
        const emailsToClean = [
            ADMIN_CREDENTIALS.email, 
            PLAYER_CREDENTIALS.email, 
            PLAYER_TWO_CREDENTIALS.email, 
            ORGANIZER_CREDENTIALS.email,
            PLAYER_FOUR_CREDENTIALS.email,
            PLAYER_FIVE_CREDENTIALS.email,
            
        ];
        await prisma.user.deleteMany({
            where: { email: { in: emailsToClean }}
        });

        await retryOperation(async () => {
            const admin = await createAndLogin(ADMIN_CREDENTIALS, UserRole.ADMIN);
            const playerOne = await createAndLogin(PLAYER_CREDENTIALS, UserRole.PLAYER);
            const playerTwo = await createAndLogin(PLAYER_TWO_CREDENTIALS, UserRole.PLAYER);
            const organizer = await createAndLogin(ORGANIZER_CREDENTIALS, UserRole.ORGANIZER);
            const playerThree = await createAndLogin(PLAYER_FOUR_CREDENTIALS,UserRole.PLAYER);
            const playerFour = await createAndLogin(PLAYER_FIVE_CREDENTIALS, UserRole.PLAYER);
            adminToken = admin.token;
            organizerToken = organizer.token;
            playerOneToken = playerOne.token;
            playerTwoToken = playerTwo.token;
            playerThreeToken = playerThree.token;
            playerFourToken = playerFour.token;
            adminId = admin.userId;
            playerOneId = playerOne.userId;
            playerTwoId = playerTwo.userId;
            playerThreeId = playerThree.userId;
            playerThreeId = playerThree.userId;
            organizerId = organizer.userId;
        }, 5, 200);

        // For Start tournament
        const newTournament = await request(app)
            .post(urlTournament)
            .set('Authorization', `Bearer ${organizerToken}`)
            .send(BASE_TOURNAMENT_PAYLOAD(organizerId, 8));

        startTournamentId = newTournament.body.id;
    });

    beforeEach(async () => {
        // 1. Limpiar matches y rounds (necesario antes de eliminar el torneo)
        await prisma.match.deleteMany({ where: { tournamentId: startTournamentId } });
        await prisma.round.deleteMany({ where: { tournamentId: startTournamentId } });
        
        // 2. Eliminar el torneo si existe
        //await prisma.tournament.deleteMany({ where: { id: startTournamentId } });
        // Resetear el estado del torneo a PENDING
        await prisma.tournament.update({ 
            where: { id: startTournamentId },
            data: { status: TournamentStatus.PENDING, registeredPlayersIds: { set: [] } } // Opcional: limpiar jugadores
        });

        // [CAMBIO CLAVE]: Envolvemos la creación del torneo en un retry.
        // Esto captura específicamente el error 500 causado por el Admin no encontrado.
        const creationRes = await retryOperation(async () => {
            const res = await request(app)
                .post(urlTournament)
                .set('Authorization', `Bearer ${adminToken}`)
                .send(BASE_TOURNAMENT_PAYLOAD(organizerId));

            // Si el error es el de sincronización, lanzamos un error específico para forzar el retry
            if (res.status === 500 && res.body?.error.includes("Requester user not found")) {
                throw new Error("Requester user not found (Sync Issue)");
            }
            if (res.status !== 201) {
                // Si es un error de lógica, lo lanzamos para detener el test
                console.error(`Error de servidor en beforeEach: ${res.body?.error || 'Sin mensaje'}`);
                throw new Error(`Falló la creación del torneo: ${res.status} - ${res.body?.error || 'Sin mensaje'}`);
            }
            return res;
        }, 5, 100); // 5 intentos de retry con 100ms de retraso.

        tournamentId = creationRes.body.id; 
    });

    afterEach(async () => {
        // Eliminar el torneo creado en beforeEach
        if (tournamentId) {
            await prisma.tournament.delete({ where: { id: tournamentId } });
        }
    });

    afterAll(async () => {
        const emailsToClean = [
            ADMIN_CREDENTIALS.email, 
            PLAYER_CREDENTIALS.email, 
            PLAYER_TWO_CREDENTIALS.email, 
            ORGANIZER_CREDENTIALS.email,
            PLAYER_THREE_EMAIL ,
            PLAYER_FOUR_CREDENTIALS.email,
            PLAYER_FIVE_CREDENTIALS.email
        ];
        await prisma.match.deleteMany({});
        await prisma.round.deleteMany({});
        await prisma.tournament.deleteMany({});
        await prisma.user.deleteMany({
            where: { email: { in: emailsToClean }}
        });
        await prisma.$disconnect();
    });

    // -------------------------------------------------------------------------
    // ✅   TEST CREACION DE TORNEO
    // -------------------------------------------------------------------------
    test("should allow an ADMIN to create a valid tournament (initial check)", async() => {
        const res = await request(app)
            .post(urlTournament)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({...BASE_TOURNAMENT_PAYLOAD(adminId), name: "New Tournament Name"});

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("New Tournament Name");
        expect(res.body.registeredPlayersIds).toEqual([]); 
        expect(res.body.organizerId).toBe(`${adminId}`); 

        // Limpieza manual del torneo creado en este test (aparte del beforeEach/afterEach)
        if (res.body.id) {
            await prisma.tournament.delete({ where: { id: res.body.id } });
        }
    });

    test("should allow an ORGANIZER to create a valid tournament (initial check)", async() => {
        const res = await request(app)
            .post(urlTournament)
            .set('Authorization', `Bearer ${organizerToken}`)
            .send({...BASE_TOURNAMENT_PAYLOAD(organizerId), name: "New Tournament Name"});

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.name).toBe("New Tournament Name");
        expect(res.body.registeredPlayersIds).toEqual([]); 
        expect(res.body.organizerId).toBe(`${organizerId}`); 

        // Limpieza manual del torneo creado en este test (aparte del beforeEach/afterEach)
        if (res.body.id) {
            await prisma.tournament.delete({ where: { id: res.body.id } });
        }
    });

    test("should reject a PLAYER from creating a tournament (403 Forbidden)", async() => {
        const res = await request(app)
            .post(urlTournament)
            .set('Authorization', `Bearer ${playerOneToken}`)
            .send(BASE_TOURNAMENT_PAYLOAD(playerOneId));
        expect(res.status).toBe(403);
        expect(res.body.error).toContain("User is not authorized to create tournaments.");
    });

    // -------------------------------------------------------------------------
    // ✅ REGISTRO DE JUGADORES
    // -------------------------------------------------------------------------

    test("should allow a player to register in a PENDING tournament", async() => {
        const res = await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerOneToken}`); // Player 1 se inscribe

        expect(res.status).toBe(200);
        // Debe haber 1 jugador registrado (el ID de Player 1)
        expect(res.body.registeredPlayersIds).toEqual([playerOneId]); 
        expect(res.body.maxPlayers).toBe(2);
        expect(res.body.status).toBe(TournamentStatus.PENDING);
    });

    test("should prevent a player from registering twice in the same tournament", async() => {
        // 1. Primer registro (debe funcionar)
        await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerOneToken}`)
            .expect(200);

        // 2. Segundo registro (debe fallar)
        const res = await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerOneToken}`);

        //El error 404/400 es válido si el use case lo lanza
        expect([400, 404]).toContain(res.status);
        expect(res.body.error).toContain("already registered");
    });
    
    test("should prevent registration if the tournament is already full", async() => {
        // Torneo maxPlayers = 2

        // 1. Registro Player 1
        await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerOneToken}`)
            .expect(200);

        // 2. Registro Player 2
        await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerTwoToken}`)
            .expect(200);
        
        // 3. Crear Player 3 para intentar el registro
        const { token: playerThreeToken } = await createAndLogin({ email: 'player_three@test.com', password: 'secure_pwd' }, UserRole.PLAYER);

        // 4. Registro Player 3 (Debe fallar)
        const res = await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerThreeToken}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("already full");

        // Limpiar player 3
        await prisma.user.delete({ where: { email: 'player_three@test.com' } });
    });

    test("should prevent registration if the tournament status is not PENDING", async() => {
        // 1. Cambiar el estado del torneo a ACTIVE
        await prisma.tournament.update({
            where: { id: tournamentId },
            data: { status: TournamentStatus.ACTIVE } 
        });

        // 2. Intentar registrar (debe fallar)
        const res = await request(app)
            .post(`${urlTournament}/${tournamentId}/register`)
            .set('Authorization', `Bearer ${playerOneToken}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toContain("Cannot register. Tournament is currently active");
    });

    // -----------------------------------------------------------
    //      TESTS DE INICIO DEL TORNEO 
    // ----------------------------------------------------------
    const urlRegisterUserToTournament = (idTournament: string) => `${urlTournament}/${idTournament}/register`;
    const urlStartTournament = (tournamentId: string) => `${urlTournament}/${tournamentId}/start`;

    test ("should reject starting a tournament if user is Player ( 403 Forbidden", async () => {
        // Register 3 players and the organizer in the tournament
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerOneToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${organizerToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerThreeToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerFourToken}`);

        const res = await request(app).post(urlStartTournament(startTournamentId)).set('Authorization', `Bearer ${playerOneToken}`);

        expect(res.status).toBe(403);
        expect(res.body.error).toContain("Permission denied. Only the Admin or the Tournament Organizer can start this tournament.");
    })

    test("should allow ADMIN to successfully start a 5-player tournament by generating a bracket with byes", async () => {
        // Register 5 players
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerOneToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${organizerToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerThreeToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerFourToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${adminToken}`);
    
        // Start tournament
        const res = await request(app)
                .post(urlStartTournament(startTournamentId))
                .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(TournamentStatus.ACTIVE);

        const rounds = res.body.rounds;
        expect(rounds.length).toBe(1); 
            
        // Round 1 (3 matches totales)
        expect(rounds[0].matches.length).toBe(3); 
        
        let byes = 0;
        let pending = 0;
        
        rounds[0].matches.forEach((match: any) => {
            console.log("Match: ",match);
            console.log("player 1: ",match.player1Id);
            console.log("player 2: ",match.player2Id);
            if (match.result == "pending") {
                pending += 1;
                expect(match.player1Id).not.toBeNull();
                expect(match.player2Id).not.toBeNull();
            }
            if (match.result == 'bye') {
                byes += 1;
                expect(match.player1Id).not.toBeNull();
                expect(match.player2Id).toBeNull();
            }

        });
        expect(pending).toBe(2);
        expect(byes).toBe(1);
    })

    test("should allow ADMIN to successfully start a 4-player tournament", async () => {
        // Register 4 players
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerOneToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${organizerToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerThreeToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerFourToken}`);
    
        // Start tournament
        const res = await request(app)
                .post(urlStartTournament(startTournamentId))
                .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(TournamentStatus.ACTIVE);

        const rounds = res.body.rounds;
        expect(rounds.length).toBe(1); 
            
        const round1 = rounds[0];
        expect(round1.roundNumber).toBe(1);
        // 2. Verificamos que se hayan creado los emparejamientos completos para 4 jugadores
        // 4 jugadores deben tener 2 matches (2x2) y CERO byes.
        expect(round1.matches.length).toBe(2);

        // 3. Verificamos que todos los matches estén definidos (no esperando ganadores)
        round1.matches.forEach((match: any) => {
            expect(match.player1Id).not.toBeNull();
            expect(match.player2Id).not.toBeNull();

        });
    })

    test("should allow ORGANIZER to successfully start a 4-player tournament", async () => {
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerOneToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${organizerToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerThreeToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerFourToken}`);
    
        // Start tournament
        const res = await request(app)
                .post(urlStartTournament(startTournamentId))
                .set('Authorization', `Bearer ${organizerToken}`);
        
        expect(res.status).toBe(200);
        expect(res.body.status).toBe(TournamentStatus.ACTIVE);
        
        // Sólo la ronda 1
        const rounds= res.body.rounds;
        expect(rounds.length).toBe(1); //En Swiss, solo se crea la Ronda 1 al inicio.

        const round1 = rounds[0];
        expect(round1.roundNumber).toBe(1);
        // 2. Verificamos que se hayan creado los emparejamientos completos para 4 jugadores
        // 4 jugadores deben tener 2 matches (2x2) y CERO byes.
        expect(round1.matches.length).toBe(2);

        // 3. Verificamos que todos los matches estén definidos (no esperando ganadores)
        round1.matches.forEach((match: any) => {
            expect(match.player1Id).not.toBeNull();
            expect(match.player2Id).not.toBeNull();
        });
    })

    test("should allow ORGANIZER to successfully start a 7-player tournament by generating a bracket with byes", async () => {
        // Register 5 players
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerOneToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${organizerToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerThreeToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerFourToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${adminToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerTwoToken}`);

        // extra player
        const { token: playerExtraToken } = await createAndLogin({ email: 'player_three@test.com', password: 'secure_pwd' }, UserRole.PLAYER);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerExtraToken}`);
    
        // Start tournament
        const res = await request(app)
                .post(urlStartTournament(startTournamentId))
                .set('Authorization', `Bearer ${organizerToken}`);

        expect(res.status).toBe(200);
        expect(res.body.status).toBe(TournamentStatus.ACTIVE);

        const rounds = res.body.rounds;
        expect(rounds.length).toBe(1); 
            
        // Round 1 (7 players - 4 matches totales= 3 pendings -1 bye)
        expect(rounds[0].matches.length).toBe(4); 
        
        let byes = 0;
        let pending = 0;
        
        rounds[0].matches.forEach((match: any) => {
            console.log("Match: ",match);
            console.log("player 1: ",match.player1Id);
            console.log("player 2: ",match.player2Id);
            if (match.result == "pending") {
                pending += 1;
                expect(match.player1Id).not.toBeNull();
                expect(match.player2Id).not.toBeNull();
            }
            if (match.result == 'bye') {
                byes += 1;
                expect(match.player1Id).not.toBeNull();
                expect(match.player2Id).toBeNull();
            }

        });
        expect(pending).toBe(3);
        expect(byes).toBe(1);

        // Clear extra player 
        await prisma.user.delete({ where: { email: 'player_three@test.com' } });
    })

    test("should reject start if the tournament is started by an ORGANIZER but is not the tournament organizer ", async () => {
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerOneToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${organizerToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerThreeToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerFourToken}`);
    
        const newOrganizer = await createAndLogin({ email: 'organizer_new@test.com', password: 'secure_organizer_pwd', role: UserRole.ORGANIZER }, UserRole.ORGANIZER)
        // Start tournament
        const res = await request(app)
                .post(urlStartTournament(startTournamentId))
                .set('Authorization', `Bearer ${newOrganizer.token}`);
        
        expect(res.status).toBe(403);
        await prisma.user.delete({ where: { email: 'organizer_new@test.com' } });
    })

    test("should reject starting a tournament if status is already ACTIVE", async () => {
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerOneToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${organizerToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerThreeToken}`);
        await request(app).post(urlRegisterUserToTournament(startTournamentId)).set('Authorization', `Bearer ${playerFourToken}`);
    
        
        // Start tournament
        const res = await request(app)
                .post(urlStartTournament(startTournamentId))
                .set('Authorization', `Bearer ${organizerToken}`);
        expect(res.status).toBe(200);
        
        // Start again
        const res2 = await request(app)
            .post(urlStartTournament(startTournamentId))
            .set('Authorization', `Bearer ${organizerToken}`);

        expect(res2.status).toBe(400);
        expect(res2.body.error).toContain("status PENDING to be started");
    })
    
});