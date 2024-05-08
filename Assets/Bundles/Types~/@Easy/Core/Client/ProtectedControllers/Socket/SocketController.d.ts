import { OnStart } from "../../../Shared/Flamework";
import { AuthController } from "../Auth/AuthController";
export declare class SocketController implements OnStart {
    private readonly authController;
    private onEvent;
    constructor(authController: AuthController);
    OnStart(): void;
    On<T = unknown>(eventName: string, callback: (data: T) => void): void;
    Emit(eventName: string, data?: unknown): void;
    private Connect;
}
