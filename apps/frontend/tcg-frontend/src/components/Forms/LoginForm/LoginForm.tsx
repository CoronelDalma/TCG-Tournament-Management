import { Button, ButtonVariant } from "../../Button/Button";
import { InputField, InputFieldType } from "../../InputField/InputField";
import styles from '../Form.module.css';

export interface LoginFormProps {
    email: string;
    password: string;
    isLoading: boolean;
    errorFormMessage: string;
    errorEmailMessage: string;
    errorPasswordMessage: string;
    onFormSubmit: ( event: React.FormEvent) => void;
    onEmailChange: ( event: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: ( event: React.ChangeEvent<HTMLInputElement>) => void;
    onNavigateToRegister: () => void;
}

export function LoginForm(props: LoginFormProps) {
    const {email, password, isLoading, errorFormMessage, errorEmailMessage, errorPasswordMessage, onFormSubmit, onEmailChange, onPasswordChange, onNavigateToRegister} =  props;
    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Iniciar Sesión</h2>
            { errorFormMessage && <p className={styles.generalError}>{errorFormMessage}</p>}

            <form onSubmit={onFormSubmit} className={styles.form}>
                <InputField 
                    value={email} 
                    onChange={onEmailChange}
                    label="Email"
                    type={InputFieldType.EMAIL}
                    placeholder="email@example.com"
                    error={errorEmailMessage}
                    id="login-email"
                    disabled={isLoading} />

                <InputField 
                    value={password} 
                    onChange={onPasswordChange}
                    label="Contraseña"
                    type={InputFieldType.PASSWORD}
                    placeholder="********"
                    error={errorPasswordMessage}
                    id="login-password"
                    disabled={isLoading} />

                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    {isLoading ? 'Accediendo...' : 'Iniciar Sesión'}
                </Button>
            </form>

            <div className={styles.footer}>
                <span className={styles.text}>¿No tienes cuenta?</span>
                <Button variant={ButtonVariant.SECONDARY} onClick={onNavigateToRegister} disabled={isLoading}>Regístrate</Button>
            </div>
        </div>
    )
}

