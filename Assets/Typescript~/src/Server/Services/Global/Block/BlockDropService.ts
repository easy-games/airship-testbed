import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { GroundItemService } from "../../../../../../Bundles/@Easy/Core/Core~/src/Server/Services/GroundItem/GroundItemService";
import { BlockDropItemSignal } from "./Signal/BlockDestroyedSignal";

@Service()
export class BlockDropService implements OnStart {
	public constructor(private readonly groundItemService: GroundItemService) {}

	OnStart(): void {
		CoreServerSignals.BlockDestroyed.Connect((event) => {
			const world = WorldAPI.GetMainWorld();
			if (!world) return;

			const blockStringId = world.GetIdFromVoxelId(event.blockId);
			const itemType = ItemUtil.GetItemTypeFromStringId(blockStringId);
			if (!itemType) return;

			CoreServerSignals.BlockDropped.Fire(
				new BlockDropItemSignal(event.entity, event.blockPos, new ItemStack(itemType, 1)),
			);
		});

		CoreServerSignals.BlockDropped.ConnectWithPriority(SignalPriority.LOWEST, (event) => {
			if (event.IsCancelled()) return;

			if (event.IsGivingToCharacter()) {
				const inventory = event.entity.GetInventory();
				inventory.AddItem(event.itemStack);
			} else {
				// TODO: Ground items, mayhaps?
			}
		});
	}
}
