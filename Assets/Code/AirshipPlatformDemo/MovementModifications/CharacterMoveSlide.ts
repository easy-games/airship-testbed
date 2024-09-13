import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";

export default class CharacterMoveSlide extends AirshipBehaviour {
	private readonly SlideKey = "Slide";

	private character!: Character;
	private slideStartTime = 0;

	public slideForce = 10;
	public slideDurationInSeconds = 0.5;

	private startTick = 0;

	public Awake(): void {
		this.character = this.gameObject.GetAirshipComponent<Character>()!;
		this.character.WaitForInit();

		//Locally listen to actions
		if (this.character.IsLocalCharacter()) {
			Airship.Input.CreateAction(this.SlideKey, Binding.Key(Key.Q));
			Airship.Input.OnDown(this.SlideKey).Connect(() => {
				this.startTick = this.character.movement!.GetNextTick();
			});
		}

		if (this.character.IsLocalCharacter() || Game.IsServer()) {
			//Listen to custom data and modify movement based on values
			this.character.OnBeginMove.Connect((customMoveData, inputData, isReplay) => {
				if (customMoveData.has(this.SlideKey)) {
					let startTick = customMoveData.get(this.SlideKey) as number;
					//print("Start Slide. Tick: " + startTick + ", isReplay: " + isReplay);
					// this.Slide(inputData.moveDir, startTick, inputData.GetTick());
				} else {
					if (this.slideStartTime > 0) {
						//print("Stop Slide. Tick: " + inputData.GetTick() + ", isReplay: " + isReplay);
					}
					this.StopSlide();
				}
			});
		}
	}

	public Update(dt: number): void {
		if (this.character.IsInitialized() && this.character.IsLocalCharacter()) {
			if (Airship.Input.IsDown(this.SlideKey)) {
				let characterState = this.character.movement!.GetState();
				if (characterState === CharacterState.Running || characterState === CharacterState.Sprinting) {
					this.character.AddCustomMoveData(this.SlideKey, this.startTick);
				}
			}
		}
	}

	// private Slide(dir: Vector3, startTick: number, currentTick: number) {
	// 	let characterState = this.character.movement.GetState();
	// 	this.slideStartTime = InstanceFinder.TimeManager.TicksToTime(startTick);
	// 	// print(
	// 	// 	"SLIDE: StartTick: " +
	// 	// 		startTick +
	// 	// 		" StartTime: " +
	// 	// 		this.slideStartTime +
	// 	// 		" Remaining Time: " +
	// 	// 		(InstanceFinder.TimeManager.TicksToTime(currentTick) - this.slideStartTime) +
	// 	// 		" TickDelta: " +
	// 	// 		InstanceFinder.TimeManager.TickDelta,
	// 	// );
	// 	if (InstanceFinder.TimeManager.TicksToTime(currentTick) - this.slideStartTime <= this.slideDurationInSeconds) {
	// 		//Slide
	// 		this.character.movement.AddImpulse(dir.mul(this.slideForce));
	// 	}
	// }

	private StopSlide() {
		this.slideStartTime = -1;
	}
}
