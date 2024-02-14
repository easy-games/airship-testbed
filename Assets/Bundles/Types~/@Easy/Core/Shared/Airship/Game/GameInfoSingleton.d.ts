import { OnStart } from "../../Flamework";
import { GameData } from "../../GameData";
export declare class GameInfoSingleton implements OnStart {
    OnStart(): void;
    /** Yields */
    GetGameData(gameId: string): GameData | undefined;
}
