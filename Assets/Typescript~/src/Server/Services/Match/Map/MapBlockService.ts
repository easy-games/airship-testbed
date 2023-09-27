import { OnStart, Service } from "@easy-games/flamework-core";
import { ItemType } from "Core/Shared/Item/ItemType";
import { CoreServerSignals } from "Imports/Core/Server/CoreServerSignals";
import { BlockInteractService } from "Imports/Core/Server/Services/Block/BlockInteractService";
import { CoreNetwork } from "Imports/Core/Shared/CoreNetwork";
import { CharacterEntity } from "Imports/Core/Shared/Entity/Character/CharacterEntity";
import { Entity } from "Imports/Core/Shared/Entity/Entity";
import { ItemMeta } from "Imports/Core/Shared/Item/ItemMeta";
import { ItemUtil } from "Imports/Core/Shared/Item/ItemUtil";
import { BlockDataAPI } from "Imports/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Imports/Core/Shared/VoxelWorld/WorldAPI";

@Service({})
export class MapBlockService implements OnStart {
	constructor(private readonly blockService: BlockInteractService) {}
	OnStart(): void {
		CoreServerSignals.BlockPlace.Connect((event) => {
			if (event.entity) {
				BlockDataAPI.SetBlockData(event.pos, "canBreak", true);
			}
		});

		CoreNetwork.ClientToServer.LibonatiTest.Server.OnClientEvent((clientId) => {
			const entity = Entity.FindByClientId(clientId);
			if (!entity) {
				return;
			}

			const sphereRadius = 4.5;
			let voxelPositions: Vector3[] = [];
			let itemMeta: ItemMeta[] = [];
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
									itemMeta[i] = ItemUtil.GetItemMeta(
										localBlockPos.magnitude < sphereRadius / 2 ? ItemType.DIRT : ItemType.STONE,
									);
									i++;
								}
							}
						}
					}
				}
			}
			this.blockService.PlaceBlockGroup(entity as CharacterEntity, voxelPositions, itemMeta);
		});
	}
}
