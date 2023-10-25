import { OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";

@Service({})
export class LobbyService implements OnStart {
	constructor() {}
	OnStart(): void {
		const serverConsole = GameObject.Find("ServerConsole").GetComponent<ServerConsole>();
		serverConsole.RemoteLogging = true;

		CoreServerSignals.EntitySpawn.Connect((event) => {
			if (event.entity instanceof CharacterEntity) {
				const inv = event.entity.GetInventory();
				inv.SetItem(0, new ItemStack(ItemType.STONE_SWORD, 1));
				inv.SetItem(1, new ItemStack(ItemType.COBBLESTONE, 100));
				inv.SetItem(2, new ItemStack(ItemType.STONE_PICKAXE, 1));
				inv.SetItem(3, new ItemStack(ItemType.WOOD_BOW, 1));
				inv.SetItem(4, new ItemStack(ItemType.TELEPEARL, 100));
				inv.SetItem(6, new ItemStack(ItemType.FIREBALL, 100));
				inv.SetItem(7, new ItemStack(ItemType.BED, 15));
				inv.SetItem(8, new ItemStack(ItemType.WOOD_ARROW, 100));
				inv.SetItem(10, new ItemStack(ItemType.LEATHER_HELMET, 1));

				inv.SetItem(20, new ItemStack(ItemType.WHITE_WOOL, 100));
				inv.SetItem(21, new ItemStack(ItemType.STONE_BRICK, 100));
				inv.SetItem(22, new ItemStack(ItemType.OAK_WOOD_PLANK, 100));
			}
		});
	}
}
