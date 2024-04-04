import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class TopDownBattlePlayerSpawner extends AirshipBehaviour {
	@Header("Templates")
	public characterOutfit?: AccessoryOutfit;

	@Header("References")
	public spawnPosition!: GameObject;

	private bin = new Bin();

	public override Awake(): void {}

	override Start(): void {
		if (Game.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				this.SpawnCharacter(player);
			});

			this.bin.Add(
				Airship.damage.onDeath.Connect((info) => {
					const character = info.gameObject.GetAirshipComponent<Character>();
					if (character?.player) {
						this.SpawnCharacter(character.player);
					}
				}),
			);
		}
		if (Game.IsClient()) {
			Airship.characters.localCharacterManager.onBeforeLocalEntityInput.Connect((event) => {
				event.jump = false;
				event.sprinting = false;
			});

			Airship.characters.ObserveCharacters((character) => {
				CoreNetwork.ServerToClient.Character.ChangeOutfit.client.OnServerEvent((characterId) => {
					if (character.id === characterId) {
						if (this.characterOutfit) {
							character.accessoryBuilder.EquipAccessoryOutfit(this.characterOutfit, true);
						}
					}
				});
			});

			Airship.loadingScreen.FinishLoading();
		}
	}

	private SpawnCharacter(player: Player) {
		player.SpawnCharacter(this.spawnPosition.transform.position);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
