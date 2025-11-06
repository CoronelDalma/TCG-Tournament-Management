import type { IAuthUseCases } from '../domain/AuthUseCasesContract';
import { MockAuthUseCases } from '../useCases/MockAuthUseCases';
// import { RealAuthUseCases } from '../useCases/RealAuthUseCases'; // Se usará después

const CURRENT_AUTH_USE_CASES: IAuthUseCases = MockAuthUseCases; 

export const AuthUseCases: IAuthUseCases = CURRENT_AUTH_USE_CASES;