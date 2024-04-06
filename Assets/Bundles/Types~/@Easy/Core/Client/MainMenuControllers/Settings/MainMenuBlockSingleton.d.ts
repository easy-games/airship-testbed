/// <reference types="compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
interface BlockedGame {
    id: string;
    name: string;
}
export declare class MainMenuBlockSingleton implements OnStart {
    blockedGameIds: Set<string>;
    blockedGames: BlockedGame[];
    OnStart(): void;
    BlockGameAsync(gameId: string, gameName: string): void;
    UnblockGameAsync(gameId: string): void;
    IsGameIdBlocked(gameId: string): boolean;
    private SaveToDisk;
}
export {};
