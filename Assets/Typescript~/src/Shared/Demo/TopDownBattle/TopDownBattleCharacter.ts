import Character from "@Easy/Core/Shared/Character/Character";

export default class TopDownBattleCharacter extends AirshipBehaviour {
	public static extraLives: Map<number, number> = new Map(); //Map of playerID, numberOfLives

	@Header("Variables")
	public startingNumberOfLives = 2;

	public character!: Character;

	public override Awake(): void {
		this.character = this.gameObject.GetAirshipComponent<Character>()!;
		if (this.character.player) {
			//If this is the first character for this player
			if (!TopDownBattleCharacter.extraLives.has(this.character.player.clientId)) {
				//Store their number of lives
				TopDownBattleCharacter.extraLives.set(this.character.player.clientId, this.startingNumberOfLives);
			}
		}
	}
}
