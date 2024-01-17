import { LocalEntityController } from "@Easy/Core/Client/Controllers/Character/LocalEntityController";
import { LoadingScreenController } from "@Easy/Core/Client/Controllers/Loading/LoadingScreenController";
import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { EntityPrefabType } from "@Easy/Core/Shared/Entity/EntityPrefabType";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Dependency } from "@easy-games/flamework-core";

export default class GameManager extends AirshipBehaviour {
	public spawnPosition!: Transform;
	private bin = new Bin();

	public override Awake(): void {}

	override Start(): void {
		if (RunUtil.IsServer()) {
			Dependency<PlayerService>().ObservePlayers((player) => {
				this.SpawnPlayer(player);
			});
			this.bin.Add(
				CoreServerSignals.EntityDeath.Connect((event) => {
					event.respawnTime = 0;
					if (event.entity.player) {
						this.SpawnPlayer(event.entity.player);
					}
				}),
			);
		}
		if (RunUtil.IsClient()) {
			Dependency<LocalEntityController>().SetFirstPerson(false);
			Dependency<LocalEntityController>().SetDefaultFirstPerson(false);
			Dependency<LoadingScreenController>().FinishLoading();
		}
	}

	public SpawnPlayer(player: Player): void {
		const entity = Dependency<EntityService>().SpawnPlayerEntity(
			player,
			EntityPrefabType.HUMAN,
			this.spawnPosition.position,
		);
		const inv = entity.GetInventory();
		inv.AddItem(new ItemStack(ItemType.STONE_SWORD));
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
