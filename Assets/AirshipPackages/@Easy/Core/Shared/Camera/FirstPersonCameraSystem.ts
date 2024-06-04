import Character from "@Easy/Core/Shared/Character/Character";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";
import { SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { OnLateUpdate } from "@Easy/Core/Shared/Util/Timer";
import { LocalCharacterSingleton } from "../Character/LocalCharacter/LocalCharacterSingleton";
import { Viewmodel } from "../Viewmodel/Viewmodel";
import { AirshipCharacterCameraSingleton } from "./AirshipCharacterCameraSingleton";
import { CameraReferences } from "./CameraReferences";

interface BobData {
	bobMovementFrequency: number;
	bobMovementMagnitude: number;
	bobRotationMagnitude: number;
}

export class FirstPersonCameraSystem {
	private bobLerpMod = 10;

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

	/**
	 * If true the viewmodel will be positioned so the camera is located where the head is.
	 * If false it will use a static position that synchronizes head & camera as long as nothing
	 * is animating the head's position.
	 */
	private positionViewmodelCameraUnderHead = false;
	/** Positions viewmodel at some static offset from the camera.
	 * Only applies if `positionViewmodelCameraUnderHead` is false. */
	private cameraSpineOffset = new Vector3(-3.40097417e-9, 0.541525066, 0.0108257439);
	/** Rotates viewmodel at some static offset from the camera.
	 * Only applies if `positionViewmodelCameraUnderHead` is false. */
	private invCameraSpineRotOffset = Quaternion.Inverse(Quaternion.Euler(5.23106146, -2.76772844e-5, -1.42344584e-6));

	private inFirstPerson;
	private bin: Bin;
	private currentTime = 0.01;
	private viewmodel: Viewmodel;
	/* Store default spine rotation, used to offset head from spine */
	private defaultSpineRotation: Quaternion;

	public constructor(public readonly character: Character, startInFirstPerson: boolean) {
		this.viewmodel = CameraReferences.viewmodel!;
		this.defaultSpineRotation = this.viewmodel.rig.spine.transform.localRotation;

		this.inFirstPerson = startInFirstPerson;
		this.OnFirstPersonChanged(this.inFirstPerson);

		this.bin = new Bin();
		this.bin.Add(() => {
			// Pooling: reset back to third person.
			this.OnFirstPersonChanged(false);
		});

		this.bin.Add(OnLateUpdate.ConnectWithPriority(SignalPriority.HIGH, () => this.LateUpdate()));

		Dependency<LocalCharacterSingleton>().stateChanged.Connect((state) => {
			this.OnMovementStateChange(state);
		});
	}

	public Destroy() {
		this.bin.Clean();
	}

	private LateUpdate() {
		if (!this.inFirstPerson) {
			return;
		}
		if (!CameraReferences.viewmodelCamera) return;
		this.currentTime += Time.deltaTime;

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

		// Position viewmodel based on camera position
		const camTransform = CameraReferences.viewmodelCamera.transform;
		const spineTransform = this.viewmodel.rig.spine;

		let position = Vector3.zero;
		let rotation = Quaternion.identity;

		if (this.positionViewmodelCameraUnderHead) {
			const headTransform = this.viewmodel.rig.head;
			const headLocalRotation = headTransform.localRotation;
			const camRotation = camTransform.rotation;

			// Offset from head position (where the camera is) to where the spine should be
			const offset = camRotation.mul(Quaternion.Inverse(headLocalRotation)).mul(headTransform.localPosition);
			// Invsere spine->head offset to find spine position from head
			position = camTransform.position.add(offset.mul(-1));
			// Undo head rotation from camera rotation to get spine forward
			const forwardVec = camRotation.mul(Quaternion.Inverse(headLocalRotation)).mul(Vector3.forward);
			rotation = Quaternion.LookRotation(forwardVec, offset);
		} else {
			// First calculate rotation of spine
			rotation = camTransform.rotation.mul(this.invCameraSpineRotOffset);
			// Use rotation of spine to find out where spine should be relative to camera
			position = camTransform.position.add(rotation.mul(this.cameraSpineOffset.mul(-1)));
		}

		const data = { position, rotation };
		Dependency<AirshipCharacterCameraSingleton>().onViewModelUpdate.Fire(data);

		spineTransform.position = data.position;
		spineTransform.rotation = data.rotation;

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

		// this.trackedHeadRotation = headLookRotation;

		//Calculate new position based on head rotation
		// let newPosition = headLookPosition.sub(
		// 	this.trackedHeadRotation.mul(this.calculatedSpineOffset.add(headBobOffset)),
		// );

		//Apply the new rotation
		// this.entityReferences.spineBoneMiddle.rotation = this.trackedHeadRotation;
		// this.entityReferences.spineBoneTop.localRotation = Quaternion.identity;

		//Avoiding possible NaN
		// if (newPosition && newPosition.x) {
		// 	//Apply the new positions
		// 	this.entityReferences.spineBoneMiddle.position = newPosition;
		// 	this.entityReferences.spineBoneTop.position = newPosition;
		// }
	}

	public OnMovementStateChange(state: CharacterState) {
		if (state === CharacterState.Sprinting) {
			this.targetBobData = this.sprintingBob;
			this.targetBobStrength = 1;
		} else if (state === CharacterState.Running) {
			this.targetBobData = this.walkingBob;
			this.targetBobStrength = 1;
		} else if (state === CharacterState.Sliding) {
			this.targetBobData = this.slidingBob;
			this.targetBobStrength = 1;
		} else if (state === CharacterState.Jumping) {
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
		if (!CameraReferences.viewmodelCamera) return;
		CameraReferences.viewmodelCamera.gameObject.SetActive(isFirstPerson);
		// Game.localPlayer.character?.animationHelper?.SetFirstPerson(isFirstPerson);
		Game.localPlayer.character?.animator.SetFirstPerson(isFirstPerson);

		CameraReferences.viewmodel?.animancer.Animator.Rebind();

		//Reset shoulders since not all animations will key these values
		// this.entityReferences.shoulderL.localPosition = this.originalShoulderLPosition;
		// this.entityReferences.shoulderR.localPosition = this.originalShoulderRPosition;

		// Viewmodel visibility
		// {
		// 	let childCount = this.viewmodelController.viewmodelTransform.GetChildCount();
		// 	for (let i = 0; i < childCount; i++) {
		// 		this.viewmodelController.viewmodelTransform.GetChild(i).gameObject.SetActive(isFirstPerson);
		// 	}
		// }

		// // Worldmodel visibility
		// {
		// 	let childCount = this.entity.model.transform.GetChildCount();
		// 	for (let i = 0; i < childCount; i++) {
		// 		this.entity.model.transform.GetChild(i).gameObject.SetActive(!isFirstPerson);
		// 	}
		// }

		this.viewmodel.viewmodelGo.SetActive(isFirstPerson);
		this.viewmodel.viewmodelGo.transform.position = isFirstPerson
			? new Vector3(0, 0, 0)
			: new Vector3(10_000, 0, 10_000);
		this.character.model.SetActive(!isFirstPerson);

		if (!isFirstPerson) {
			//Reset the spine positions to defaults after messing with them in first person
			// this.entityReferences.spineBoneMiddle.localPosition = this.originalSpineMiddlePosition;
			// this.entityReferences.spineBoneTop.localPosition = this.originalSpineTopPosition;
		}
		this.LateUpdate();
	}
}
