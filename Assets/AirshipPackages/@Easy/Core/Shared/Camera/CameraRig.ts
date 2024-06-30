import { Airship } from "../Airship";
import { Game } from "../Game";
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
		if (!Game.IsClient()) return;

		Airship.CharacterCamera.StopCameraSystem();

		CameraReferences.viewmodel = new Viewmodel();
		this.systemReference = Airship.CharacterCamera.StartNewCameraSystem(this);
	}

	override OnDestroy(): void {}

	public OnDisable(): void {
		if (!Game.IsClient()) return;

		if (Airship.CharacterCamera.cameraSystem === this.systemReference) {
			Airship.CharacterCamera.StopCameraSystem();
			CameraReferences.viewmodel?.Destroy();
			CameraReferences.viewmodel = undefined;
		}
	}
}
