import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { BlockHitDamageCalc } from "Shared/Block/BlockHitDamageCalc";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Network } from "Shared/Network";
import { BeforeBlockPlacedSignal } from "Shared/Signals/BeforeBlockPlacedSignal";
import { BlockPlaceSignal } from "Shared/Signals/BlockPlaceSignal";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { ItemUtil } from "../../../../Shared/Item/ItemUtil";
import { EntityService } from "../Entity/EntityService";
import { InventoryService } from "../Inventory/InventoryService";
import { PlayerService } from "../Player/PlayerService";
import { BeforeBlockHitSignal } from "./Signal/BeforeBlockHitSignal";

@Service({})
export class BlockInteractService implements OnStart {
	constructor(
		private readonly invService: InventoryService,
		private readonly entityService: EntityService,
		private readonly playerService: PlayerService,
	) {}

	OnStart(): void {
		ServerSignals.CustomMoveCommand.Connect((event) => {
			if (!event.is("PlaceBlock")) return;

			const itemType = event.value.itemType;
			const pos = event.value.pos;
			const clientId = event.clientId;

			const world = WorldAPI.GetMainWorld();
			const itemMeta = ItemUtil.GetItemMeta(itemType);

			const rollback = () => {
				Network.ServerToClient.RevertBlockPlace.Server.FireClient(clientId, pos);
			};

			if (!itemMeta.block?.blockId) {
				return rollback();
			}

			// const player = Dependency<PlayerService>().GetPlayerFromClientId(clientId);
			const entity = Dependency<EntityService>().GetEntityByClientId(clientId);
			if (!entity) {
				return rollback();
			}
			if (!(entity instanceof CharacterEntity)) {
				return rollback();
			}
			if (!entity.GetInventory().HasEnough(itemType, 1)) {
				return rollback();
			}

			const beforeBlockPlaced = ServerSignals.BeforeBlockPlaced.Fire(
				new BeforeBlockPlacedSignal(pos, itemType, itemMeta.block.blockId, entity),
			);

			if (beforeBlockPlaced.isCancelled()) {
				return rollback();
			}

			entity.GetInventory().Decrement(itemType, 1);
			world.PlaceBlockById(pos, itemMeta.block.blockId, {
				placedByEntityId: entity.id,
			});
			ServerSignals.BlockPlace.Fire(new BlockPlaceSignal(pos, itemType, itemMeta.block.blockId, entity));
			entity.SendItemAnimationToClients(0, 0, clientId);
		});

		ServerSignals.CustomMoveCommand.Connect((event) => {
			if (!event.is("HitBlock")) return;

			const clientId = event.clientId;
			let pos = event.value;

			const entity = this.entityService.GetEntityByClientId(clientId);
			const rollback = () => {};
			if (entity && entity instanceof CharacterEntity) {
				const itemInHand = entity.GetInventory().GetHeldItem();
				const itemMeta = itemInHand?.GetMeta();
				if (!itemInHand) {
					return rollback();
				}
				if (!itemMeta?.breakBlock) {
					return rollback();
				}
				const world = WorldAPI.GetMainWorld();

				pos = BlockDataAPI.GetParentBlockPos(pos) ?? pos;

				const voxel = world.GetRawVoxelDataAt(pos);
				if (!voxel) {
					return rollback();
				}
				const player = this.playerService.GetPlayerFromClientId(clientId);
				if (!player) {
					return rollback();
				}

				const blockId = VoxelWorld.VoxelDataToBlockId(voxel);

				// Cancellable signal
				const damage = BlockHitDamageCalc(player, pos, itemMeta.breakBlock);
				const beforeSignal = ServerSignals.BeforeBlockHit.Fire(
					new BeforeBlockHitSignal(pos, player, damage, itemInHand),
				);

				if (beforeSignal.IsCancelled()) {
					return rollback();
				}

				const health = BlockDataAPI.GetBlockData<number>(pos, "health") ?? WorldAPI.DefaultVoxelHealth;
				const newHealth = math.max(health - beforeSignal.Damage, 0);
				BlockDataAPI.SetBlockData(pos, "health", newHealth);

				// After signal
				ServerSignals.BlockHit.Fire({ blockId, player, blockPos: pos });
				print("Firing BlockHit");
				Network.ServerToClient.BlockHit.Server.FireAllClients(pos, entity.id);

				if (newHealth === 0) {
					ServerSignals.BeforeBlockDestroyed.Fire({
						blockId: blockId,
						blockMeta: itemMeta,
						blockPos: pos,
					});
					world.PlaceBlockById(pos, 0, {
						placedByEntityId: entity.id,
					});
					ServerSignals.BlockDestroyed.Fire({ blockId: blockId, blockMeta: itemMeta, blockPos: pos });
					Network.ServerToClient.BlockDestroyed.Server.FireAllClients(pos, blockId);
				}

				return;
			}
			rollback();
		});

		Network.ClientToServer.HitBlock.Server.OnClientEvent((clientId, pos) => {});
	}
}
