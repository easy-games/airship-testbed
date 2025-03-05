import { Keyboard } from "../../UserInput";
import { Bin } from "../../Util/Bin";
import inspect from "../../Util/Inspect";
import PredictedCustomCommand from "./PredictedCustomCommand";

export class TestPredictedCommand extends PredictedCustomCommand<{ charging: boolean }, { progress: number }> {
	// references
	public vfx: any;

	// state
	private progress = 0;

	private CHARGE_PER_TICK = 1;

	private bin = new Bin();

	Create(): void {
		print("creating");
		this.character.movement.movementSettings.speed *= 0.1;
	}

	Destroy(): void {
		print("destroying");
		this.character.movement.movementSettings.speed /= 0.1;
		this.bin.Clean();
	}

	GetCommand(): false | { charging: boolean } {
		print("progress was " + this.progress + " on input");
		if (this.progress >= 100) return false;

		if (Keyboard.IsKeyDown(Key.Q)) {
			return { charging: true };
		}
		print("command ending");
		return false;
	}

	OnTick(input: Readonly<{ charging: boolean }> | undefined, replay: boolean) {
		print("input was" + inspect(input));
		//Todo: Ignore null input, continue making progress until fire
		if (!input) return false;

		this.progress = this.progress + this.CHARGE_PER_TICK;
		print("Progress" + this.progress);
		if (this.progress >= 100) {
			print("LAUNCH!");
			this.character.movement.AddImpulse(new Vector3(0, 10, 0));
			return false;
		}
	}

	OnCaptureSnapshot(): { progress: number } {
		print("reporting progress" + this.progress);
		return {
			progress: this.progress,
		};
	}

	ResetToSnapshot(state: Readonly<{ progress: number }>): void {
		print("resetting to state" + inspect(state));
		this.progress = state.progress;
	}

	CompareSnapshots(a: Readonly<{ progress: number }>, b: Readonly<{ progress: number }>): boolean {
		print("comparing" + inspect(a) + " " + inspect(b));
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
