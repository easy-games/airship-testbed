//import {CameraController} from "./CameraController";
import { EntityReferences } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { Bin } from "Shared/Util/Bin";
import { SignalPriority } from "Shared/Util/Signal";
import { OnLateUpdate } from "Shared/Util/Timer";
import { CameraReferences } from "./CameraReferences";

export class FirstPersonCameraSystem {
	public cameras: CameraReferences;
	//public spineLerpModMin = 25;
	//public spineLerpModMax = 75;
	//public spineLerpMaxAngle = 75;

	private manualSpineOffset = 0.28;
	private calculatedSpineOffset: Vector3 = Vector3.zero;

	private entityReferences: EntityReferences;
	private cameraVars: DynamicVariables;
	private trackedHeadRotation: Quaternion = Quaternion.identity;
	private inFirstPerson;
	private bin: Bin;
	private originalSpineMiddlePosition: Vector3 = Vector3.zero;
	private originalSpineTopPosition: Vector3 = Vector3.zero;
	private originalShoulderLPosition: Vector3 = Vector3.zero;
	private originalShoulderRPosition: Vector3 = Vector3.zero;

	public constructor(entityReferences: EntityReferences, startInFirstPerson: boolean) {
		this.entityReferences = entityReferences;
		this.cameraVars = DynamicVariablesManager.Instance.GetVars("Camera")!;

		this.cameras = CameraReferences.Instance();

		//Store the default spine positions
		this.originalSpineMiddlePosition = this.entityReferences.spineBoneMiddle.localPosition;
		this.originalSpineTopPosition = this.entityReferences.spineBoneTop.localPosition;
		this.originalShoulderLPosition = this.entityReferences.shoulderL.localPosition;
		this.originalShoulderRPosition = this.entityReferences.shoulderR.localPosition;

		//Calculate how high the neck bone is off the spine bone
		// const spinePos = this.entityReferences.spineBoneMiddle.position;
		// const neckPos = new Vector3(spinePos.x, this.entityReferences.neckBone.position.y, spinePos.z);
		// //this.manualSpineOffset = this.cameraVars.GetVector3("FPSHeadOffset");
		// this.calculatedSpineOffset = new Vector3(0, this.manualSpineOffset, 0).add(neckPos.sub(spinePos));
		// print("calculatedSpineOffset: " + this.calculatedSpineOffset);
		this.calculatedSpineOffset = new Vector3(0, this.manualSpineOffset, 0);

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

		//Get the cameras transform information
		const transform = this.cameras.fpsCamera.transform;
		let headLookPosition = transform.position;
		let headLookRotation = transform.rotation;

		//Animated to the look direction
		/*let diffAngle = Quaternion.Angle(this.trackedHeadRotation, headLookRotation);
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
		);*/

		this.trackedHeadRotation = headLookRotation;

		//Calculate new position based on head rotation
		let newPosition = headLookPosition.sub(this.trackedHeadRotation.mul(this.calculatedSpineOffset));

		//let headBob = new Vector3(0, math.sin(Time.deltaTime * ,0);

		//Apply the new rotation
		this.entityReferences.spineBoneMiddle.rotation = this.trackedHeadRotation;
		this.entityReferences.spineBoneTop.localRotation = Quaternion.identity;

		//Apply the new positions
		this.entityReferences.spineBoneMiddle.position = newPosition;
		this.entityReferences.spineBoneTop.position = newPosition;
	}

	public OnFirstPersonChanged(isFirstPerson: boolean) {
		this.inFirstPerson = isFirstPerson;
		this.cameras.fpsCamera.gameObject.SetActive(isFirstPerson);
		Game.LocalPlayer.character?.animator?.SetFirstPerson(isFirstPerson);
		this.trackedHeadRotation = this.cameras.fpsCamera.transform.rotation;
		this.entityReferences.humanEntityAnimator.SetForceLookForward(!isFirstPerson);

		//Reset shoulders since not all animations will key these values
		this.entityReferences.shoulderL.localPosition = this.originalShoulderLPosition;
		this.entityReferences.shoulderR.localPosition = this.originalShoulderRPosition;

		if (!isFirstPerson) {
			//Reset the spine positions to defaults after messing with them in first person
			this.entityReferences.spineBoneMiddle.localPosition = this.originalSpineMiddlePosition;
			this.entityReferences.spineBoneTop.localPosition = this.originalSpineTopPosition;
		}
	}
}
