import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputField } from './InputField';

const meta: Meta<typeof InputField> = {
    component: InputField,
    title:"components/InputField",
    parameters: {
        layout: "centered"
    },
    tags: ['autodocs'],
    // Definimos el control para que se pueda modificar el texto del label y el error
    argTypes: {
        label: { control: 'text'},
        error: { control: 'text'},
        value: { control: 'text'},
        type: { control: 'select', options: ['text', 'email', 'password']},
    }
}
export default meta;

type Story = StoryObj<typeof InputField>;

export const Default: Story = {
    args: {
        label: 'Nombre',
        placeholder: 'Introduzca su nombre',
        value: '',
    }
}

export const Email: Story = {
    args: {
        label: "Email",
        placeholder: "Introduzca su email",
        value: "test@mail.com",
        type: "email"
    }
};

export const Password: Story = {
    args: {
        label: "Password",
        placeholder: "Mínimo 8 caracteres",
        value: "password123",
        type: "password"
    }
};

export const ValidationError: Story = {
    args: {
        label: "Email",
        placeholder: "",
        value: "usuario-invalido",
        type: "email",
        error: "El formato del email no es válido"
    }
};

export const Disabled: Story = {
    args: {
        label: 'Nombre',
        placeholder: 'Campo no editable',
        value: 'Usuario Bloqueado',
        disabled: true,
    },
};