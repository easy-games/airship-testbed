import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

export default class WheelDebug extends AirshipBehaviour {
	public wheelCollider: WheelCollider;

	override Start(): void {
		SetInterval(1, () => {
			print("radius: " + this.wheelCollider.radius);
		});
	}

	protected Update(dt: number): void {}

	override OnDestroy(): void {}
}
