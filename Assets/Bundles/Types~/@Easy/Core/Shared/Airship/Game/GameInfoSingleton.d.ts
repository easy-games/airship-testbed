import { GameDto } from "../../../Client/Components/HomePage/API/GamesAPI";
import { OnStart } from "../../Flamework";
export declare class GameInfoSingleton implements OnStart {
    OnStart(): void;
    /** Yields */
    GetGameData(gameId: string): GameDto | undefined;
}
