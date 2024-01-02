import { CameraController } from "@Easy/Core/Client/Controllers/Camera/CameraController";
import { StaticCameraMode } from "@Easy/Core/Client/Controllers/Camera/DefaultCameraModes/StaticCameraMode";
import { CharacterCameraMode } from "@Easy/Core/Client/Controllers/Character/CharacterCameraMode";
import { LocalEntityController } from "@Easy/Core/Client/Controllers/Character/LocalEntityController";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Dependency } from "@easy-games/flamework-core";

export default class TopDownCameraComponent extends AirshipBehaviour {
	public Camera!: Camera;
	public CameraOffset: Vector3 = new Vector3(0, 15, 0);

	private entity: Entity | undefined;
	private bin = new Bin();

	public override OnLateUpdate(dt: number): void {
		if (this.entity) {
			const entityPos = this.entity.Model.transform.position;
			this.Camera.transform.position = entityPos.add(this.CameraOffset);
			this.Camera.transform.LookAt(entityPos);
		}
	}

	public override OnEnabled(): void {
		if (RunUtil.IsServer()) return;

		Dependency<LocalEntityController>().SetCharacterCameraMode(CharacterCameraMode.NONE);
		Dependency<CameraController>().SetMode(new StaticCameraMode(Vector3.zero, Quaternion.identity));
		this.bin.Add(
			Game.LocalPlayer.ObserveCharacter((entity) => {
				this.entity = entity;
			}),
		);
	}

	public override OnDisabled(): void {
		this.bin.Clean();
	}

	override OnDestroy(): void {}
}
