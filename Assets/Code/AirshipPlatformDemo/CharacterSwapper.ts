import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Binding } from "@Easy/Core/Shared/Input/Binding";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";

export default class CharacterSwapper extends AirshipBehaviour {
	public spawnPoint: Transform;

	@NonSerialized() public characters: Character[] = [];
	@NonSerialized() public toggleCharacterRemote = new NetworkSignal("ToggleCharacter");

	override Start(): void {
		if (Game.IsServer()) {
			Airship.Players.ObservePlayers((player) => {
				Airship.Characters.SpawnNonPlayerCharacter(this.spawnPoint.position);
			});
			Airship.Characters.ObserveCharacters((c) => {
				this.characters.push(c);
				return () => {
					this.characters.remove(this.characters.indexOf(c));
				};
			});
		}

		if (Game.IsClient()) {
			Airship.Input.CreateAction("ToggleCharacter", Binding.Key(Key.K));
			Airship.Input.OnDown("ToggleCharacter").Connect((event) => {
				this.toggleCharacterRemote.client.FireServer();
			});
		}

		if (Game.IsServer()) {
			this.toggleCharacterRemote.server.OnClientEvent(async (player) => {
				let found: Character | undefined;
				for (let c of this.characters) {
					if (player.character !== c) {
						player.SetCharacter(c);
						found = c;
						break;
					}
				}
				if (found) {
					// move to bottom of list
					this.characters.remove(this.characters.indexOf(found));
					this.characters.push(found);
				}
			});
		}
	}

	override OnDestroy(): void {}
}
