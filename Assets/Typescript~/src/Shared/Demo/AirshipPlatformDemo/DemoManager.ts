import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";

export default class DemoManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;
	public testPrefab!: GameObject;

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
			// Optional: use locked camera mode for first person support
			// Airship.characters.localCharacterManager.SetCharacterCameraMode(CharacterCameraMode.Locked);

			Airship.loadingScreen.FinishLoading();
		}

		Object.Instantiate(this.testPrefab, new Vector3(0, 0, 0), Quaternion.identity, this.spawnPosition.transform);
	}

	public SpawnPlayer(player: Player): void {
		const character = player.SpawnCharacter(this.spawnPosition.transform.position);
		character.inventory.AddItem(new ItemStack(ItemType.WOOD_SWORD));
	}
}
