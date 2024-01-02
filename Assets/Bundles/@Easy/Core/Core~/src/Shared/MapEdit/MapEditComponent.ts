import { Dependency } from "@easy-games/flamework-core";
import { LoadingScreenController } from "Client/Controllers/Loading/LoadingScreenController";
import { EntityService } from "Server/Services/Entity/EntityService";
import { PlayerService } from "Server/Services/Player/PlayerService";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { RunUtil } from "Shared/Util/RunUtil";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";

export default class MapEditComponent extends AirshipBehaviour {
	public SpawnPosition!: Transform;

	public OnAwake(): void {
		const world = WorldAPI.GetMainWorld()!;
		if (RunUtil.IsServer()) {
			world.LoadWorldFromSaveFile(world.voxelWorld.voxelWorldFile);
			Dependency<PlayerService>().ObservePlayers((p) => {
				const entity = Dependency<EntityService>().SpawnPlayerEntity(
					p,
					EntityPrefabType.HUMAN,
					this.SpawnPosition.position,
					this.SpawnPosition.rotation,
				);
				const inv = entity.GetInventory();
				inv.AddItem(new ItemStack(ItemType.DIAMOND_PICKAXE, 1));
				inv.AddItem(new ItemStack(ItemType.GRASS, 9999));
				inv.AddItem(new ItemStack(ItemType.STONE, 9999));
			});
		}

		if (RunUtil.IsClient()) {
			Dependency<LoadingScreenController>().FinishLoading();
		}
	}

	override OnDestroy(): void {}
}
