/// <reference types="compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
interface BlockedGame {
    id: string;
    name: string;
}
interface BlockedUser {
    uid: string;
    username: string;
}
export declare class MainMenuBlockSingleton implements OnStart {
    blockedGameIds: Set<string>;
    blockedGames: BlockedGame[];
    blockedUserIds: Set<string>;
    blockedUsers: BlockedUser[];
    OnStart(): void;
    BlockGameAsync(gameId: string, gameName: string): void;
    UnblockGameAsync(gameId: string): void;
    IsGameIdBlocked(gameId: string): boolean;
    BlockUserAsync(uid: string, username: string): void;
    UnblockUserAsync(uid: string): void;
    IsUserIdBlocked(uid: string): boolean;
    private SaveToDisk;
}
export {};
