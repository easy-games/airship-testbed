/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Party } from "../../../Shared/SocketIOMessages/Party";
import { Result } from "../../../Shared/Types/Result";
export declare class PartyController implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Gets the users current party data.
     */
    GetParty(): Promise<Result<Party, undefined>>;
}
