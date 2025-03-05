import { Airship } from "@Easy/Core/Shared/Airship";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import PredictedCommandManager, {
	CommandInstanceIdentifier,
} from "@Easy/Core/Shared/Network/PredictedCommands/PredictedCommandManager";
import { TestPredictedCommand } from "@Easy/Core/Shared/Network/PredictedCommands/Test";

export default class TestLocalCharacter extends AirshipSingleton {
	private cmd: CommandInstanceIdentifier;
	private canUseAt = 0;

	override Start(): void {
		PredictedCommandManager.Get().RegisterCommands({
			cmd: {
				handler: TestPredictedCommand,
			},
		});

		Airship.Input.CreateAction("t", Binding.Key(Key.Q));

		PredictedCommandManager.Get().onValidateCommand.Connect((event) => {
			print("validating" + event.commandId);
			if (event.commandId === "cmd" && this.canUseAt > Time.time) {
				print("can't use this yet");
				event.SetCancelled(true);
				return;
			}
			this.canUseAt = Time.time + 1;
		});
	}

	protected Update(dt: number): void {
		if (Airship.Input.IsDown("t") && !PredictedCommandManager.Get().IsCommandInstanceActive(this.cmd)) {
			this.cmd = PredictedCommandManager.Get().RunCommand("cmd");
		}
	}

	override OnDestroy(): void {}
}
