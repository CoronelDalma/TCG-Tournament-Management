import styles from './PageContainer.module.css';

interface PageContainerProps {
    title?: string;
    subtitle?: string;
    role?: string;
    children?: React.ReactNode;
}

export const PageContainer = ({ title, subtitle, role, children }: PageContainerProps) => {
    return (
        <main className='mainContent'>
            <div className="container">
                <div className={styles.headerPage}>
                    {title && <h1 className={styles.titlePage}>{title}</h1>}
                    {subtitle && <p className={styles.subtitlePage}>{subtitle}</p>}
                    {role && <span className={styles.roleBadge}>{role}</span>}
                </div>
                {children}
            </div>
        </main>
    );
}