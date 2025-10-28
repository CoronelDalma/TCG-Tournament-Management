import { Round } from "../../entities";

export const RoundServiceMock = {
    createSwissRoundOne: function(roundData: Round): Promise<Round> {
        return Promise.resolve(roundData);
    }
}