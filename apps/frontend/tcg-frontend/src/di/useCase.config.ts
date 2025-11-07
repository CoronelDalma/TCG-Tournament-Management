import type { IAuthUseCases } from '../domain/Auth.types';
import { MockAuthUseCases } from '../useCases/MockAuthUseCases';

const CURRENT_AUTH_USE_CASES: IAuthUseCases = MockAuthUseCases; 

export const AuthUseCases: IAuthUseCases = CURRENT_AUTH_USE_CASES;