import styles from'./SelectField.module.css'

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    id: string;
    options: { value: string; label: string }[];
    error?: string;
}

export function SelectField({ label, id, options, error, ...props }: SelectFieldProps) {
    const selectClassName = `${styles.inputField} ${error ? styles.inputError : ''}`.trim();
    const selectStyle: React.CSSProperties = {
        appearance: 'none', 
        backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13.6-6.4H18.8c-5.9%200-11.2%202.9-14.3%207.6s-2.8%2011%200%2016l128%20128c3.2%203.2%207.1%204.8%2011.6%204.8s8.4-1.6%2011.6-4.8l128-128c3.1-4.7%203.2-11.4%200-16z%22%2F%3E%3C%2Fsvg%3E")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '0.625rem 0.625rem',
        paddingRight: '2.5rem',
        cursor: 'pointer'
    };
    
    return (
        <div className={styles.inputContainer}>
            <label htmlFor={id} className={styles.inputLabel}>
                {label}
            </label>
            <select
                id={id}
                {...props}
                className={`${selectClassName} ${props.className ?? ''}`.trim()}
                style={selectStyle}
            >
                {options.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
            {error && <p className={styles.errorMessage}>{error}</p>}
        </div>
    );
}