import { Airship } from "@Easy/Core/Shared/Airship";
import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import { SaveWorldCommand } from "./Commands/SaveWorldCommand";

@Service({})
export class SurvivalCommandService implements OnStart {
    OnStart(): void {
        this.RegisterSurvivalCommands();
    }

    private RegisterSurvivalCommands() {
        Airship.Chat.RegisterCommand(new SaveWorldCommand());
    }
}
