import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class PlatformAPIManager extends AirshipBehaviour {
	private bin = new Bin();
	public spawnTransform!: Transform;

	override Start(): void {
		if (Game.IsServer()) {
			this.bin.Add(
				Airship.Players.ObservePlayers((player) => {
					player.SpawnCharacter(this.spawnTransform.position);
				}),
			);
			this.bin.Add(
				Airship.Damage.onDeath.Connect((damageInfo) => {
					const character = damageInfo.gameObject.GetAirshipComponent<Character>();
					if (character?.player) {
						character.player.SpawnCharacter(this.spawnTransform.position);
					}
				}),
			);
		}
	}

	public OnDestroy(): void {
		this.bin.Clean();
	}
}
