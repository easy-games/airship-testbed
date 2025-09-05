import { Keyboard } from "../../UserInput";
import PredictedCustomCommand from "./PredictedCustomCommand";

type InputCommand = [charging: boolean];

type StateData = [progress: number, completed: boolean];

export class TestPredictedCommand extends PredictedCustomCommand<InputCommand, StateData> {
	// references
	public vfx: any;

	// state
	private progress = 0;
	private completed = false;

	// constants
	private CHARGE_TIME_SEC = 1;

	Create(): void {
		this.character.movement.movementSettings.speed *= 0.1;
	}

	Destroy(): void {
		this.character.movement.movementSettings.speed /= 0.1;
	}

	GetCommand(): false | InputCommand {
		if (this.progress >= 100) return false;

		if (Keyboard.IsKeyDown(Key.Q)) {
			return [true];
		}
		return false;
	}

	override OnTick(input: Readonly<InputCommand> | undefined, replay: boolean, fullInput: CharacterInputData) {
		this.progress++;

		if (this.progress >= this.CHARGE_TIME_SEC / Time.fixedDeltaTime) {
			this.character.movement.AddImpulse(Vector3.up.normalized.mul(20));
			this.completed = true;
			return false;
		}
	}

	OnCaptureSnapshot(): StateData {
		return [this.progress, this.completed];
	}

	ResetToSnapshot(state: Readonly<StateData>): void {
		this.progress = state[0];
		this.completed = state[1];
	}

	CompareSnapshots(a: Readonly<StateData>, b: Readonly<StateData>): boolean {
		if (a[0] !== b[0]) return false;
		if (a[1] !== b[1]) return false;
		return true;
	}
}
