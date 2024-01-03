import { CoreServerSignals } from "@Easy/Core/Server/CoreServerSignals";
import { BlockInteractService } from "@Easy/Core/Server/Services/Block/BlockInteractService";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { CharacterEntity } from "@Easy/Core/Shared/Entity/Character/CharacterEntity";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { ItemDef } from "@Easy/Core/Shared/Item/ItemDefinitionTypes";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { BlockDataAPI, CoreBlockMetaKeys } from "@Easy/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "@Easy/Core/Shared/VoxelWorld/WorldAPI";
import { OnStart, Service } from "@easy-games/flamework-core";

@Service({})
export class MapBlockService implements OnStart {
	private static toggle = true;

	constructor(private readonly blockService: BlockInteractService) {}
	OnStart(): void {
		CoreServerSignals.BlockPlace.Connect((event) => {
			if (event.itemMeta.tillBlock) {
				// tillable blocks can be modified to the tillable equiv.
				BlockDataAPI.SetBlockData(event.pos, CoreBlockMetaKeys.CAN_TILL, true);
			}
		});

		CoreServerSignals.BlockGroupPlace.Connect((event) => {
			//TODO get item meta from itemType
			// if (event.itemMeta.tillBlock) {
			// 	// tillable blocks can be modified to the tillable equiv.
			// 	BlockDataAPI.SetBlockGroupData(event.positions, CoreBlockMetaKeys.CAN_TILL, true);
			// }
		});

		CoreNetwork.ClientToServer.LibonatiTest.server.OnClientEvent((clientId) => {
			const entity = Entity.FindByClientId(clientId);
			if (!entity) {
				return;
			}

			const sphereRadius = 4.5;
			let voxelPositions: Vector3[] = [];
			let itemDef: ItemDef[] = [];
			let i = 0;
			let world = WorldAPI.GetMainWorld();
			for (let x = -sphereRadius; x < sphereRadius; x++) {
				for (let y = -sphereRadius; y < sphereRadius; y++) {
					for (let z = -sphereRadius; z < sphereRadius; z++) {
						const localBlockPos = new Vector3(x, y, z);
						let voxelPos = new Vector3(0, 0, 0);
						if (entity) {
							voxelPos = WorldAPI.GetVoxelPosition(
								entity.model.transform.position
									.add(localBlockPos)
									.add(entity.model.transform.forward.mul(sphereRadius + 1)),
							);
						}
						if (world) {
							const block = world.GetBlockAt(voxelPos);
							if (block && block.IsAir()) {
								if (localBlockPos.magnitude <= sphereRadius) {
									voxelPositions[i] = voxelPos;
									itemDef[i] = ItemUtil.GetItemDef(
										localBlockPos.magnitude < sphereRadius / 2 ? ItemType.DIRT : ItemType.STONE,
									);
									i++;
								}
							}
						}
					}
				}
			}
			this.blockService.PlaceBlockGroup(entity as CharacterEntity, voxelPositions, itemDef);
			MapBlockService.toggle = !MapBlockService.toggle;
		});
	}
}
