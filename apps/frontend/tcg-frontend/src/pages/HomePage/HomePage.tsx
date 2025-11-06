import { useAuthContext } from "../../context/Auth/useAuthContext";
import { PageContainer } from "../PageContainer/PageContainer";

export const HOME_PAGE_PATH = '/';

export const HomePage = () => {
    const { isLoggedIn, user } = useAuthContext();
    const title = isLoggedIn ? `Bienvenido de vuelta, ${user?.name}.` : 'Bienvenido a Torneos App.';

    //TODO separar en componentes
    const cardStyle: React.CSSProperties = { 
        backgroundColor: '#f3f4f6', 
        padding: '1.5rem', 
        borderRadius: '0.5rem', 
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', 
        transition: 'box-shadow 0.2s',
        borderLeft: '4px solid #f59e0b'
    };

    return (
        <PageContainer title={title} subtitle="Organiza y gestiona tus torneos de cartas coleccionables fácilmente" role={isLoggedIn ? "Usuario registrado" : "Invitado"}>
            <section>
                <h2>Torneos Destacados</h2>
                {// TODO separar en componentes
                 }
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                <div style={cardStyle}>
                    <h3 style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>Torneo de Lucha</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Inscripciones abiertas. Premio: $500 USD.</p>
                </div>
                <div style={cardStyle}>
                    <h3 style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>Torneo de Estrategia</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Inicia en 3 días. Necesitas 4 jugadores.</p>
                </div>
                <div style={cardStyle}>
                    <h3 style={{ fontWeight: '700', fontSize: '1.25rem', marginBottom: '0.5rem', color: '#1f2937' }}>Torneo RPG</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>¡Únete a la aventura!</p>
                </div>
            </div>
            </section>
    
        </PageContainer>
    );
}