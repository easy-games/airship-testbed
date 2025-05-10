import { SetInterval } from "@Easy/Core/Shared/Util/Timer";

export default class WheelDebug extends AirshipBehaviour {
	public wheelCollider: WheelCollider;

	override Start(): void {
		SetInterval(1, () => {
			print("[WheelDebug] radius: " + this.wheelCollider.radius);

			print("[WheelDebug] ground hit: " + this.wheelCollider.GetGroundHit()?.collider.name);

			const [pos, quat] = this.wheelCollider.GetWorldPose();
			print("[WheelDebug] world pose: " + pos);
		});
	}

	protected Update(dt: number): void {}

	override OnDestroy(): void {}
}
