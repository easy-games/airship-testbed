import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { ItemType } from "Core/Shared/Item/ItemType";
import { BlockInteractService } from "Imports/Core/Server/Services/Block/BlockInteractService";
import { CoreNetwork } from "Imports/Core/Shared/CoreNetwork";
import { CharacterEntity } from "Imports/Core/Shared/Entity/Character/CharacterEntity";
import { Entity } from "Imports/Core/Shared/Entity/Entity";
import { items } from "Imports/Core/Shared/Item/ItemDefinitions";
import { ItemMeta } from "Imports/Core/Shared/Item/ItemMeta";
import { ItemUtil } from "Imports/Core/Shared/Item/ItemUtil";
import { BlockDataAPI } from "Imports/Core/Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Imports/Core/Shared/VoxelWorld/WorldAPI";
import { ServerSignals } from "Server/ServerSignals";

@Service({})
export class MapBlockService implements OnStart {
	constructor(private readonly blockService: BlockInteractService) {}
	OnStart(): void {
		/* Start tracking placed blocks AFTER match has started. */
		ServerSignals.MatchStart.Connect(() => {
			/*
			 * Voxels placed after match started belong to players.
			 * TODO: We _probably_ want exceptions here. IE: Lucky Blocks?
			 */
			WorldAPI.GetMainWorld().OnVoxelPlaced.Connect((pos, _voxel) => {
				BlockDataAPI.SetBlockData(pos, "placedByUser", true);
			});
		});

		CoreNetwork.ClientToServer.LibonatiTest.Server.OnClientEvent((clientId) => {
			const entity = Entity.FindByClientId(clientId);
			if (!entity) {
				return;
			}

			const sphereRadius = 5;
			let voxelPositions: Vector3[] = [];
			let itemMeta: ItemMeta[] = [];
			let i = 0;
			for (let x = -sphereRadius; x < sphereRadius; x++) {
				for (let y = -sphereRadius; y < sphereRadius; y++) {
					for (let z = -sphereRadius; z < sphereRadius; z++) {
						const entityVoxelPos = WorldAPI.GetVoxelPosition(entity?.model.transform.position);
						const blockPos = new Vector3(x, y, z);
						if (blockPos.magnitude <= sphereRadius) {
							voxelPositions[i] = entityVoxelPos;
							itemMeta[i] = ItemUtil.GetItemMeta(ItemType.STONE);
							i++;
						}
					}
				}
			}
			this.blockService.PlaceBlockGroup(entity as CharacterEntity, voxelPositions, itemMeta);
		});
	}
}
