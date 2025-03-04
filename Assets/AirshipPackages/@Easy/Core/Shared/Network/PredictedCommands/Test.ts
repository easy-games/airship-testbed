import { Game } from "../../Game";
import { Keyboard } from "../../UserInput";
import PredictedCustomCommand from "./PredictedCustomCommand";

class Test extends PredictedCustomCommand<{ charging: boolean }, { progress: number }> {
	// references
	public vfx: any;

	// input
	private isDown = false;

	// state
	private progress = 0;

	private CHARGE_PER_TICK = 1;

	protected Update(dt: number): void {
		if (!this.isDown && Keyboard.IsKeyDown(Key.Q)) {
			this.isDown = true;
		}

		this.vfx.UpdateProgress(this.progress);
	}

	GetCommand(): false | { charging: boolean } {
		if (this.progress >= 100) return false;

		if (this.isDown) {
			this.isDown = false;
			return { charging: true };
		}
		return false;
	}

	OnTick(input: Readonly<{ charging: boolean }> | undefined, replay: boolean) {
		if (!input) return false;

		this.progress = this.progress + this.CHARGE_PER_TICK;
		if (this.progress >= 100) {
			Game.localPlayer.character?.movement.AddImpulse(new Vector3(0, 100, 0));
		}

		Game.localPlayer.character!.movement.movementSettings.speed = this.progress;
	}

	OnCaptureSnapshot(): { progress: number } {
		return {
			progress: this.progress,
		};
	}

	ResetToSnapshot(state: Readonly<{ progress: number }>): void {
		this.progress = state.progress;
		Game.localPlayer.character!.movement.movementSettings.speed = state.progress;
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
		this.vfx.UpdateProgress(math.lerp(lastState.progress, nextState.progress, delta));
	}
}
