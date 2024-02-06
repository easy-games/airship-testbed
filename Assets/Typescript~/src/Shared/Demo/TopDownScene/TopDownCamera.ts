import { CrosshairController } from "@Easy/Core/Client/Controllers/Crosshair/CrosshairController";
import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Dependency } from "@Easy/Core/Shared/Flamework";

export default class TopDownCameraComponent extends AirshipBehaviour {
	public camera!: Camera;
	public cameraOffset: Vector3 = new Vector3(0, 15, 0);
	public cameraEntityMaxRange = 3;
	public cameraSmoothTime = 0.3;

	private savedCameraTargetWorldPos = new Vector3();
	private cameraVelocity = new Vector3();

	@NonSerialized() private character: Character | undefined;
	private bin = new Bin();
	private mouse = new Mouse();

	public override Update(dt: number): void {
		if (this.character?.IsAlive()) {
			const mousePos = this.mouse.GetLocation();

			let entityScreenSpacePos = this.camera.WorldToScreenPoint(this.character.model.transform.position);
			let relPos = mousePos.sub(entityScreenSpacePos).normalized;

			let lookVec = new Vector3(relPos.x, 0, relPos.y);
			this.character.movement.SetLookVector(lookVec);
		}
	}

	public override LateUpdate(dt: number): void {
		if (this.character) {
			const entityWorldPos = this.character.model.transform.position;

			const camPos = this.camera.transform.position;
			const newCamPos = entityWorldPos.add(this.cameraOffset);
			const [pos, vel] = camPos.SmoothDamp(newCamPos, this.cameraVelocity, this.cameraSmoothTime, Time.deltaTime);
			this.camera.transform.position = pos;
			this.cameraVelocity = vel;

			this.camera.transform.LookAt(entityWorldPos);
		}
	}

	public override OnEnable(): void {
		if (RunUtil.IsServer()) return;

		Airship.characters.localCharacterManager.SetMoveDirWorldSpace(true);
		Dependency<CrosshairController>().AddDisabler();

		Airship.characters.localCharacterManager.onBeforeLocalEntityInput.Connect((event) => {
			event.jump = false;
			event.crouchOrSlide = false;
		});

		const mouseUnlockId = this.mouse.AddUnlocker();
		this.bin.Add(() => {
			this.mouse.RemoveUnlocker(mouseUnlockId);
		});

		this.bin.Add(
			Game.localPlayer.ObserveCharacter((entity) => {
				this.character = entity;
			}),
		);
	}

	public override OnDisable(): void {
		this.bin.Clean();
	}

	override OnDestroy(): void {}
}
