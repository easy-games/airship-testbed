import { OnStart } from "@easy-games/flamework-core";
import { ClientSettingsController } from "Client/Controllers/ClientSettings/ClientSettingsController";
import { EscapeMenuController } from "./EscapeMenuController";
export declare class ClientSettingsUIController implements OnStart {
    private readonly clientSettingsController;
    private readonly escapeMenuController;
    private refs;
    constructor(clientSettingsController: ClientSettingsController, escapeMenuController: EscapeMenuController);
    OnStart(): void;
    private SetupSlider;
}
