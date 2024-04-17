import { CameraMode } from "../CameraMode";
import { CameraTransform } from "../CameraTransform";

export class StaticCameraMode extends CameraMode {
	private transform: CameraTransform;

	constructor(position: Vector3, rotation: Quaternion) {
		super();
		this.transform = new CameraTransform(position, rotation);
	}

	OnStart(camera: Camera, rootTransform: Transform) {}

	OnStop() {}

	OnUpdate(dt: number) {}

	OnPostUpdate() {}

	OnLateUpdate() {
		return this.transform;
	}
}
