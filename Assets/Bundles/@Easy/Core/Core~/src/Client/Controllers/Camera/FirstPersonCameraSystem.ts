//import {CameraController} from "./CameraController";
import { EntityReferences } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { Bin } from "Shared/Util/Bin";
import { SignalPriority } from "Shared/Util/Signal";
import { OnLateUpdate } from "Shared/Util/Timer";
import { CameraReferences } from "./CameraReferences";

interface BobData {
	bobMovementFrequency: number;
	bobMovementMagnitude: number;
	bobRotationMagnitude: number;
}

export class FirstPersonCameraSystem {
	public cameras: CameraReferences;

	private sprintingBob: BobData = {
		bobMovementFrequency: 20,
		bobMovementMagnitude: 0.015,
		bobRotationMagnitude: 2.5,
	};

	private slidingBob: BobData = {
		bobMovementFrequency: 12,
		bobMovementMagnitude: 0.0075,
		bobRotationMagnitude: 1,
	};
	private bobData: BobData = this.sprintingBob;

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
	private bobStrength = 0;

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

		//Get the cameras transform
		const transform = this.cameras.fpsCamera.transform;

		//Head bobbing when running
		//this.bobMovementFrequency = this.cameraVars.GetNumber("FPSBobFrequency");
		//this.bobMovementMagnitude = this.cameraVars.GetNumber("FPSBobMagnitude");
		//this.bobRotationMagnitude = this.cameraVars.GetNumber("FPSBobRotMagnitude");
		const headBobOffset = new Vector3(
			0,
			math.sin(Time.time * this.bobData.bobMovementFrequency) *
				this.bobData.bobMovementMagnitude *
				this.bobStrength,
			0,
		);
		const headBobRotationOffset = Quaternion.Euler(
			math.sin((Time.time * this.bobData.bobMovementFrequency) / 2) *
				this.bobData.bobRotationMagnitude *
				this.bobStrength,
			0,
			0,
		);

		let headLookPosition = transform.position;
		let headLookRotation = transform.rotation.mul(headBobRotationOffset);

		//Animated to the look direction
		// let diffAngle = Quaternion.Angle(this.trackedHeadRotation, headLookRotation);
		// let lerpMod = MathUtil.Lerp(
		// 	this.cameraVars.GetNumber("FPSLerpMin"),
		// 	this.cameraVars.GetNumber("FPSLerpMax"),
		// 	diffAngle / this.cameraVars.GetNumber("FPSLerpRange"),
		// );
		//let lerpMod = MathUtil.Lerp(25, 75, diffAngle / 90);

		//Move the spine to match where the camera is looking
		// this.trackedHeadRotation = Quaternion.Slerp(
		// 	this.trackedHeadRotation,
		// 	headLookRotation,
		// 	Time.deltaTime * this.cameraVars.GetNumber("FPSLerpMax"),
		// );

		this.trackedHeadRotation = headLookRotation;

		//Calculate new position based on head rotation
		let newPosition = headLookPosition.sub(
			this.trackedHeadRotation.mul(this.calculatedSpineOffset.add(headBobOffset)),
		);

		//Apply the new rotation
		this.entityReferences.spineBoneMiddle.rotation = this.trackedHeadRotation;
		this.entityReferences.spineBoneTop.localRotation = Quaternion.identity;

		//Apply the new positions
		this.entityReferences.spineBoneMiddle.position = newPosition;
		this.entityReferences.spineBoneTop.position = newPosition;
	}

	public OnMovementStateChange(state: EntityState) {
		if (state === EntityState.Sprinting) {
			this.bobData = this.sprintingBob;
			this.bobStrength = 1;
		} else if (state === EntityState.Sliding) {
			this.bobData = this.slidingBob;
			this.bobStrength = 1;
		} else if (state === EntityState.Jumping) {
			this.bobData = this.slidingBob;
			this.bobStrength = 0.5;
		} else {
			this.bobStrength = 0;
		}
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
