import { Mouse } from "@Easy/Core/Shared/UserInput";

export class CameraReferences {
	public static cameraHolder?: Transform;
	public static mainCamera?: Camera;
	public static viewmodelCamera?: Camera;

	public static RaycastPhysicsFromCamera(distance: number, layerMask?: number) {
		const ray = this.GetRayFromCamera(distance);
		return Physics.EasyRaycast(ray.origin, ray.direction, 40, layerMask);
	}

	public static GetRayFromCamera(distance: number) {
		const ray = Camera.main.ScreenPointToRay(Mouse.GetPositionVector3());
		ray.direction = ray.direction.mul(distance);
		return ray;
	}
}
