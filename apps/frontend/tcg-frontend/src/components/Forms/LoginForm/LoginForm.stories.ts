import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoginForm } from "./LoginForm";

const meta : Meta<typeof LoginForm> = {
    component: LoginForm,
    title: "components/Forms/Login/LoginForm (dump)",
    parameters: {
        layout: "padded"
    },
    tags: ['autodocs'],
    argTypes: {
        email: { control: 'text' },
        password: { control: 'text' },
        errorEmailMessage: { control: 'text' },
        errorPasswordMessage: { control: 'text' },
        errorFormMessage: { control: 'text' },
        isLoading: { control: 'boolean' },
        // Los handlers son "actions" para ver que se disparan
        onEmailChange: { action: 'email changed' },
        onPasswordChange: { action: 'password changed' },
        onFormSubmit: { action: 'form submitted' },
        onNavigateToRegister: { action: 'navigate to register' },
    }
}
export default meta;

type Story = StoryObj<typeof LoginForm>;

export const Default: Story = {
    args: {
        email: '',
        password: '',
        errorEmailMessage: '',
        errorPasswordMessage: '',
        errorFormMessage: '',
        isLoading: false,
    },
};

// 2. Con Campos Llenos
export const FilledFields: Story = {
    args: {
        ...Default.args, // Parte de las props del estado por defecto
        email: 'test@example.com',
        password: 'password123',
    },
};

// 3. Con Error en el Campo Email
export const EmailError: Story = {
    args: {
        ...FilledFields.args,
        email: 'invalid-email',
        errorEmailMessage: 'El formato del correo electrónico no es válido.',
    },
};

// 4. Con Error en el Campo Contraseña
export const PasswordError: Story = {
    args: {
        ...FilledFields.args,
        password: 'short',
        errorPasswordMessage: 'La contraseña debe tener al menos 6 caracteres.',
    },
};

// 5. Con Errores en Ambos Campos
export const AllFieldsInvalid: Story = {
    args: {
        ...Default.args,
        email: 'wrong@',
        password: '123',
        errorEmailMessage: 'Correo inválido.',
        errorPasswordMessage: 'Contraseña muy corta.',
    },
};

// 6. Con Mensaje de Error General (del servidor)
export const GeneralError: Story = {
    args: {
        ...FilledFields.args,
        errorFormMessage: 'Credenciales incorrectas. Inténtalo de nuevo.',
    },
};

// 7. Estado de Carga (Loading)
export const Loading: Story = {
    args: {
        ...FilledFields.args,
        isLoading: true,
    },
};

// 8. Estado Deshabilitado (podría ser si el formulario está en un flujo más grande)
export const Disabled: Story = {
    args: {
        ...FilledFields.args,
        isLoading: true, // isLoading también inhabilita los campos y botones
    },
};