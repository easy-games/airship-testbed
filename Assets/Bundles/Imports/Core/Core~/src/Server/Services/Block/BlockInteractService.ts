import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { AOEDamageMeta, BreakBlockMeta } from "Shared/Item/ItemMeta";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { BeforeBlockPlacedSignal } from "Shared/Signals/BeforeBlockPlacedSignal";
import { BlockGroupPlaceSignal, BlockPlaceSignal } from "Shared/Signals/BlockPlaceSignal";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { DamageMeta } from "../Damage/DamageService";
import { EntityService } from "../Entity/EntityService";
import { InventoryService } from "../Inventory/InventoryService";
import { PlayerService } from "../Player/PlayerService";
import { BeforeBlockHitSignal } from "./Signal/BeforeBlockHitSignal";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { AOEDamageMeta, BreakBlockMeta, ItemMeta } from "Shared/Item/ItemMeta";
import { Entity } from "Shared/Entity/Entity";
import { DamageMeta } from "../Damage/DamageService";
import { MathUtil } from "Shared/Util/MathUtil";
import { ItemType } from "Shared/Item/ItemType";

@Service({})
export class BlockInteractService implements OnStart {
	constructor(
		private readonly invService: InventoryService,
		private readonly entityService: EntityService,
		private readonly playerService: PlayerService,
	) {}

	OnStart(): void {
		//Placed a block
		CoreServerSignals.CustomMoveCommand.Connect((event) => {
			if (!event.is("PlaceBlock")) return;

			const itemType = event.value.itemType;
			const pos = event.value.pos;
			const clientId = event.clientId;

			const world = WorldAPI.GetMainWorld();
			const itemMeta = ItemUtil.GetItemMeta(itemType);

			const rollback = () => {
				CoreNetwork.ServerToClient.RevertBlockPlace.Server.FireClient(clientId, pos);
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

			const beforeBlockPlaced = CoreServerSignals.BeforeBlockPlaced.Fire(
				new BeforeBlockPlacedSignal(pos, itemType, itemMeta.block.blockId, entity),
			);

			if (beforeBlockPlaced.IsCancelled()) {
				return rollback();
			}

			this.PlaceBlock(entity, pos, itemMeta);
		});

		//Hit Block with an Item
		CoreServerSignals.CustomMoveCommand.Connect((event) => {
			if (!event.is("HitBlock")) return;

			const world = WorldAPI.GetMainWorld();
			if (world === undefined) return;

			const clientId = event.clientId;
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

				if (!this.DamageBlock(entity, itemMeta.breakBlock, event.value)) {
					return rollback();
				}
				return;
			}

			rollback();
		});

		//Deprecated? Now using "HitBlock" move command
		CoreNetwork.ClientToServer.HitBlock.Server.OnClientEvent((clientId, pos) => {});
	}

	public PlaceBlock(entity: CharacterEntity, pos: Vector3, item: ItemMeta) {
		if (item.block) {
			entity.GetInventory().Decrement(item.itemType, 1);
			WorldAPI.GetMainWorld()?.PlaceBlockById(pos, item.block.blockId, {
				placedByEntityId: entity.id,
			});
			CoreServerSignals.BlockPlace.Fire(new BlockPlaceSignal(pos, item.itemType, item.block.blockId, entity));
			entity.SendItemAnimationToClients(0, 0, entity.ClientId);
		}
	}

	public PlaceBlockGroup(entity: CharacterEntity, positions: Vector3[], items: ItemMeta[]) {
		let itemTypes: ItemType[] = [];
		let blockTypes: number[] = [];
		items.forEach((itemMeta, index) => {
			if (itemMeta.block) {
				const position = positions[index];
				entity.GetInventory().Decrement(itemMeta.itemType, 1);
				itemTypes[index] = itemMeta.itemType;
				blockTypes[index] = itemMeta.block.blockId;
			}
		});
		WorldAPI.GetMainWorld()?.PlaceBlockGroupById(positions, blockTypes, {
			placedByEntityId: entity.id,
		});
		CoreServerSignals.BlockGroupPlace.Fire(new BlockGroupPlaceSignal(positions, itemTypes, blockTypes, entity));
		entity.SendItemAnimationToClients(0, 0, entity.ClientId);
	}

	public DamageBlock(entity: Entity, breakBlockMeta: BreakBlockMeta, voxelPos: Vector3): boolean {
		const world = WorldAPI.GetMainWorld();
		if (!world) {
			return false;
		}

		voxelPos = BlockDataAPI.GetParentBlockPos(voxelPos) ?? voxelPos;

		const block = world.GetBlockAt(voxelPos);
		if (block.IsAir()) {
			return false;
		}

		const player = entity.player;
		if (!player) {
			return false;
		}

		// Cancellable signal
		const damage = WorldAPI.BlockHitDamageFunc(player, block, voxelPos, breakBlockMeta);
		if (damage === 0) {
			return false;
		}
		const beforeSignal = CoreServerSignals.BeforeBlockHit.Fire(
			new BeforeBlockHitSignal(block, voxelPos, player, damage, breakBlockMeta),
		);

		//BLOCK DAMAGE
		const health = BlockDataAPI.GetBlockData<number>(voxelPos, "health") ?? WorldAPI.DefaultVoxelHealth;
		const newHealth = math.max(health - beforeSignal.damage, 0);
		BlockDataAPI.SetBlockData(voxelPos, "health", newHealth);

		// After signal
		CoreServerSignals.BlockHit.Fire({ blockId: block.blockId, player, blockPos: voxelPos });
		print(`Firing BlockHit. damage=${beforeSignal.damage}`);
		CoreNetwork.ServerToClient.BlockHit.Server.FireAllClients(voxelPos, entity.id);

		//BLOCK DEATH
		if (newHealth === 0) {
			CoreServerSignals.BeforeBlockDestroyed.Fire({
				blockId: block.blockId,
				blockPos: voxelPos,
				entity: entity,
			});
			world.PlaceBlockById(voxelPos, 0, {
				placedByEntityId: entity.id,
			});
			CoreServerSignals.BlockDestroyed.Fire({
				blockId: block.blockId,
				blockPos: voxelPos,
			});
			CoreNetwork.ServerToClient.BlockDestroyed.Server.FireAllClients(voxelPos, block.blockId);
		}
		return true;
	}

	public DamageBlockAOE(
		entity: Entity,
		centerPosition: Vector3,
		breakblockMeta: BreakBlockMeta,
		aoeMeta: AOEDamageMeta,
		config: DamageMeta,
	) {
		const voxelPos = WorldAPI.GetVoxelPosition(centerPosition);
		for (let i = 0; i < aoeMeta.damageRadius; i++) {
			this.DamageRing(entity, voxelPos, i, aoeMeta, breakblockMeta);
		}
	}

	private DamageRing(
		entity: Entity,
		center: Vector3,
		radius: number,
		aoeMeta: AOEDamageMeta,
		breakBlock: BreakBlockMeta,
	) {
		for (let x = center.x - radius; x < center.x + radius; x++) {
			for (let y = center.y - radius; y < center.y + radius; y++) {
				for (let z = center.z - radius; z < center.z + radius; z++) {
					const pos = new Vector3(x, y, z);
					const distanceDelta = pos.Distance(center) / aoeMeta.damageRadius;
					const maxDamage = MathUtil.Lerp(
						aoeMeta.innerDamage,
						aoeMeta.outerDamage,
						distanceDelta * distanceDelta,
					);
					if (maxDamage > 0) {
						this.DamageBlock(entity, breakBlock, pos);
					}
				}
			}
		}
	}
}
