import styles from "./Footer.module.css"

export const Footer = () => {
    return (
        <footer className={styles.footer}>
            <div className="container">
                <div className={styles.footerInner}>
                    <p>© 2025 Torneos App. Proyecto Arquitectura Limpia (TDD/SOLID).</p>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <a href="#" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.2s' }}>Contacto</a>
                        <a href="#" style={{ color: 'white', textDecoration: 'none', transition: 'color 0.2s' }}>Términos</a>
                    </div>
                </div>
            </div>
        </footer>
    )
}