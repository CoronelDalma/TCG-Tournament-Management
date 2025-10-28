import { Match, MatchResult, Round } from "../../entities";

export interface RoundService {
    createSwissRoundOne(roundData: Round): Promise<Round>;

    getMatchById(matchId: string): Promise<Match | null>;
    updateMatchResult(matchID: string, result:MatchResult, scrore: string): Promise<Match>;
    getRoundById(roundId: string): Promise<Round | null>;
    completeRound(roundId: string): Promise<Round>;
}