import Character from "@Easy/Core/Shared/Character/Character";

export default class TopDownBattleCharacter extends AirshipBehaviour {
	private static extraLives: Map<number, number> = new Map(); //Map of playerID, numberOfLives

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
}
