import { Airship } from "../Airship";
import { CameraReferences } from "./CameraReferences";

export default class CameraRig extends AirshipBehaviour {
	@Header("Cameras")
	public mainCamera!: Camera;
	public viewmodelCamera!: Camera;
	public uiCamera!: Camera;

	public Awake(): void {}

	public OnEnable(): void {
		CameraReferences.cameraHolder = this.transform;
		CameraReferences.mainCamera = this.mainCamera;
		CameraReferences.viewmodelCamera = this.viewmodelCamera;
		CameraReferences.uiCamera = this.uiCamera;
		CameraReferences.existsCounter++;

		Airship.characterCamera.CreateCameraSystem();
	}

	override Start(): void {}

	override OnDestroy(): void {}

	public OnDisable(): void {
		CameraReferences.existsCounter--;
	}
}
