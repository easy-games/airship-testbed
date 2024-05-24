import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { InputActionConfig } from "@Easy/Core/Shared/Input/InputAction";

export default class TopDownBattleCharacter extends AirshipBehaviour {
	private static extraLives: Map<number, number> = new Map(); //Map of playerID, numberOfLives

	@Header("References")
	public characterHighlight!: Transform;

	@Header("Variables")
	public startingExtraLives = 2;

	public character!: Character;

	public override Awake(): void {
		this.character = this.gameObject.GetAirshipComponent<Character>()!;
	}

	public override Start(): void {
		print("start character");
		if (this.character.player) {
			//If this is the first character for this player
			print("character has player");
			if (!TopDownBattleCharacter.extraLives.has(this.character.player.clientId)) {
				print("setting lives of " + this.character.player.clientId + " to: " + this.startingExtraLives);
				//Store their number of lives
				TopDownBattleCharacter.extraLives.set(this.character.player.clientId, this.startingExtraLives);
			}
		}
	}

	public GetRemainingLives() {
		if (this.character.player) {
			print("Remaining lives: " + TopDownBattleCharacter.extraLives.get(this.character.player.clientId));
			return TopDownBattleCharacter.extraLives.get(this.character.player.clientId) ?? -1;
		}
		return -1;
	}

	public LoseLife() {
		if (this.character.player) {
			return TopDownBattleCharacter.extraLives.set(this.character.player.clientId, this.GetRemainingLives() - 1);
		}
		return -1;
	}

	public SetLookVector(dir: Vector3) {
		this.character.movement.SetLookVector(dir);
		let rotation = this.characterHighlight.localEulerAngles;
		this.characterHighlight.LookAt(this.characterHighlight.position.add(dir));
		this.characterHighlight.localEulerAngles = new Vector3(
			rotation.x,
			this.characterHighlight.localEulerAngles.y,
			rotation.z,
		);
	}
}
