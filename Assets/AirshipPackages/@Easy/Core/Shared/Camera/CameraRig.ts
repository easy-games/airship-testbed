import { Airship } from "../Airship";
import { CameraSystem } from "./CameraSystem";

export default class CameraRig extends AirshipBehaviour {
	@Header("Cameras")
	public mainCamera!: Camera;
	public viewmodelCamera!: Camera;
	public uiCamera!: Camera;

	private systemReference: CameraSystem | undefined;

	public Awake(): void {}

	public OnEnable(): void {
		print("CameraRig.OnEnable");
		Airship.characterCamera.StopCameraSystem();
		this.systemReference = Airship.characterCamera.StartNewCameraSystem(this);
	}

	override OnDestroy(): void {}

	public OnDisable(): void {
		print("CameraRig.OnDisable.1");
		if (Airship.characterCamera.cameraSystem === this.systemReference) {
			print("CameraRig.OnDisable.2");
			Airship.characterCamera.StopCameraSystem();
		}
	}
}
