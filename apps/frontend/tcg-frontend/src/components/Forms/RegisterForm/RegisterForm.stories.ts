import type { Meta, StoryObj } from '@storybook/react';
import { RegisterForm } from './RegisterForm';
import { fn } from '@storybook/test';

const DEFAULT_ARGS = {
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    nameError: '',
    emailError: '',
    passwordError: '',
    confirmPasswordError: '',
    formError: '',
    isLoading: false,
    onNameChange: fn(),
    onEmailChange: fn(),
    onPasswordChange: fn(),
    onConfirmPasswordChange: fn(),
    onFormSubmit: fn(),
    onNavigateToLogin: fn(),
};

const meta: Meta<typeof RegisterForm> = {
    title: 'components/Forms/Register/RegisterForm (Presenter)',
    component: RegisterForm,
    tags: ['autodocs'],
    args: DEFAULT_ARGS,
    argTypes: {
        // Definimos controls para facilitar la edición de estado en Storybook
        formError: { control: 'text' },
        isLoading: { control: 'boolean' },
    },
};

export default meta;
type Story = StoryObj<typeof RegisterForm>;

// --- Historias Clave ---

// 1. Estado por Defecto (Vacío)
export const Default: Story = {};

// 2. Con Campos Llenos
export const FilledFields: Story = {
    args: {
        ...DEFAULT_ARGS,
        name: 'GamerPro',
        email: 'gamer@torneo.com',
        password: 'password123',
        confirmPassword: 'password123',
    },
};

// 3. Con Error de Validación de Contraseñas (Lógica Clave)
export const PasswordMismatchError: Story = {
    args: {
        ...FilledFields.args,
        password: 'secret',
        confirmPassword: 'not-secret',
        confirmPasswordError: 'Las contraseñas no coinciden.',
    },
};

// 4. Con Múltiples Errores (Campos obligatorios/formato)
export const MultipleFieldErrors: Story = {
    args: {
        ...DEFAULT_ARGS,
        nameError: 'El nombre es muy corto.',
        emailError: 'El formato de email no es válido.',
        passwordError: 'La contraseña debe tener 8 caracteres.',
    },
};

// 5. Estado de Carga
export const Loading: Story = {
    args: {
        ...FilledFields.args,
        isLoading: true,
    },
};

// 6. Error General del Servidor
export const GeneralError: Story = {
    args: {
        ...FilledFields.args,
        formError: 'El correo electrónico ya se encuentra registrado.',
    },
};