import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";

export default class DemoManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;

	private bin = new Bin();

	public override Awake(): void {}

	override Start(): void {
		if (RunUtil.IsServer()) {
			Airship.players.ObservePlayers((player) => {
				this.SpawnPlayer(player);
			});
			this.bin.Add(
				Airship.damage.onDeath.Connect((damageInfo) => {
					const player = damageInfo.gameObject.GetComponent<Character>()?.player;
					if (player) {
						this.SpawnPlayer(player);
					}
				}),
			);
		}
		if (RunUtil.IsClient()) {
			Airship.loadingScreen.FinishLoading();
		}
	}

	public SpawnPlayer(player: Player): void {
		const character = player.SpawnCharacter(this.spawnPosition.transform.position);
		character.inventory.AddItem(new ItemStack(ItemType.WOOD_SWORD));
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
