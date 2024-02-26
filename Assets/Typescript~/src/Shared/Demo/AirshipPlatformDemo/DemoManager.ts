import SteamRichPresence from "@Easy/Core/Client/Airship/Steam/SteamRichPresence";
import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RandomUtil } from "@Easy/Core/Shared/Util/RandomUtil";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Tags } from "Shared/Tags";

export default class DemoManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;
	public useTaggedSpawns = false;
	private deathCount = 0;

	override Start(): void {
		if (RunUtil.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				this.SpawnPlayer(player);
			});
			Airship.damage.onDeath.Connect((damageInfo) => {
				const character = damageInfo.gameObject.GetAirshipComponent<Character>();
				if (character?.player) {
					this.SpawnPlayer(character.player);
				}
			});
		}
		if (RunUtil.IsClient()) {
			print("RUNNING AS CLIENT");
			// Optional: use locked camera mode for first person support
			// Airship.characters.localCharacterManager.SetCharacterCameraMode(CharacterCameraMode.Locked);

			Airship.loadingScreen.FinishLoading();

			// Display local player deaths
			Game.localPlayer.ObserveCharacter((character) => {
				if (!character) return;

				const bin = new Bin();
				bin.Add(
					character?.onDeath.Connect(() => {
						print("DIED");
						this.deathCount++;
						SteamRichPresence.SetStatus(`Deaths: ${this.deathCount}`);
					}),
				);
				return () => {
					bin.Clean();
				};
			});
		}
	}

	public SpawnPlayer(player: Player): void {
		// fun little experiment
		if (this.useTaggedSpawns) {
			const taggedSpawns = Airship.tags.GetTagged(Tags.AirshipTest_Spawn);
			if (taggedSpawns.size() > 0) {
				player.SpawnCharacter(RandomUtil.FromArray(taggedSpawns.map((v) => v.transform.position)));
				return;
			}
		}

		const character = player.SpawnCharacter(this.spawnPosition.transform.position);
		// character.inventory.AddItem(new ItemStack(ItemType.WOOD_SWORD));
	}
}
