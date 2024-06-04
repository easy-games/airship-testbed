import { Airship } from "../Airship";
import { Viewmodel } from "../Viewmodel/Viewmodel";
import { CameraReferences } from "./CameraReferences";
import { CameraSystem } from "./CameraSystem";

export default class CameraRig extends AirshipBehaviour {
	@Header("Cameras")
	public mainCamera!: Camera;
	public viewmodelCamera!: Camera;
	public uiCamera!: Camera;

	private systemReference: CameraSystem | undefined;

	public Awake(): void {}

	public OnEnable(): void {
		Airship.characterCamera.StopCameraSystem();

		CameraReferences.viewmodel = new Viewmodel();
		this.systemReference = Airship.characterCamera.StartNewCameraSystem(this);
	}

	override OnDestroy(): void {}

	public OnDisable(): void {
		if (Airship.characterCamera.cameraSystem === this.systemReference) {
			Airship.characterCamera.StopCameraSystem();
			CameraReferences.viewmodel?.Destroy();
			CameraReferences.viewmodel = undefined;
		}
	}
}
