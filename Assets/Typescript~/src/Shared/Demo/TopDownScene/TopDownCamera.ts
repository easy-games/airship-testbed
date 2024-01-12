import { CameraController } from "@Easy/Core/Client/Controllers/Camera/CameraController";
import { LocalEntityController } from "@Easy/Core/Client/Controllers/Character/LocalEntityController";
import { CrosshairController } from "@Easy/Core/Client/Controllers/Crosshair/CrosshairController";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Dependency } from "@easy-games/flamework-core";

export default class TopDownCameraComponent extends AirshipBehaviour {
	public camera!: Camera;
	public cameraOffset: Vector3 = new Vector3(0, 15, 0);
	public cameraEntityMaxRange = 3;
	public cameraSmoothTime = 0.3;

	private savedCameraTargetWorldPos = new Vector3();
	private cameraVelocity = new Vector3();

	private entity: Entity | undefined;
	private bin = new Bin();
	private mouse = new Mouse();

	public override Update(dt: number): void {
		if (this.entity?.IsAlive()) {
			const mousePos = this.mouse.GetLocation();

			let entityScreenSpacePos = this.camera.WorldToScreenPoint(this.entity.model.transform.position);
			let relPos = mousePos.sub(entityScreenSpacePos).normalized;

			let lookVec = new Vector3(relPos.x, 0, relPos.y);
			this.entity.entityDriver.SetLookVector(lookVec);
		}
	}

	public override LateUpdate(dt: number): void {
		if (this.entity) {
			const entityWorldPos = this.entity.model.transform.position;

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

		Dependency<LocalEntityController>().SetMoveDirWorldSpace(true);
		Dependency<CameraController>().SetEnabled(false);
		Dependency<CrosshairController>().AddDisabler();

		Dependency<LocalEntityController>().onBeforeLocalEntityInput.Connect((event) => {
			event.jump = false;
			event.crouchOrSlide = false;
		});

		const mouseUnlockId = this.mouse.AddUnlocker();
		this.bin.Add(() => {
			this.mouse.RemoveUnlocker(mouseUnlockId);
		});

		this.bin.Add(
			Game.localPlayer.ObserveCharacter((entity) => {
				this.entity = entity;
			}),
		);
	}

	public override OnDisable(): void {
		this.bin.Clean();
	}

	override OnDestroy(): void {}
}
