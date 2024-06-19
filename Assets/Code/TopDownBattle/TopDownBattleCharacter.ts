import Character from "@Easy/Core/Shared/Character/Character";

export default class TopDownBattleCharacter extends AirshipBehaviour {
	private static extraLives: Map<number, number> = new Map(); //Map of playerID, numberOfLives

	@Header("References")
	public characterHighlight!: Transform;

	@Header("Variables")
	public startingExtraLives = 2;

	@NonSerialized()
	public character!: Character;

	public lookVector = Vector3.zero;

	public override Awake(): void {
		this.character = this.gameObject.GetAirshipComponent<Character>()!;
	}

	public override Start(): void {
		if (this.character.player) {
			//If this is the first character for this player
			if (!TopDownBattleCharacter.extraLives.has(this.character.player.clientId)) {
				//Store their number of lives
				TopDownBattleCharacter.extraLives.set(this.character.player.clientId, this.startingExtraLives);
			}
		}
	}

	public GetRemainingLives() {
		if (this.character.player) {
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
		this.lookVector = dir.normalized;
		this.character.movement.SetLookVector(this.lookVector);
		let rotation = this.characterHighlight.localEulerAngles;
		this.characterHighlight.LookAt(this.characterHighlight.position.add(this.lookVector));
		this.characterHighlight.localEulerAngles = new Vector3(
			rotation.x,
			this.characterHighlight.localEulerAngles.y,
			rotation.z,
		);
	}
}
