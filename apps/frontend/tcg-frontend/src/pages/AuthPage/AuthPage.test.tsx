import { render, screen, fireEvent } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { AuthPage } from './AuthPage';

/* Declarations of the mocks used in the tests */
const mockNavigate = vi.fn();
let mockIsLoggedIn = false;
let MockLoginFormContainer=vi.fn();
let MockRegisterFormContainer=vi.fn();

/* ------- MOCKS ------- */
// Mock useNavigate from react-router-dom
vi.mock('react-router-dom', () => ({
    useNavigate: () => mockNavigate,
}));

// Mock useAuthContext
vi.mock('../../context/Auth/useAuthContext', () => ({
    useAuthContext: () => ({
        isLoggedIn: mockIsLoggedIn,
    }),
}));

// Mock LoginFormContainer and RegisterFormContainer
vi.mock('../../components/Forms/LoginForm/LoginFormContainer', () => ({
    // Devolvemos el componente que será la referencia a la función mock
    LoginFormContainer: (props: unknown) => MockLoginFormContainer(props),
}));

vi.mock('../../components/Forms/RegisterForm/RegisterFormContainer', () => ({
    // Devolvemos el componente que será la referencia a la función mock
    RegisterFormContainer: (props: unknown) => MockRegisterFormContainer(props),
}));

/* --------------------- */
/* ------- TESTS ------- */
/* --------------------- */
describe('AuthPage Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockIsLoggedIn = false; // Default

        // Esto se hace en beforeEach para asegurar que la factoría de vi.mock()
        // ya se ha ejecutado y las variables 'let' están disponibles.
        MockLoginFormContainer = vi.fn((props) => (
        <div data-testid="login-form-mock">
            <p>Mock Login Form</p>
            <button onClick={props.onSubmit} data-testid="mock-login-submit-success">
                Submit Success
            </button>
            <button onClick={props.onNavigateToRegister} data-testid="mock-login-nav-register">
                Go Register
            </button>
        </div>
        ));

        MockRegisterFormContainer = vi.fn((props) => (
        <div data-testid="register-form-mock">
            <p>Mock Register Form</p>
            <button onClick={props.onSubmit} data-testid="mock-register-submit-success">
                Submit Success
            </button>
            <button onClick={props.onNavigateToLogin} data-testid="mock-register-nav-login">
                Go Login
            </button>
        </div>
        ));
    });

    test('It should NOT render the page and should redirect to "/" if isLoggedIn is true', () => {
        mockIsLoggedIn = true;
        render(<AuthPage />);
        expect(mockNavigate).toHaveBeenCalledWith('/');
        expect(screen.queryByTestId('login-form-mock')).not.toBeInTheDocument();
        expect(screen.queryByTestId('register-form-mock')).not.toBeInTheDocument();
    });

    test('It should render the LoginFormContainer by default when not logged in', () => {
        render(<AuthPage />);
        expect(screen.getByTestId('login-form-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('register-form-mock')).not.toBeInTheDocument();
    });

    test('It should switch to RegisterFormContainer when clicking the register button', () => {
        render(<AuthPage />);
        const registerButton = screen.getByText('Registrarse');
        //Simular click para cambiar el estado
        fireEvent.click(registerButton);

        expect(screen.getByTestId('register-form-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('login-form-mock')).not.toBeInTheDocument();
    });

    test('It should switch to RegisterFormContainer when LoginFormContainer onNavigateToRegister is called', () => {
        render(<AuthPage />);
        expect(screen.queryByTestId('login-form-mock')).toBeInTheDocument();

        const navigateToRegisterButton = screen.getByTestId('mock-login-nav-register');
        fireEvent.click(navigateToRegisterButton);

        expect(screen.getByTestId('register-form-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('login-form-mock')).not.toBeInTheDocument();
    });

    test('It should call navigate to "/" on successful login', () => {
        render(<AuthPage />);
        const loginSuccessButton = screen.getByTestId('mock-login-submit-success');
        fireEvent.click(loginSuccessButton);
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    test('It should switch to LoginFormContainer when RegisterFormContainer call onSubmit', () => {
        render(<AuthPage />);
        // First switch to register form
        const registerButton = screen.getByText('Registrarse');
        fireEvent.click(registerButton);
        expect(screen.getByTestId('register-form-mock')).toBeInTheDocument();

        // Now simulate successful registration
        const registerSuccessButton = screen.getByTestId('mock-register-submit-success');
        fireEvent.click(registerSuccessButton);

        expect(screen.getByTestId('login-form-mock')).toBeInTheDocument();
        expect(screen.queryByTestId('register-form-mock')).not.toBeInTheDocument();
    });
});

