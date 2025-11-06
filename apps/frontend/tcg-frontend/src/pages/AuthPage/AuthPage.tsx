import { useCallback, useState } from "react";
import { useAuthContext } from "../../context/Auth/useAuthContext";
import { useNavigate } from "storybook/internal/router";
import { LoginFormContainer } from "../../components/Forms/LoginForm/LoginFormContainer";
import { RegisterFormContainer } from "../../components/Forms/RegisterForm/RegisterFormContainer";
import styles from './AuthPage.module.css';

type AuthMode = 'login' | 'register' | 'resetPassword';


// TODO separar en componentes
const navButtonStyle = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: '0.75rem',
    textAlign: 'center',
    fontWeight: '600',
    transition: 'color 0.2s, border-bottom 0.2s',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: isActive ? '#2563eb' : '#6b7280',
    borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent'
});

export const AuthPage = () => {
    const [ mode, setMode ] = useState<AuthMode>('login');
    const { isLoggedIn } = useAuthContext();
    const navigate = useNavigate(); // historybook's navigate

    const handleAuthSuccess = useCallback(() => {
        navigate('/'); // Redirect to home on successful auth
    }, [navigate]);

    if (isLoggedIn) {
        navigate('/'); // Redirect to home if already logged in
        return null;
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '4rem', paddingBottom: '4rem' }}>
            <div className={styles.formCard}>
                
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '1.5rem' }}>
                    <button 
                        style={navButtonStyle(mode === 'login')}
                        onClick={() => setMode('login')}
                    >
                        Iniciar Sesión
                    </button>
                    <button 
                        style={navButtonStyle(mode === 'register')}
                        onClick={() => setMode('register')}
                    >
                        Registrarse
                    </button>
                </div>

                {mode === 'login' ? (
                    <LoginFormContainer 
                        onSubmit={handleAuthSuccess} 
                        onNavigateToRegister={() => setMode('register')}
                    />
                ) : (
                    <RegisterFormContainer 
                        onSubmit={() => setMode('login')}
                        onNavigateToLogin={() => setMode('login')}
                    />
                )}
            </div>
        </div>
    )
}
    