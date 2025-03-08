import { Airship } from "@Easy/Core/Shared/Airship";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import PredictedCommandManager, {
	CommandInstanceIdentifier,
} from "@Easy/Core/Shared/Network/PredictedCommands/PredictedCommandManager";
import { TestPredictedCommand } from "@Easy/Core/Shared/Network/PredictedCommands/Test";
import inspect from "@Easy/Core/Shared/Util/Inspect";

export default class TestLocalCharacter extends AirshipSingleton {
	private CMD_IDENTIFIER = "cmd";
	private cmd: CommandInstanceIdentifier;
	private canUseAt = 0;

	override Start(): void {
		PredictedCommandManager.Get().RegisterCommands({
			[this.CMD_IDENTIFIER]: {
				handler: TestPredictedCommand,
			},
		});

		Airship.Input.CreateAction("t", Binding.Key(Key.Q));

		PredictedCommandManager.Get().onValidateCommand.Connect((event) => {
			if (event.commandId === this.CMD_IDENTIFIER && this.canUseAt > Time.time) {
				event.SetCancelled(true);
				return;
			}
			this.canUseAt = Time.time + 3;
		});

		PredictedCommandManager.Get().onCommandEnded.Connect((commandId) => {
			print("Ended " + inspect(commandId));
		});
	}

	protected Update(dt: number): void {
		if (Airship.Input.IsDown("t") && !PredictedCommandManager.Get().IsCommandInstanceActive(this.cmd)) {
			this.cmd = PredictedCommandManager.Get().RunCommand(this.CMD_IDENTIFIER);
		}
	}

	override OnDestroy(): void {}
}
