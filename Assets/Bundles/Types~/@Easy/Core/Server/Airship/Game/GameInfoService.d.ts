/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
import { GameData } from "../../../Shared/GameData";
export declare class GameInfoService implements OnStart {
    OnStart(): void;
    GetGameData(gameId: string): Promise<GameData | undefined>;
}
