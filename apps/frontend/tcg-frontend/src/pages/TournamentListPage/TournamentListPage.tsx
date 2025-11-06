import { PageContainer } from "../PageContainer/PageContainer"

interface TournamentListPageProps {
    type?: string;
}
export const TournamentListPage = ({type}: TournamentListPageProps) => {
    return (
        <PageContainer title={`Lista de Torneos ${type}`} subtitle="Explora y únete a torneos de cartas coleccionables">
            <section>
                <h2>Torneos Disponibles</h2>
                {/* Aquí iría la lista de torneos disponibles */}
            </section>
        </PageContainer>
    )
}