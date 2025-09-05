import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import PredictedCommandManager, {
	CommandInstanceIdentifier,
} from "@Easy/Core/Shared/Network/PredictedCommands/PredictedCommandManager";
import { TestPredictedCommand } from "@Easy/Core/Shared/Network/PredictedCommands/Test";

export default class TestLocalCharacter extends AirshipSingleton {
	// Constants
	private CMD_IDENTIFIER = "cmd";
	private CMD_COOLDOWN_SEC = 3;
	private CMD_ACTION_NAME = "Ability";

	// Cooldown tracking
	private canUseAt = new Map<number, number>();

	// Client only local command tracking
	private localCommand: CommandInstanceIdentifier | undefined;

	override Start(): void {
		PredictedCommandManager.Get().RegisterCommands({
			[this.CMD_IDENTIFIER]: {
				handler: TestPredictedCommand,
			},
		});

		PredictedCommandManager.Get().onValidateCommand.Connect((event) => {
			if (event.commandId !== this.CMD_IDENTIFIER) return;
			const nextUseTime = this.canUseAt.get(event.character.id) ?? 0;
			if (nextUseTime > Time.time) {
				event.SetCancelled(true);
				return;
			}
		});

		PredictedCommandManager.Get().onCommandEnded.Connect((command, result) => {
			const finalState = result as [progress: number, completed: boolean];
			if (finalState && finalState[1] === true) {
				this.canUseAt.set(command.characterId, Time.time + this.CMD_COOLDOWN_SEC);
			}
		});

		Airship.Characters.ObserveCharacters((character) => {
			return () => {
				this.canUseAt.delete(character.id);
			};
		});

		if (Game.IsClient()) {
			Airship.Input.CreateAction(this.CMD_ACTION_NAME, Binding.Key(Key.Q));
			Airship.Input.OnDown(this.CMD_ACTION_NAME).Connect(() => {
				if (
					this.localCommand &&
					PredictedCommandManager.Get().IsCommandInstanceActive(this.localCommand, true, true)
				) {
					return;
				}
				this.localCommand = PredictedCommandManager.Get().RunCommand(this.CMD_IDENTIFIER);
			});
		}
	}

	override OnDestroy(): void {}
}
