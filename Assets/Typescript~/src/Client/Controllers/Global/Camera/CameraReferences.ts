import { WorldAPI } from "../../../../Shared/VoxelWorld/WorldAPI";
import { Mouse } from "../../../../Shared/UserInput";

export class CameraReferences {
	private readonly CameraBundleKey = "CameraRig";

	private static _instance: CameraReferences;
	public static Instance(): CameraReferences {
		if (!CameraReferences._instance) {
			new CameraReferences();
		}
		return CameraReferences._instance;
	}

	private mouse = new Mouse();
	public readonly mainCamera: Camera;
	public readonly fpsCamera: Camera;

	public constructor() {
		if (CameraReferences._instance) {
			error("TRYING TO INITIALIZE SINGLETON THAT ALREADY EXISTS: CameraReferences");
			return;
		}
		CameraReferences._instance = this;

		//Get Camera references
		let references = GameObjectReferences.GetReferences(this.CameraBundleKey);
		this.mainCamera = references.GetValue<Camera>("Cameras", "MainCamera");
		this.fpsCamera = references.GetValue<Camera>("Cameras", "FPSCamera");
	}

	public RaycastVoxelFromCamera(distance: number) {
		const ray = this.GetRayFromCamera(distance);
		return WorldAPI.GetMainWorld().RaycastVoxel(ray.origin, ray.direction, distance);
	}

	public RaycastPhysicsFromCamera(distance: number, layerMask?: number) {
		const ray = this.GetRayFromCamera(distance);
		return Physics.EasyRaycast(ray.origin, ray.direction, 40, layerMask);
	}

	public GetRayFromCamera(distance: number) {
		const ray = Camera.main.ScreenPointToRay(this.mouse.GetLocation());
		ray.direction = ray.direction.mul(distance);
		return ray;
	}
}
