import { OnStart } from "../../../Shared/Flamework";
import { Signal } from "../../../Shared/Util/Signal";
import { AuthController } from "../Auth/AuthController";
import { User } from "./User";
export declare class UserController implements OnStart {
    private readonly authController;
    localUser: User | undefined;
    onLocalUserUpdated: Signal<User>;
    private localUserLoaded;
    constructor(authController: AuthController);
    OnStart(): void;
    FetchLocalUser(): void;
    WaitForLocalUserReady(): void;
}
