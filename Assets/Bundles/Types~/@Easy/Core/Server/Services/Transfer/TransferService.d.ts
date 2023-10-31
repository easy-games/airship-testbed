import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { CreateServerResponse } from "./TransferServiceTypes";
export declare class TransferService implements OnStart {
    OnStart(): void;
    CreateServer(sceneId?: string): CreateServerResponse | undefined;
}
