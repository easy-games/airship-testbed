import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class TopDownBattleCameraComponent extends AirshipBehaviour {
	@Header("References")
	public camera!: Camera;
	public cursorTransform!: RectTransform;

	@Header("Variables")
	public cameraSmoothTime = 0.3;
	public lookOffsetMod = 1;

	private character: Character | undefined;
	private bin = new Bin();
	private mouse = new Mouse();
	private cameraVelocity = new Vector3();

	public override OnEnable(): void {
		if (Game.IsServer()) return; //This is a client only script

		//Stops airship from locking the cursor in game
		const mouseUnlockId = this.mouse.AddUnlocker();
		this.bin.Add(() => {
			this.mouse.RemoveUnlocker(mouseUnlockId);
		});
		//Hide the cursor so we can draw our own
		this.mouse.ToggleMouseVisibility(false);

		//Grab the local character whenever it has spawned
		this.bin.Add(
			Game.localPlayer.ObserveCharacter((entity) => {
				this.character = entity;
			}),
		);
	}

	public override OnDisable(): void {
		this.bin.Clean(); //Clean up event listeners
	}

	public override Update(dt: number): void {
		if (this.character?.IsAlive()) {
			//Point the character towards the mouse
			const mousePos = this.mouse.GetLocation();
			let characterScreenSpacePos = this.camera.WorldToScreenPoint(this.character.model.transform.position);
			let relDir = mousePos.sub(characterScreenSpacePos).normalized;
			this.character.movement.SetLookVector(new Vector3(relDir.x, 0, relDir.y));

			//Move our custom cursor graphic
			this.cursorTransform.position = mousePos;
		}
	}

	public override LateUpdate(dt: number): void {
		if (this.character) {
			//Smoothly follow the character
			const [targetPos, newVelocity] = this.transform.position.SmoothDamp(
				//Character pos + the direction they are looking so you can see more of where you are aiming
				this.character.model.transform.position.add(
					this.character.movement.GetLookVector().mul(this.lookOffsetMod),
				),
				this.cameraVelocity,
				this.cameraSmoothTime,
				Time.deltaTime,
			);
			//Apply the new position
			this.transform.position = targetPos;
			this.cameraVelocity = newVelocity;
		}
	}
}
