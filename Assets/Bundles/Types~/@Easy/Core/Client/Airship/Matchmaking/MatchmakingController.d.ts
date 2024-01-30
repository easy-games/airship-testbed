/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Result } from "../../../Shared/Types/Result";
export declare class MatchmakingController implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Checks for updates in the users matchmaking status. Your game must be enrolled in matchmaking services
     * for this function to work.
     */
    GetStatus(): Promise<Result<undefined, undefined>>;
}
