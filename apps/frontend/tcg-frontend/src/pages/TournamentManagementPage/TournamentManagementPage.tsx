import { useAuthContext } from "../../context/Auth/useAuthContext"
import { PageContainer } from "../PageContainer/PageContainer"

export const TournamentManagementPage = () => {
    const { role } = useAuthContext();
    const canManagement = role === 'admin' || role === 'organizer';
    if (!canManagement) {
        return (
            <PageContainer title="Acceso Denegado" subtitle="No tienes permisos para acceder a la gestión de torneos" role={role ? `Rol: ${role}` : "Invitado"}>
                <p>Inicia sesion</p>
            </PageContainer>
    )}

    return (
        <PageContainer title="Gestión de Torneos" subtitle="Crea, edita y administra tus torneos de cartas coleccionables" role={role && `Rol: ${role}`}>
            <section>
                <h2>Crear Nuevo Torneo</h2> 
                {/* Aquí iría el formulario para crear un nuevo torneo */}
            </section>
            <section>   
                <h2>Lista de Torneos Existentes</h2>
                {/* Aquí iría la lista de torneos con opciones para editar o eliminar */}
            </section>
        </PageContainer>
    )
}