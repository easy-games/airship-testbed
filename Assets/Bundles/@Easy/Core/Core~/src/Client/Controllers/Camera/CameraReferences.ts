import { Mouse } from "Shared/UserInput";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

export class CameraReferences {
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
	public readonly uiCamera: Camera;

	public constructor() {
		if (CameraReferences._instance) {
			error("TRYING TO INITIALIZE SINGLETON THAT ALREADY EXISTS: CameraReferences");
			return;
		}
		CameraReferences._instance = this;

		//Get Camera references
		let refs = GameObject.Find("CameraRig")?.GetComponent<GameObjectReferences>();
		if (!refs) {
			error("Camera rig not found. Please make sure to add a CameraRig to scene.");
			return;
		}
		this.mainCamera = refs.GetValue<Camera>("Cameras", "MainCamera");
		this.fpsCamera = refs.GetValue<Camera>("Cameras", "FPSCamera");
		this.uiCamera = refs.GetValue<Camera>("Cameras", "UICamera");
	}

    /**
     * 
     * @param distance
     * @returns Will return undefined if a Voxel World doesn't exist.
     */
	public RaycastVoxelFromCamera(distance: number): VoxelRaycastResult | undefined {
		const ray = this.GetRayFromCamera(distance);
		return WorldAPI.GetMainWorld()?.RaycastVoxel(ray.origin, ray.direction, distance);
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
