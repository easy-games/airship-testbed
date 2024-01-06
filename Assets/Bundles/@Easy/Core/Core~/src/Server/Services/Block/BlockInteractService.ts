import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { AOEDamageDef, BlockDamageType, BreakBlockDef, ItemDef, TillBlockDef } from "Shared/Item/ItemDefinitionTypes";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { BeforeBlockPlacedSignal } from "Shared/Signals/BeforeBlockPlacedSignal";
import { BlockGroupPlaceSignal, BlockPlaceSignal } from "Shared/Signals/BlockPlaceSignal";
import { MathUtil } from "Shared/Util/MathUtil";
import { BlockDataAPI, CoreBlockMetaKeys } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { BlockData } from "Shared/VoxelWorld/World";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { EntityService } from "../Entity/EntityService";
import { InventoryService } from "../Inventory/InventoryService";
import { PlayerService } from "../Player/PlayerService";
import { BeforeBlockHitSignal } from "./Signal/BeforeBlockHitSignal";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { NetworkUtil } from "Shared/Util/NetworkUtil";

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
			if (!event.Is("PlaceBlock")) return;

			print("PlaceBlock tick=" + InstanceFinder.TimeManager.LocalTick);

			const itemType = event.value.itemType;
			const pos = event.value.pos;
			const clientId = event.clientId;

			const world = WorldAPI.GetMainWorld();
			const itemMeta = ItemUtil.GetItemDef(itemType);

			const rollback = () => {
				CoreNetwork.ServerToClient.RevertBlockPlace.server.FireClient(clientId, pos);
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
				new BeforeBlockPlacedSignal(pos, itemType, world!.GetVoxelIdFromId(itemMeta.block!.blockId), entity),
			);

			if (beforeBlockPlaced.IsCancelled()) {
				return rollback();
			}

			this.PlaceBlock(entity, pos, itemMeta);
		});

		//Placed a block
		CoreServerSignals.CustomMoveCommand.Connect((event) => {
			if (!event.Is("PlaceBlockEntity")) return;

			print("PlaceBlockEntity tick=" + InstanceFinder.TimeManager.LocalTick);

			const itemType = event.value.itemType;
			const pos = event.value.pos;
			const clientId = event.clientId;

			const world = WorldAPI.GetMainWorld();
			const itemMeta = ItemUtil.GetItemDef(itemType);

			const rollback = () => {
				// CoreNetwork.ServerToClient.RevertBlockPlace.server.FireClient(clientId, pos);
			};

			if (!itemMeta.blockEntity?.blockId) {
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
				new BeforeBlockPlacedSignal(
					pos,
					itemType,
					world!.GetVoxelIdFromId(itemMeta.blockEntity!.blockId),
					entity,
				),
			);

			if (beforeBlockPlaced.IsCancelled()) {
				return rollback();
			}

			this.PlaceBlockEntity(entity, pos, itemMeta);
		});

		//Hit Block with an Item
		CoreServerSignals.CustomMoveCommand.Connect((event) => {
			if (!event.Is("HitBlock")) return;

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

		//Hit Block with an Item
		CoreServerSignals.CustomMoveCommand.Connect((event) => {
			if (!event.Is("TillBlock")) return;

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
				if (!itemMeta?.tillBlock) {
					return rollback();
				}

				if (!this.TillBlock(entity, itemMeta.tillBlock, event.value)) {
					return rollback();
				}
				return;
			}

			rollback();
		});

		//Deprecated? Now using "HitBlock" move command
		CoreNetwork.ClientToServer.HitBlock.server.OnClientEvent((clientId, pos) => {});
	}

	public PlaceBlockEntity(entity: CharacterEntity, pos: Vector3, item: ItemDef, blockData?: BlockData) {
		print("place block entity = ", pos);

		if (item.blockEntity) {
			entity.GetInventory().Decrement(item.itemType, 1);

			const world = WorldAPI.GetMainWorld();
			if (world) {
				if (item.blockEntity.prefab) {
					let prefab = AssetBridge.Instance.LoadAsset<Object>(item.blockEntity.prefab.path);
					const go = GameObjectUtil.Instantiate(prefab);
					go.transform.position = pos.add(new Vector3(0.5, 0.5, 0.5));
					NetworkUtil.Spawn(go);
					//Bridge.SetParentToSceneRoot(go.transform);
					//go.transform.position = pos.add(new Vector3(0.5, 0.5, 0.5));
				} else {
					// let prefab = MeshProcessor.ProduceSingleBlock(
					// 	world.voxelWorld.blocks.GetBlockIdFromStringId(item.itemType),
					// 	world.voxelWorld,
					// 	0,
					// 	0,
					// );
					// if (prefab) {
					// 	const obj = prefab;
					// 	obj.transform.position = pos.add(new Vector3(0.5, 0.5, 0.5));
					// } else {
					// 	warn("no prefab");
					// }
				}
			}

			entity.SendItemAnimationToClients(0, 0, entity.clientId);
		}
	}

	public PlaceBlock(entity: CharacterEntity, pos: Vector3, item: ItemDef, blockData?: BlockData) {
		if (item.block) {
			entity.GetInventory().Decrement(item.itemType, 1);

			const world = WorldAPI.GetMainWorld();
			if (world) {
				world.PlaceBlockById(pos, item.block.blockId, {
					placedByEntityId: entity.id,
					blockData: blockData,
				});
			}
			// blockData:{
			// 	canBreak: true,
			// }
			CoreServerSignals.BlockPlace.Fire(new BlockPlaceSignal(pos, item.itemType, item.block.blockId, entity));
			entity.SendItemAnimationToClients(0, 0, entity.clientId);
		}
	}

	public PlaceBlockGroup(entity: CharacterEntity, positions: Vector3[], items: ItemDef[]) {
		let itemTypes: ItemType[] = [];
		let blockTypes: string[] = [];
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
				blockTypes[index] = itemMeta.block.blockId!;
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
		entity.SendItemAnimationToClients(0, 0, entity.clientId);
	}

	public TillBlock(entity: Entity | undefined, tillBlockMeta: TillBlockDef, voxelPos: Vector3): boolean {
		const world = WorldAPI.GetMainWorld();
		if (!world) {
			return false;
		}

		voxelPos = BlockDataAPI.GetParentBlockPos(voxelPos) ?? voxelPos;

		const block = world.GetBlockAt(voxelPos);
		if (block.IsAir()) {
			return false;
		}

		const tillable = block.itemDef?.block?.tillable;
		if (!tillable) return false;

		const breakState = BlockDataAPI.GetBlockData(voxelPos, CoreBlockMetaKeys.NO_BREAK);
		const tillState = BlockDataAPI.GetBlockData(voxelPos, CoreBlockMetaKeys.CAN_TILL);

		world.PlaceBlockById(voxelPos, tillable.tillsToBlockId, { placedByEntityId: entity?.id });

		// If the resulting block is also tillable, mark tillable ?
		const tillBlockType = ItemUtil.GetItemTypeFromStringId(tillable.tillsToBlockId);
		if (tillBlockType !== undefined) {
			const tillBlockMeta = ItemUtil.GetItemDef(tillBlockType);
			BlockDataAPI.SetBlockData(
				voxelPos,
				CoreBlockMetaKeys.CAN_TILL,
				tillBlockMeta.block?.tillable !== undefined,
			);
		}

		BlockDataAPI.SetBlockData(voxelPos, CoreBlockMetaKeys.NO_BREAK, breakState);
		return true;
	}

	public DamageBlock(entity: Entity | undefined, breakBlockMeta: BreakBlockDef, voxelPos: Vector3): boolean {
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
		const damage = WorldAPI.CalculateBlockHitDamage(entity, block, voxelPos, breakBlockMeta);
		if (damage === 0) {
			return false;
		}
		const beforeSignal = CoreServerSignals.BeforeBlockHit.Fire(
			new BeforeBlockHitSignal(block, voxelPos, entity, damage, false),
		);

		//BLOCK DAMAGE
		const health =
			BlockDataAPI.GetBlockData<number>(voxelPos, CoreBlockMetaKeys.CURRENT_HEALTH) ??
			WorldAPI.defaultVoxelHealth;
		const newHealth = math.max(health - beforeSignal.damage, 0);
		BlockDataAPI.SetBlockData(voxelPos, CoreBlockMetaKeys.CURRENT_HEALTH, newHealth);

		// After signal
		CoreServerSignals.BlockHit.Fire({
			blockId: block.runtimeBlockId,
			entity,
			blockPos: voxelPos,
		});

		if (entity?.player) {
			CoreNetwork.ServerToClient.BlockHit.server.FireExcept(
				entity.player.clientId,
				voxelPos,
				block.runtimeBlockId,
				entity?.id,
				damage,
				newHealth === 0,
			);
		} else {
			CoreNetwork.ServerToClient.BlockHit.server.FireAllClients(
				voxelPos,
				block.runtimeBlockId,
				entity?.id,
				damage,
				newHealth === 0,
			);
		}

		//BLOCK DEATH
		if (newHealth === 0) {
			CoreServerSignals.BeforeBlockDestroyed.Fire({
				block,
				blockPos: voxelPos,
				entity: entity,
			});
			world.DeleteBlock(voxelPos);
			CoreServerSignals.BlockDestroyed.Fire({
				blockId: block.runtimeBlockId,
				blockPos: voxelPos,
				entity: entity,
			});
			// CoreNetwork.ServerToClient.BlockDestroyed.Server.FireAllClients(voxelPos, block.runtimeBlockId);
		}
		return true;
	}

	public DamageBlocks(
		entity: Entity | undefined,
		damageType: BlockDamageType,
		voxelPositions: Vector3[],
		damages: number[],
	): boolean {
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
		for (let i = 0; i < voxelPositions.size(); i++) {
			let voxelPos = BlockDataAPI.GetParentBlockPos(voxelPositions[i]) ?? voxelPositions[i];
			let damage = damages[i];
			const block = world.GetBlockAt(voxelPos);
			if (block.IsAir()) {
				continue;
			}

			damage = WorldAPI.CalculateBlockHitDamage(entity, block, voxelPos, {
				damage: damage,
				damageType: damageType,
			});
			if (damage <= 0) {
				//No Damage
				continue;
			}

			// Cancellable signal
			CoreServerSignals.BeforeBlockHit.Fire(new BeforeBlockHitSignal(block, voxelPos, entity, damage, true));

			//BLOCK DAMAGE
			let health = BlockDataAPI.GetBlockData<number>(voxelPos, "health") ?? WorldAPI.defaultVoxelHealth;
			health = math.max(health - damage, 0);

			damagePositions[damageI] = voxelPos;
			damagedIds[damageI] = block.runtimeBlockId;
			newGroupHealth[damageI] = health;
			damageI++;

			//BLOCK DEATH
			if (health === 0) {
				destroyedPositions[destroyedI] = voxelPos;
				destroyedIds[destroyedI] = block.runtimeBlockId;
				destroyedI++;
			}
		}

		if (damageI === 0 || destroyedI === 0) {
			return false;
		}

		this.SendDamageEvents(
			entity,
			newGroupHealth,
			damagePositions,
			destroyedIds,
			destroyedPositions,
			damageI,
			destroyedI,
		);

		return true;
	}

	private SendDamageEvents(
		entity: Entity | undefined,
		newGroupHealth: number[],
		damagePositions: Vector3[],
		destroyedIds: number[],
		destroyedPositions: Vector3[],
		numberOfDamages: number,
		numberOfDeaths: number,
	) {
		if (numberOfDamages > 0) {
			//Apply damage to whole group of blocks
			BlockDataAPI.SetBlockGroupCustomData(damagePositions, "health", newGroupHealth);
		}

		if (numberOfDeaths > 0) {
			//Destroy group of blocks
			WorldAPI.GetMainWorld()?.DeleteBlockGroup(destroyedPositions);

			for (let i = 0; i < numberOfDeaths; i++) {
				CoreServerSignals.BlockDestroyed.Fire({
					blockId: destroyedIds[i],
					blockPos: destroyedPositions[i],
					entity: entity,
				});
			}
		}
	}

	public DamageBlockAOE(entity: Entity | undefined, centerPosition: Vector3, aoeMeta: AOEDamageDef) {
		const world = WorldAPI.GetMainWorld();
		if (!world) {
			return;
		}
		centerPosition = WorldAPI.GetVoxelPosition(centerPosition);

		let damageVectors: { dir: Vector3; damage: number }[] = [];
		let i = 0;
		for (let x = -1; x <= 1; x++) {
			for (let y = -1; y <= 1; y++) {
				for (let z = -1; z <= 1; z++) {
					damageVectors[i] = {
						dir: new Vector3(x, y, z).normalized,
						damage: aoeMeta.blockExplosiveDamage,
					};

					i++;
				}
			}
		}

		//TODO add array to store all blocks that need to be destroyed and handle in this function not DamageBlock()
		let positions: Vector3[] = [];
		let damages: number[] = [];
		let damageI = 0;

		let currentPos: Vector3 = new Vector3(0, 0, 0);
		let ringToggle = false;

		// DebugUtil.DrawBox(
		// 	centerPosition.add(new Vector3(0, 0.5, 0)),
		// 	Quaternion.identity,
		// 	Vector3.one.mul(0.5),
		// 	Color.black,
		// 	10,
		// );

		//Damage the block you hit
		const centerBlock = world.GetBlockAt(centerPosition);
		if (centerBlock && !centerBlock.IsAir()) {
			positions[damageI] = centerPosition;
			damages[damageI] = WorldAPI.CalculateBlockHitDamage(entity, centerBlock, centerPosition, {
				damage: aoeMeta.blockExplosiveDamage,
				damageType: BlockDamageType.BLAST,
			});
			damageI++;
		}

		for (let ringRadius = 1; ringRadius <= math.ceil(aoeMeta.damageRadius * 1.5); ringRadius++) {
			//print("ring: " + ringRadius);
			let xRadius = 0;
			let ringDelta = (ringRadius - 1) / (aoeMeta.damageRadius - 1);

			//Task.Delay((ringRadius - 1) * delay, () => {
			ringToggle = !ringToggle;
			//Check a 3D Diamond shell for blocks
			for (let depthI = -ringRadius; depthI <= ringRadius; depthI++) {
				//Check a 2D Diamond of blocks at this depth
				let yRadius = 0;
				currentPos = new Vector3(-ringRadius, 0, 0);
				//Check along a horizontal diameter
				for (let horizontalI = -xRadius; horizontalI <= xRadius; horizontalI++) {
					//Each point along can have 2 blocks
					for (let verticalI = 0; verticalI < 2; verticalI++) {
						//Only check two blocks when we aren't at the corners
						if (yRadius === 0 && verticalI > 0) {
							continue;
						}

						//Find the position
						currentPos = centerPosition.add(
							new Vector3(horizontalI, verticalI === 0 ? yRadius : -yRadius, depthI),
						);
						//print("Pos: " + currentPos);
						const block = world.GetBlockAt(currentPos);
						if (block.IsAir()) {
							//Ignore Air
							continue;
						}
						const distanceDamage = this.GetMaxAOEDamage(currentPos, centerPosition, aoeMeta);
						if (distanceDamage <= 0) {
							//Ignore blocks too far away
							continue;
						}
						const maxDamage = WorldAPI.CalculateBlockHitDamage(entity, block, currentPos, {
							damage: distanceDamage,
							damageType: BlockDamageType.BLAST,
						});
						const blockDir = currentPos.sub(centerPosition).normalized;
						let finalDamage = 0;
						//Take damage from damage vectors
						damageVectors.forEach((damageVector) => {
							if (damageVector.damage > 0) {
								const dotDelta = math.max(Vector3.Dot(damageVector.dir, blockDir), 0) * 2 - 1;
								if (dotDelta > 0) {
									let vectorDamage = math.max(0, math.min(damageVector.damage, dotDelta * maxDamage));
									//const absorbedDamage = math.max(0, vectorDamage - maxDamage);
									damageVector.damage *= math.clamp(maxDamage / distanceDamage, 0, 1); //Blocking strength
									finalDamage += math.min(vectorDamage, maxDamage);
								}
							}
						});

						//Reduce damge
						if (finalDamage <= 0) {
							//No Damage
							continue;
						}

						// Cancellable signal
						CoreServerSignals.BeforeBlockHit.Fire(
							new BeforeBlockHitSignal(block, currentPos, entity, finalDamage, true),
						);

						// DebugUtil.DrawBox(
						// 	currentPos.add(new Vector3(0, 0.5, 0)),
						// 	Quaternion.identity,
						// 	Vector3.one.mul(0.25),
						// 	Color.Lerp(Color.red, Color.blue, finalDamage / maxDamage),
						// 	10,
						// );

						/*if (damageI > 0) {
							positions.forEach((element) => {
								if (currentPos === element) {
									error("CHECKING POSITION TWICE: " + currentPos);
								}
							});
						}*/
						//print("Damage block " + currentPos + ": " + finalDamage);
						positions[damageI] = currentPos;
						damages[damageI] = finalDamage;
						damageI++;
					}
					yRadius += horizontalI < 0 ? 1 : -1;
				}
				xRadius += depthI < 0 ? 1 : -1;
			}
			//});
		}
		this.DamageBlocks(entity, BlockDamageType.BLAST, positions, damages);
	}

	public DamageBlockAOESimple(entity: Entity, centerPosition: Vector3, aoeMeta: AOEDamageDef) {
		//TODO add array to store all blocks that need to be destroyed and handle in this function not DamageBlock()
		let positions: Vector3[] = [];
		let damages: number[] = [];
		let damageI = 0;
		for (let x = centerPosition.x - aoeMeta.damageRadius; x < centerPosition.x + aoeMeta.damageRadius; x++) {
			for (let y = centerPosition.y - aoeMeta.damageRadius; y < centerPosition.y + aoeMeta.damageRadius; y++) {
				for (
					let z = centerPosition.z - aoeMeta.damageRadius;
					z < centerPosition.z + aoeMeta.damageRadius;
					z++
				) {
					const targetVoxelPos = WorldAPI.GetVoxelPosition(new Vector3(x, y, z));
					const block = WorldAPI.GetMainWorld()?.GetBlockAt(targetVoxelPos);
					let maxDamage = 0;
					if (block) {
						WorldAPI.CalculateBlockHitDamage(entity, block, targetVoxelPos, {
							damage: this.GetMaxAOEDamage(targetVoxelPos, centerPosition, aoeMeta),
							damageType: BlockDamageType.BLAST,
						});
					} else {
						maxDamage = this.GetMaxAOEDamage(targetVoxelPos, centerPosition, aoeMeta);
					}
					if (maxDamage > 0) {
						damages[damageI] = maxDamage;
						positions[damageI] = targetVoxelPos;
						damageI++;
					}
				}
			}
		}

		this.DamageBlocks(entity, BlockDamageType.BLAST, positions, damages);
	}

	private GetMaxAOEDamage(voxelPos: Vector3, aoeCenter: Vector3, aoeMeta: AOEDamageDef) {
		const distanceDelta = voxelPos.Distance(aoeCenter) / aoeMeta.damageRadius;
		if (distanceDelta > 1) {
			return 0;
		}
		return MathUtil.Lerp(aoeMeta.innerDamage, aoeMeta.outerDamage, distanceDelta * distanceDelta);
	}
}
