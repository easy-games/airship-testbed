import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class TopDownBattleCameraComponent extends AirshipBehaviour {
	public camera!: Camera;
	public cameraSmoothTime = 0.3;
	public lookOffsetMod = 1;

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
			const [pos, vel] = this.transform.position.SmoothDamp(
				this.character.model.transform.position.add(
					this.character.movement.GetLookVector().mul(this.lookOffsetMod),
				),
				this.cameraVelocity,
				this.cameraSmoothTime,
				Time.deltaTime,
			);
			this.transform.position = pos;
			this.cameraVelocity = vel;
		}
	}

	public override OnEnable(): void {
		if (Game.IsServer()) return;

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
