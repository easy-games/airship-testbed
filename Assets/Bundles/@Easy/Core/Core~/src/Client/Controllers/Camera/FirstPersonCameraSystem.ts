//import {CameraController} from "./CameraController";
import { EntityReferences } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { Bin } from "Shared/Util/Bin";
import { MathUtil } from "Shared/Util/MathUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { OnLateUpdate } from "Shared/Util/Timer";
import { CameraReferences } from "./CameraReferences";

interface BobData {
	bobMovementFrequency: number;
	bobMovementMagnitude: number;
	bobRotationMagnitude: number;
}

export class FirstPersonCameraSystem {
	private bobLerpMod = 10;
	public cameras: CameraReferences;

	private sprintingBob: BobData = {
		bobMovementFrequency: 22,
		bobMovementMagnitude: 0.015,
		bobRotationMagnitude: 2.5,
	};
	private walkingBob: BobData = {
		bobMovementFrequency: 15,
		bobMovementMagnitude: 0.0075,
		bobRotationMagnitude: 1,
	};
	private slidingBob: BobData = {
		bobMovementFrequency: 12,
		bobMovementMagnitude: 0.0075,
		bobRotationMagnitude: 1,
	};

	private targetBobData: BobData = this.sprintingBob;
	private currentBobData: BobData = {
		bobMovementFrequency: 0,
		bobMovementMagnitude: 0,
		bobRotationMagnitude: 0,
	};
	private targetBobStrength = 0;
	private currentBobStrength = 0;

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
	private currentTime = 0.01;

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
		this.currentTime += Time.deltaTime;

		//Head bobbing when running
		//this.bobMovementFrequency = this.cameraVars.GetNumber("FPSBobFrequency");
		//this.bobMovementMagnitude = this.cameraVars.GetNumber("FPSBobMagnitude");
		//this.bobRotationMagnitude = this.cameraVars.GetNumber("FPSBobRotMagnitude");
		const lerpDelta = Time.deltaTime * this.bobLerpMod;
		this.currentBobStrength = MathUtil.Lerp(this.currentBobStrength, this.targetBobStrength, lerpDelta);

		this.currentBobData.bobMovementMagnitude = MathUtil.Lerp(
			this.currentBobData.bobMovementMagnitude,
			this.targetBobData.bobMovementMagnitude,
			lerpDelta,
		);

		this.currentBobData.bobRotationMagnitude = MathUtil.Lerp(
			this.currentBobData.bobRotationMagnitude,
			this.targetBobData.bobRotationMagnitude,
			lerpDelta,
		);

		const headBobOffset = new Vector3(
			0,
			math.sin(this.currentTime * this.currentBobData.bobMovementFrequency) *
				this.currentBobData.bobMovementMagnitude *
				this.currentBobStrength,
			0,
		);
		const headBobRotationOffset = Quaternion.Euler(
			math.sin((this.currentTime * this.currentBobData.bobMovementFrequency) / 2) *
				this.currentBobData.bobRotationMagnitude *
				this.currentBobStrength,
			0,
			0,
		);

		//Get the cameras transform
		const transform = this.cameras.fpsCamera.transform;
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

		//Avoiding possible NaN
		if (newPosition && newPosition.x) {
			//Apply the new positions
			this.entityReferences.spineBoneMiddle.position = newPosition;
			this.entityReferences.spineBoneTop.position = newPosition;
		}
	}

	public OnMovementStateChange(state: EntityState) {
		if (state === EntityState.Sprinting) {
			this.targetBobData = this.sprintingBob;
			this.targetBobStrength = 1;
		} else if (state === EntityState.Running) {
			this.targetBobData = this.walkingBob;
			this.targetBobStrength = 1;
		} else if (state === EntityState.Sliding) {
			this.targetBobData = this.slidingBob;
			this.targetBobStrength = 1;
		} else if (state === EntityState.Jumping) {
			this.targetBobData = this.slidingBob;
			this.targetBobStrength = 0.5;
		} else {
			this.targetBobStrength = 0;
		}
		//Offset the phase of the bob sin to match the new frequency
		if (this.currentBobData.bobMovementFrequency > 0 && this.targetBobData.bobMovementFrequency > 0) {
			const currentPhase = this.currentTime % (1 / this.currentBobData.bobMovementFrequency);
			this.currentTime = currentPhase / this.targetBobData.bobMovementFrequency;
		}
		this.currentBobData.bobMovementFrequency = this.targetBobData.bobMovementFrequency;
	}

	public OnFirstPersonChanged(isFirstPerson: boolean) {
		this.inFirstPerson = isFirstPerson;
		this.cameras.fpsCamera.gameObject.SetActive(isFirstPerson);
		Game.LocalPlayer.character?.animator?.SetFirstPerson(isFirstPerson);
		this.trackedHeadRotation = this.cameras.fpsCamera.transform.rotation;

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
