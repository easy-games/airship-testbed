import { OnStart } from "../../../Shared/Flamework";
import { AuthController } from "../Auth/AuthController";
export declare class ChangeUsernameController implements OnStart {
    private readonly authController;
    private canvas;
    private responseText;
    private submitButton;
    private submitButtonDisabled;
    private inputField;
    private inputFieldSelected;
    private lastCheckTime;
    private lastCheckedUsername;
    private lastInputTime;
    private checkInputDelay;
    private checkUsernameCooldown;
    private openBin;
    constructor(authController: AuthController);
    SubmitNameChange(): void;
    SetResponseText(status: "success" | "error" | "none", text: string): void;
    OnStart(): void;
    private CheckUsername;
    Open(): void;
}
