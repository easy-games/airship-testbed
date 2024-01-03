import { CameraController } from "@Easy/Core/Client/Controllers/Camera/CameraController";
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

	private entity: Entity | undefined;
	private bin = new Bin();
	private mouse = new Mouse();

	public override Update(dt: number): void {
		if (this.entity?.IsAlive()) {
			const mousePos = this.mouse.GetLocation();
			const worldPos = this.camera.ScreenToWorldPoint(
				new Vector3(mousePos.x, this.camera.pixelHeight - mousePos.y, this.camera.nearClipPlane),
			);
			// print("mousePos: " + mousePos + ", worldPos: " + worldPos);

			const relativePos = this.entity.model.transform.position.sub(worldPos);
			print("relativePos: " + relativePos);

			let lookVec = new Vector3(relativePos.x, relativePos.y, relativePos.z);
			this.entity.entityDriver.SetLookVector(lookVec);
		}
	}

	public override LateUpdate(dt: number): void {
		if (this.entity) {
			const entityPos = this.entity.model.transform.position;
			this.camera.transform.position = entityPos.add(this.cameraOffset);
			this.camera.transform.LookAt(entityPos);
		}
	}

	public override OnEnable(): void {
		if (RunUtil.IsServer()) return;

		Dependency<CameraController>().SetEnabled(false);
		Dependency<CrosshairController>().AddDisabler();

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
