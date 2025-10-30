import type { InputHTMLAttributes} from 'react'
import styles from './InputField.module.css'

export const InputFieldType = {
    TEXT: 'text',
    EMAIL: 'email',
    PASSWORD: 'password',
    NUMBER: 'number'
} as const;

export type InputFieldType = (typeof InputFieldType)[keyof typeof InputFieldType];

export interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement>{
    label?: string;
    error?: string;
    value: string;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    type?: InputFieldType;
}

export function InputField({label, error, value, onChange, type=InputFieldType.TEXT, ...rest}: InputFieldProps) {
    const hasError = !!error;
    return (
        <div className={styles.container}>
            <label htmlFor={rest.id || label?.toLowerCase().replace(/\s/g, '-')}>{label}</label>
            <input className={`${styles.input} ${hasError ? styles.error : ''}`}
                type={type}
                value={value}
                onChange={onChange}
                aria-invalid={hasError}
                {...rest}/>
            {hasError && <p className={styles.errorMessage}>{error}</p>}
        </div>
    )
}