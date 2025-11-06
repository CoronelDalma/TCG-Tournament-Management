import React from 'react';
import { InputField } from '../../InputField/InputField';
import { Button } from '../../Button/Button';
import styles from '../Form.module.css';
import { SelectField } from '../../SelectField/SelectField';

export interface RegisterFormProps {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    nameError: string;
    emailError: string;
    passwordError: string;
    confirmPasswordError: string;
    formError: string; // Para errores generales del servidor
    isLoading: boolean;

    onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onConfirmPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRoleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;

    onFormSubmit: (e: React.FormEvent) => void;
    onNavigateToLogin: () => void;
}

export function RegisterForm( props: RegisterFormProps) {
    const {
        name, email, password, confirmPassword,
        nameError, emailError, passwordError, confirmPasswordError,
        formError, isLoading,
        onNameChange, onEmailChange, onPasswordChange, onConfirmPasswordChange,
        onFormSubmit, onNavigateToLogin, onRoleChange
    } = props;

    const roleOptions = [
        { value: 'player', label: 'Jugador / Espectador' },
        { value: 'organizer', label: 'Organizador de Torneos' },
        { value: 'admin', label: 'Administrador (Requiere Aprobación)' },
    ];

    return (
        <div className={styles.card}>
            <h2 className={styles.title}>Crear Cuenta</h2>

            {formError && <p className={styles.generalError}>{formError}</p>}

            <form onSubmit={onFormSubmit} className={styles.form}>
        
                <InputField
                    label="Nombre de Usuario"
                    type="text"
                    placeholder="Nombre visible en torneos"
                    value={name}
                    onChange={onNameChange}
                    error={nameError}
                    id="register-name"
                    disabled={isLoading}
                />
        
                <InputField
                    label="Correo Electrónico"
                    type="email"
                    placeholder="email@torneo.com"
                    value={email}
                    onChange={onEmailChange}
                    error={emailError}
                    id="register-email"
                    disabled={isLoading}
                />

                <InputField
                    label="Contraseña"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={onPasswordChange}
                    error={passwordError}
                    id="register-password"
                    disabled={isLoading}
                />

                <InputField
                    label="Confirmar Contraseña"
                    type="password"
                    placeholder="Repite la contraseña"
                    value={confirmPassword}
                    onChange={onConfirmPasswordChange}
                    error={confirmPasswordError}
                    id="register-confirm-password"
                    disabled={isLoading}
                />

                <select 
                    className={styles.select}
                    disabled={isLoading}
                    onChange={onRoleChange}
                    >
                    <option value="player">Jugador</option>
                    <option value="organizer">Organizador</option> 
                    <option value="admin">Administrador</option>  
                    </select>
                <SelectField                    
                    disabled={isLoading}
                    onChange={onRoleChange} label='Role deseado' id='register-role' options={roleOptions}/>


                <Button type="submit" isLoading={isLoading} disabled={isLoading}>
                    {isLoading ? 'Registrando...' : 'Registrarse'}
                </Button>
            </form>

            <div className={styles.footer}>
                <span className={styles.text}>¿Ya tienes cuenta?</span>
                <Button 
                    variant="secondary" 
                    onClick={onNavigateToLogin} 
                    disabled={isLoading}
                >
                Iniciar Sesión
                </Button>
            </div>
        </div>
    );
};