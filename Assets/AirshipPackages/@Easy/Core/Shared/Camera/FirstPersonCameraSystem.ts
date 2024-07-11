import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { OnLateUpdate } from "@Easy/Core/Shared/Util/Timer";
import { Airship } from "../Airship";
import { CameraReferences } from "./CameraReferences";

export class FirstPersonCameraSystem {
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

	public constructor(public readonly character: Character, startInFirstPerson: boolean) {
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
		if (!CameraReferences.viewmodelCamera || !Airship.Characters.viewmodel) return;
		this.currentTime += Time.deltaTime;

		Airship.Characters.onViewModelUpdate.Fire(Airship.Characters.viewmodel.viewmodelTransform);
	}

	public OnFirstPersonChanged(isFirstPerson: boolean) {
		this.inFirstPerson = isFirstPerson;
		if (!CameraReferences.viewmodelCamera) return;
		CameraReferences.viewmodelCamera.gameObject.SetActive(isFirstPerson);
		// Game.localPlayer.character?.animationHelper?.SetFirstPerson(isFirstPerson);
		Game.localPlayer.character?.animator.SetFirstPerson(isFirstPerson);

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

		if (Airship.Characters.viewmodel) {
			Airship.Characters.viewmodel.anim.Rebind();
			Airship.Characters.viewmodel.viewmodelGo.SetActive(isFirstPerson);
		}
		this.character.model.SetActive(!isFirstPerson);

		if (!isFirstPerson) {
			//Reset the spine positions to defaults after messing with them in first person
			// this.entityReferences.spineBoneMiddle.localPosition = this.originalSpineMiddlePosition;
			// this.entityReferences.spineBoneTop.localPosition = this.originalSpineTopPosition;
		}
		this.LateUpdate();
	}
}
