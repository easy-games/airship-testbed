import { Bin } from "Shared/Util/Bin";
import { SetInterval, SetIntervalWithModifier } from "Shared/Util/Timer";

export enum MeshFlashType {
	Tween,
	Instant,
}

export default class MeshFlashingBehaviour extends AirshipBehaviour {
	private originalColor!: Color;

	public meshRenderer!: MeshRenderer;

	public flashFrequency = 0.5;
	public flashIntensity = 2;

	public Start(): void {
		this.originalColor = Color.white;
	}

	public TweenFlash(count = 1, frequency = this.flashFrequency) {
		const { r, g, b } = this.originalColor;
		const intensity = (r + g + b) / 3;
		const factor = this.flashIntensity / intensity;

		for (const _ of $range(1, count)) {
			this.meshRenderer.TweenMaterialColor(new Color(r * factor, g * factor, b * factor), frequency / 2);
			task.wait(frequency / 2);
			if (this.meshRenderer.material) this.meshRenderer.TweenMaterialColor(this.originalColor, frequency / 2);
		}
	}

	public InstantFlash(count = 1, frequency = this.flashFrequency) {
		const { r, g, b } = this.originalColor;
		const intensity = (r + g + b) / 3;
		const factor = this.flashIntensity / intensity;

		for (const _ of $range(1, count)) {
			this.meshRenderer.material.color = new Color(r * factor, g * factor, b * factor);
			task.wait(frequency / 2);
			if (this.meshRenderer.material) this.meshRenderer.material.color = this.originalColor;
		}
	}

	private flashingBin = new Bin();

	public FlashStart(flashType: MeshFlashType, options: MeshFlashOptions) {
		if (options.IntervalTickMod) {
			this.flashingBin.Add(
				SetIntervalWithModifier(
					options.Frequency ?? this.flashFrequency,
					(interval, setInterval) => {
						if (flashType === MeshFlashType.Instant) {
							this.InstantFlash(undefined, interval);
						} else {
							this.TweenFlash(undefined, interval);
						}
						setInterval(interval * options.IntervalTickMod!);
					},
					options.Immediate,
				),
			);
		} else {
			this.flashingBin.Add(
				SetInterval(
					options.Frequency ?? this.flashFrequency,
					() => {
						if (flashType === MeshFlashType.Instant) {
							this.InstantFlash();
						} else {
							this.TweenFlash();
						}
					},
					options.Immediate,
				),
			);
		}
	}

	public FlashStop() {
		this.meshRenderer.material.color = this.originalColor;
		this.flashingBin.Clean();
	}
}

export interface MeshFlashOptions {
	readonly IntervalTickMod?: number;
	readonly Frequency?: number;
	readonly Immediate?: boolean;
}
