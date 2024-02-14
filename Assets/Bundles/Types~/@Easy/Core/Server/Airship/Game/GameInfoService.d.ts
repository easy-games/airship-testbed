import { OnStart } from "../../../Shared/Flamework";
import { GameData } from "../../../Shared/GameData";
export declare class GameInfoService implements OnStart {
    OnStart(): void;
    /** Yields */
    GetGameData(gameId: string): GameData | undefined;
}
