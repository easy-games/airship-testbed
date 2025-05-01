import { Game } from "../../Game";
import { Keyboard } from "../../UserInput";
import { Bin } from "../../Util/Bin";
import PredictedCommandManager from "./PredictedCommandManager";
import PredictedCustomCommand from "./PredictedCustomCommand";

export class TestPredictedCommand extends PredictedCustomCommand<{ charging: boolean }, { progress: number }> {
	// references
	public vfx: any;

	// state
	private progress = 0;

	// constants
	private CHARGE_PER_TICK = 1;
	private bin = new Bin();

	Create(): void {
		this.character.movement.movementSettings.speed *= 0.1;
	}

	Destroy(): void {
		this.character.movement.movementSettings.speed /= 0.1;
		this.bin.Clean();
	}

	GetCommand(): false | { charging: boolean } {
		if (this.progress >= 100) return false;

		if (Keyboard.IsKeyDown(Key.Q)) {
			return { charging: true };
		}
		return false;
	}

	override OnTick(input: Readonly<{ charging: boolean }> | undefined, replay: boolean) {
		if (!input) return false;

		if (this.progress === 49 && Game.IsServer()) {
			this.character.movement.AddImpulse(new Vector3(0, 10, 0));
		}

		if (this.progress >= 50 && Game.IsServer()) {
			PredictedCommandManager.Get().CancelCommand(this.identifier);
		}

		this.progress = this.progress + this.CHARGE_PER_TICK;
		print("R:" + replay + " Progress: " + this.progress);
		if (this.progress >= 100) {
			print("launch!");
			const look = this.character.movement.GetLookVector();
			this.character.movement.AddImpulse(look.normalized.mul(20));
			return false;
		}
	}

	OnCaptureSnapshot(): { progress: number } {
		return {
			progress: this.progress,
		};
	}

	ResetToSnapshot(state: Readonly<{ progress: number }>): void {
		this.progress = state.progress;
		print("reset to" + this.progress);
	}

	CompareSnapshots(a: Readonly<{ progress: number }>, b: Readonly<{ progress: number }>): boolean {
		if (a.progress !== b.progress) return false;
		return true;
	}

	OnObserverUpdate(
		lastState: Readonly<{ progress: number }>,
		nextState: Readonly<{ progress: number }>,
		delta: number,
	): void {
		// this.vfx.UpdateProgress(math.lerp(lastState.progress, nextState.progress, delta));
	}
}
