import { Mouse } from "@Easy/Core/Shared/UserInput";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";
import { Viewmodel } from "../Viewmodel/Viewmodel";

export class CameraReferences {
	private static mouse = new Mouse();
	public static cameraHolder?: Transform;
	public static mainCamera?: Camera;
	public static viewmodelCamera?: Camera;

	public static viewmodel?: Viewmodel;

	/**
	 *
	 * @param distance
	 * @returns Will return undefined if a Voxel World doesn't exist.
	 */
	public static RaycastVoxelFromCamera(distance: number): VoxelRaycastResult | undefined {
		const ray = this.GetRayFromCamera(distance);
		return WorldAPI.GetMainWorld()?.RaycastVoxel(ray.origin, ray.direction, distance);
	}

	public static RaycastPhysicsFromCamera(distance: number, layerMask?: number) {
		const ray = this.GetRayFromCamera(distance);
		return Physics.EasyRaycast(ray.origin, ray.direction, 40, layerMask);
	}

	public static GetRayFromCamera(distance: number) {
		const ray = Camera.main.ScreenPointToRay(this.mouse.GetPositionV3());
		ray.direction = ray.direction.mul(distance);
		return ray;
	}
}
