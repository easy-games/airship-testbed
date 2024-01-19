import { LocalEntityController } from "@Easy/Core/Client/Controllers/Character/LocalEntityController";
import { LoadingScreenController } from "@Easy/Core/Client/Controllers/Loading/LoadingScreenController";
import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { PlayerService } from "@Easy/Core/Server/Services/Player/PlayerService";
import { EntityPrefabType } from "@Easy/Core/Shared/Entity/EntityPrefabType";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { Player } from "@Easy/Core/Shared/Player/Player";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { NetworkUtil } from "@Easy/Core/Shared/Util/NetworkUtil";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { Dependency } from "@easy-games/flamework-core";

export default class DemoManager extends AirshipBehaviour {
	public spawnPosition!: GameObject;

	private bin = new Bin();

	public override Awake(): void {}

	override Start(): void {
		if (RunUtil.IsServer()) {
			Dependency<PlayerService>().ObservePlayers((player) => {
				this.SpawnPlayer(player);
			});
			const coreServerSignals = import("@Easy/Core/Server/CoreServerSignals").expect().CoreServerSignals;
			this.bin.Add(
				coreServerSignals.EntityDeath.Connect((event) => {
					event.respawnTime = 0;
					if (event.entity.player) {
						this.SpawnPlayer(event.entity.player);
					}
				}),
			);
		}
		if (RunUtil.IsClient()) {
			Dependency<LoadingScreenController>().FinishLoading();
		}
	}

	public SpawnPlayer(player: Player): void {
		const entity = Dependency<EntityService>().SpawnPlayerEntity(
			player,
			EntityPrefabType.HUMAN,
			this.spawnPosition.transform.position,
		);
		const inv = entity.GetInventory();
		inv.AddItem(new ItemStack(ItemType.STONE_SWORD));
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
