/// <reference types="compiler-types" />
import { OnStart } from "../../../../Shared/Flamework";
import { Result } from "../../../../Shared/Types/Result";
export declare class MatchmakingController implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Checks for updates in the users matchmaking status. Your game must be enrolled in matchmaking services
     * for this function to work.
     */
    GetStatus(): Promise<Result<undefined, undefined>>;
}
