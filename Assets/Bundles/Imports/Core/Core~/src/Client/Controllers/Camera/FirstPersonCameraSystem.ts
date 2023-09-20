//import {CameraController} from "./CameraController";
import { EntityReferences } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { Bin } from "Shared/Util/Bin";
import { MathUtil } from "Shared/Util/MathUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { OnLateUpdate } from "Shared/Util/Timer";
import { CameraReferences } from "./CameraReferences";

export class FirstPersonCameraSystem {
	public cameras: CameraReferences;
	//public spineLerpModMin = 25;
	//public spineLerpModMax = 75;
	//public spineLerpMaxAngle = 75;

	private manualSpineOffset: Vector3 = new Vector3(0, 0.78, 0);

	private entityReferences: EntityReferences;
	private cameraVars: DynamicVariables;
	private trackedHeadRotation: Quaternion = Quaternion.identity;
	//private neckOffset: Vector3;
	private inFirstPerson;
	private bin: Bin;

	public constructor(entityReferences: EntityReferences, startInFirstPerson: boolean) {
		this.entityReferences = entityReferences;
		this.cameraVars = DynamicVariablesManager.Instance.GetVars("Camera")!;

		this.cameras = CameraReferences.Instance();

		this.inFirstPerson = startInFirstPerson;
		this.OnFirstPersonChanged(this.inFirstPerson);

		this.bin = new Bin();
		this.bin.Add(() => {
			// Pooling: reset back to third person.
			this.OnFirstPersonChanged(false);
		});

		this.bin.Add(OnLateUpdate.ConnectWithPriority(SignalPriority.HIGH, () => this.LateUpdate()));
	}

	public Destroy() {
		this.bin.Clean();
	}

	private LateUpdate() {
		if (!this.inFirstPerson) {
			return;
		}

		//Calculate how high the neck bone is off the spine bone
		// this.manualSpineOffset = this.cameraVars.GetVector3("FPSHeadOffset");
		let neckOffset = this.manualSpineOffset.add(
			this.entityReferences.neckBone.position.sub(this.entityReferences.spineBone3.position),
		);

		//Get the cameras transform information
		let headLookPosition = this.cameras.fpsCamera.transform.position;
		let headLookRotation = this.cameras.fpsCamera.transform.rotation;

		let diffAngle = Quaternion.Angle(this.trackedHeadRotation, headLookRotation);
		// let lerpMod = MathUtil.Lerp(
		// 	this.cameraVars.GetNumber("FPSLerpMin"),
		// 	this.cameraVars.GetNumber("FPSLerpMax"),
		// 	diffAngle / this.cameraVars.GetNumber("FPSLerpRange"),
		// );
		let lerpMod = MathUtil.Lerp(10, 40, diffAngle / 90);

		//Move the spine to match where the camera is looking
		this.trackedHeadRotation = Quaternion.Slerp(
			this.trackedHeadRotation,
			headLookRotation,
			Time.deltaTime * lerpMod,
		);
		this.trackedHeadRotation = headLookRotation;

		//Calculate new position based on head rotation
		let newPosition = headLookPosition.sub(this.trackedHeadRotation.mul(neckOffset));

		//let headBob = new Vector3(0, math.sin(Time.deltaTime * ,0);

		//Apply the new rotation
		this.entityReferences.spineBone2.rotation = this.trackedHeadRotation;

		//Apply the new positions
		this.entityReferences.spineBone2.position = newPosition;
		this.entityReferences.spineBone3.position = newPosition;
	}

	public OnFirstPersonChanged(isFirstPerson: boolean) {
		this.inFirstPerson = isFirstPerson;
		this.cameras.fpsCamera.gameObject.SetActive(isFirstPerson);
		Game.LocalPlayer.Character?.anim?.SetFirstPerson(isFirstPerson);
		this.trackedHeadRotation = this.cameras.fpsCamera.transform.rotation;

		//In First person hide all meshes except the arm
		for (let i = 0; i < this.entityReferences.meshes.size(); i++) {
			this.entityReferences.meshes[i].gameObject.SetActive(!isFirstPerson);
		}
		this.entityReferences.fpsMesh.gameObject.SetActive(isFirstPerson);
		this.entityReferences.humanEntityAnimator.SetForceLookForward(!isFirstPerson);
	}
}
