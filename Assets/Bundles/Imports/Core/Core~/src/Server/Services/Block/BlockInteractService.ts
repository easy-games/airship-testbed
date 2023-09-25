import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { AOEDamageMeta, BreakBlockMeta, ItemMeta } from "Shared/Item/ItemMeta";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { BeforeBlockPlacedSignal } from "Shared/Signals/BeforeBlockPlacedSignal";
import { BlockGroupPlaceSignal, BlockPlaceSignal } from "Shared/Signals/BlockPlaceSignal";
import { MathUtil } from "Shared/Util/MathUtil";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { DamageMeta } from "../Damage/DamageService";
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
		let itemMap: Map<ItemType, number> = new Map<ItemType, number>();
		items.forEach((itemMeta, index) => {
			if (itemMeta.block) {
				const position = positions[index];

				//Add to inventory map
				let amount = 0;
				amount += itemMap.get(itemMeta.itemType) ?? 0;
				amount++;
				itemMap.set(itemMeta.itemType, amount);

				itemTypes[index] = itemMeta.itemType;
				blockTypes[index] = itemMeta.block.blockId;
			}
		});

		//Batching to avoid many network calls in Decrement
		itemMap.forEach((amount, key) => {
			entity.GetInventory().Decrement(key, amount);
		});

		WorldAPI.GetMainWorld()?.PlaceBlockGroupById(positions, blockTypes, {
			placedByEntityId: entity.id,
		});
		CoreServerSignals.BlockGroupPlace.Fire(new BlockGroupPlaceSignal(positions, itemTypes, blockTypes, entity));
		entity.SendItemAnimationToClients(0, 0, entity.ClientId);
	}

	public DamageBlock(entity: Entity | undefined, breakBlockMeta: BreakBlockMeta, voxelPos: Vector3): boolean {
		const world = WorldAPI.GetMainWorld();
		if (!world) {
			return false;
		}

		voxelPos = BlockDataAPI.GetParentBlockPos(voxelPos) ?? voxelPos;

		const block = world.GetBlockAt(voxelPos);
		if (block.IsAir()) {
			return false;
		}

		// Cancellable signal
		const damage = WorldAPI.CalculateBlockHitDamageFromBreakBlockMeta(entity, block, voxelPos, breakBlockMeta);
		if (damage === 0) {
			return false;
		}
		const beforeSignal = CoreServerSignals.BeforeBlockHit.Fire(
			new BeforeBlockHitSignal(block, voxelPos, entity, damage, false),
		);

		//BLOCK DAMAGE
		const health = BlockDataAPI.GetBlockData<number>(voxelPos, "health") ?? WorldAPI.DefaultVoxelHealth;
		const newHealth = math.max(health - beforeSignal.damage, 0);
		BlockDataAPI.SetBlockData(voxelPos, "health", newHealth);

		// After signal
		CoreServerSignals.BlockHit.Fire({ blockId: block.blockId, entity, blockPos: voxelPos });
		print(`Firing BlockHit. damage=${beforeSignal.damage}`);
		CoreNetwork.ServerToClient.BlockHit.Server.FireAllClients(voxelPos, block.blockId, entity?.id);

		//BLOCK DEATH
		if (newHealth === 0) {
			CoreServerSignals.BeforeBlockDestroyed.Fire({
				blockId: block.blockId,
				blockPos: voxelPos,
				entity: entity,
			});
			world.PlaceBlockById(voxelPos, 0, {
				placedByEntityId: entity?.id,
			});
			CoreServerSignals.BlockDestroyed.Fire({
				blockId: block.blockId,
				blockPos: voxelPos,
			});
			CoreNetwork.ServerToClient.BlockDestroyed.Server.FireAllClients(voxelPos, block.blockId);
		}
		return true;
	}

	public DamageBlocks(entity: Entity | undefined, voxelPositions: Vector3[], damages: number[]): boolean {
		print("Damaging blocks");
		const world = WorldAPI.GetMainWorld();
		if (!world) {
			return false;
		}

		let damageI = 0;
		let damagePositions: Vector3[] = [];
		let damagedIds: number[] = [];
		let newGroupHealth: number[] = [];

		let destroyedI = 0;
		let destroyedPositions: Vector3[] = [];
		let destroyedIds: number[] = [];
		let destroyedAirId: number[] = [];
		for (let i = 0; i < voxelPositions.size(); i++) {
			let voxelPos = BlockDataAPI.GetParentBlockPos(voxelPositions[i]) ?? voxelPositions[i];
			let damage = damages[i];
			print("Attempting damage: " + voxelPos);
			const block = world.GetBlockAt(voxelPos);
			if (block.IsAir()) {
				continue;
			}

			damage = WorldAPI.CalculateBlockHitDamage(entity, block, voxelPos, damage);

			// Hacked in for the 9/24/23 playtest
			if (block.itemType === ItemType.STONE_BRICK) {
				damage *= 0.5;
			} else if (block.itemType === ItemType.OBSIDIAN) {
				damage *= 0.2;
			} else if (block.itemType === ItemType.CERAMIC) {
				damage *= 0;
			}

			if (damage === 0) {
				continue;
			}

			// Cancellable signal
			CoreServerSignals.BeforeBlockHit.Fire(new BeforeBlockHitSignal(block, voxelPos, entity, damage, true));

			//BLOCK DAMAGE
			const health = BlockDataAPI.GetBlockData<number>(voxelPos, "health") ?? WorldAPI.DefaultVoxelHealth;
			const newHealth = math.max(health - damage, 0);

			print(`Adding BlockHit. damage=${damage}`);
			damagePositions[damageI] = voxelPos;
			damagedIds[damageI] = block.blockId;
			newGroupHealth[damageI] = newHealth;
			damageI++;

			//BLOCK DEATH
			if (newHealth === 0) {
				destroyedPositions[destroyedI] = voxelPos;
				destroyedIds[destroyedI] = block.blockId;
				destroyedAirId[destroyedI] = 0;
				destroyedI++;
			}
		}

		if (damageI === 0 || destroyedI === 0) {
			return false;
		}

		if (damageI > 0) {
			print(`Firing Damage Group Event`);
			//Apply damage to whole group of blocks
			BlockDataAPI.SetBlockGroupData(damagePositions, "health", newGroupHealth);
			// CoreNetwork.ServerToClient.BlockGroupHit.Server.FireAllClients(damagePositions, damagedIds, entity.id);
		}

		if (destroyedI > 0) {
			print(`Firing Destroyed Group Event`);
			//Destroy group of blocks
			world.PlaceBlockGroupById(destroyedPositions, destroyedAirId);

			for (let i = 0; i < destroyedI; i++) {
				CoreServerSignals.BlockDestroyed.Fire({
					blockId: destroyedIds[i],
					blockPos: destroyedPositions[i],
					entity: entity,
				});
			}
			// CoreNetwork.ServerToClient.BlockGroupDestroyed.Server.FireAllClients(destroyedPositions, destroyedIds);
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
		print("damage AOE at: " + centerPosition);
		//TODO add array to store all blocks that need to be destroyed and handle in this function not DamageBlock()
		let positions: Vector3[] = [];
		let damages: number[] = [];
		let damageI = 0;

		/* TODO: Eventually damage from explosion outword so the damage can decay as blocks stop the eruption
		for (let i = 0; i < aoeMeta.damageRadius; i++) {
			this.DamageRing(entity, voxelPos, i, aoeMeta, breakblockMeta);
		}*/

		for (let x = centerPosition.x - aoeMeta.damageRadius; x < centerPosition.x + aoeMeta.damageRadius; x++) {
			for (let y = centerPosition.y - aoeMeta.damageRadius; y < centerPosition.y + aoeMeta.damageRadius; y++) {
				for (
					let z = centerPosition.z - aoeMeta.damageRadius;
					z < centerPosition.z + aoeMeta.damageRadius;
					z++
				) {
					const targetPos = new Vector3(x, y, z);
					const targetVoxelPos = WorldAPI.GetVoxelPosition(targetPos);
					const distanceDelta = targetPos.Distance(centerPosition) / aoeMeta.damageRadius;
					const maxDamage = MathUtil.Lerp(
						aoeMeta.innerDamage,
						aoeMeta.outerDamage,
						distanceDelta * distanceDelta,
					);
					if (maxDamage > 0) {
						print("Adding " + maxDamage + " damage to: " + targetVoxelPos);
						damages[damageI] = maxDamage;
						positions[damageI] = targetVoxelPos;
						damageI++;
					}
				}
			}
		}

		this.DamageBlocks(entity, positions, damages);
	}

	private GetDamageRing(
		entity: Entity,
		center: Vector3,
		radius: number,
		aoeMeta: AOEDamageMeta,
		breakBlock: BreakBlockMeta,
	) {}
}
