import { Mouse } from "@Easy/Core/Shared/UserInput";
import CameraRig from "./CameraRig";

/** @deprecated use Airship.Camera instead */
export class CameraReferences {
	/** @deprecated use Airship.Camera.CameraRig instead */
	public static cameraHolder?: Transform;

	/** @deprecated use Airship.Camera.CameraRig instead */
	public static mainCamera?: Camera;

	/** @deprecated use Airship.Camera.CameraRig instead */
	public static viewmodelCamera?: Camera;

	public static cameraRig?: CameraRig;

	/** @deprecated will be removed soon */
	public static GetRayFromCamera(distance: number) {
		const ray = Camera.main.ScreenPointToRay(Mouse.GetPositionVector3());
		ray.direction = ray.direction.mul(distance);
		return ray;
	}
}
