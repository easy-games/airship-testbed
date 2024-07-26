import { Airship } from "../Airship";
import { Game } from "../Game";
import { Viewmodel } from "../Viewmodel/Viewmodel";
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

		Airship.Camera.StopCameraSystem();

		this.systemReference = Airship.Camera.StartNewCameraSystem(this);
		// Viewmodel
		if (Airship.Characters.instantiateViewmodel) {
			Airship.Characters.viewmodel = new Viewmodel();
		}
	}

	override OnDestroy(): void {}

	public OnDisable(): void {
		if (!Game.IsClient()) return;

		if (Airship.Camera.cameraSystem === this.systemReference) {
			Airship.Camera.StopCameraSystem();
			Airship.Characters.viewmodel?.Destroy();
			Airship.Characters.viewmodel = undefined;
		}
	}
}
