import { Bin } from "Shared/Util/Bin";
import { SetInterval } from "Shared/Util/Timer";

export default class MeshFlashingBehaviour extends AirshipBehaviour {
	private originalColor!: Color;

	public meshRenderer!: MeshRenderer;
	public flashFrequency = 0.5;

	public Start(): void {
		this.originalColor = Color.white;
	}

	public Flash(count = 1) {
		this.meshRenderer.TweenMaterialColor(new Color(2, 2, 2), this.flashFrequency / 2);
		task.wait(this.flashFrequency / 2);
		this.meshRenderer.TweenMaterialColor(this.originalColor, this.flashFrequency / 2);
	}

	private flashingBin = new Bin();

	public FlashStart() {
		this.flashingBin.Add(
			SetInterval(this.flashFrequency, () => {
				this.Flash();
			}),
		);
	}

	public FlashStop() {
		this.flashingBin.Clean();
		this.meshRenderer.material.color = this.originalColor;
	}
}
