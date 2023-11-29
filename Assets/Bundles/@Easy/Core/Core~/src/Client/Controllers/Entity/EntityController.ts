import { Controller, OnStart } from "@easy-games/flamework-core";
import ObjectUtils from "@easy-games/unity-object-utils";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { EntitySpawnClientSignal } from "Client/Signals/EntitySpawnClientEvent";
import { CoreNetwork } from "Shared/CoreNetwork";
import { DamageUtils } from "Shared/Damage/DamageUtils";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { CharacterEntity, CharacterEntityDto } from "Shared/Entity/Character/CharacterEntity";
import { Entity, EntityDto } from "Shared/Entity/Entity";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { EntitySerializer } from "Shared/Entity/EntitySerializer";
import { Inventory } from "Shared/Inventory/Inventory";
import { AbilityRegistry } from "Shared/Strollers/Abilities/AbilityRegistry";
import { Bin } from "Shared/Util/Bin";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { MathUtil } from "Shared/Util/MathUtil";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { AllBundleItems } from "Shared/Util/ReferenceManagerResources";
import { Task } from "Shared/Util/Task";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { LocalEntityController } from "../Character/LocalEntityController";
import { InventoryController } from "../Inventory/InventoryController";

@Controller({})
export class EntityController implements OnStart {
	private entities = new Map<number, Entity>();
	public entityHealthbarPrefab: Object;

	constructor(
		private readonly invController: InventoryController,
		private readonly localEntityController: LocalEntityController,
		private readonly abilityRegistry: AbilityRegistry,
	) {
		const humanEntityPrefab = AssetBridge.Instance.LoadAsset<GameObject>(
			EntityPrefabType.HUMAN,
		).GetComponent<NetworkObject>();
		const airshipPool = InstanceFinder.NetworkManager.ObjectPool as AirshipObjectPool;
		airshipPool.SlowlyCacheObjects(humanEntityPrefab, 60);

		this.entityHealthbarPrefab = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Client/Resources/Prefabs/EntityHealthbar.prefab",
		) as Object;
		PoolManager.PreLoadPool(this.entityHealthbarPrefab, 60);

		CoreNetwork.ServerToClient.SpawnEntities.Client.OnServerEvent((entityDtos) => {
			// if (RunUtil.IsEditor()) {
			// 	print(`Spawning ${entityDtos.size()} ${entityDtos.size() > 1 ? "entities" : "entity"}.`);
			// }
			entityDtos.forEach((entityDto) => {
				Profiler.BeginSample("SpawnEntity");
				try {
					this.AddEntity(entityDto);
				} catch (err) {
					error("[FATAL]: Failed to add entity: " + err);
				}
				Profiler.EndSample();
			});
		});
		CoreNetwork.ServerToClient.DespawnEntity.Client.OnServerEvent((entityId) => {
			const entity = this.GetEntityById(entityId);
			if (entity) {
				Profiler.BeginSample("DespawnEntity");
				this.DespawnEntity(entity);
				Profiler.EndSample();
			}
		});
	}

	OnStart(): void {
		CoreNetwork.ServerToClient.PlayEntityItemAnimation.Client.OnServerEvent((entityId, animationId, playMode) => {
			const entity = this.GetEntityById(entityId);
			if (!entity) return;

			entity.animator?.PlayUseAnim(animationId);
		});

		CoreNetwork.ServerToClient.Entity.SetHealth.Client.OnServerEvent((entityId, health, maxHealth) => {
			const entity = this.GetEntityById(entityId);
			if (entity) {
				entity.SetHealth(health);
				if (maxHealth !== undefined) {
					entity.SetMaxHealth(maxHealth);
				}
			}
		});
		CoreNetwork.ServerToClient.Entity.SetDisplayName.Client.OnServerEvent((entityId, value) => {
			const entity = this.GetEntityById(entityId);
			if (entity) {
				entity.SetDisplayName(value);
			}
		});
		CoreNetwork.ServerToClient.Entity.AddHealthbar.Client.OnServerEvent((entityId) => {
			const entity = this.GetEntityById(entityId);
			entity?.AddHealthbar();
		});
		CoreNetwork.ServerToClient.Entity.SetLookVector.Client.OnServerEvent((entityId, lookVector) => {
			const entity = this.GetEntityById(entityId);
			if (entity?.IsLocalCharacter()) {
				this.localEntityController.humanoidCameraMode?.SetDirection(lookVector);
			}
		});
		CoreNetwork.ServerToClient.Entity.FallDamageTaken.Client.OnServerEvent((entityId, velocity) => {
			const entity = this.GetEntityById(entityId);
			if (!entity) {
				return;
			}
			if (DamageUtils.GetFallDamage(velocity.y) > 0) {
				let effectPos = entity.model.transform.position;
				const raycastPos = WorldAPI.GetMainWorld()?.RaycastVoxel(effectPos, Vector3.down, 4);
				const landingEffect = EffectsManager.SpawnPrefabEffect(
					AllBundleItems.Entity_Movement_LandVFX,
					raycastPos ? raycastPos.HitPosition : effectPos,
					Vector3.zero,
					5,
				);
				if (landingEffect) {
					const fallDelta = DamageUtils.GetFallDelta(velocity.y);
					let particles = landingEffect.GetComponentsInChildren<ParticleSystem>();
					landingEffect.transform.localScale = Vector3.one.mul(MathUtil.Lerp(0.25, 1, fallDelta));

					const world = WorldAPI.GetMainWorld();

					const blockId = world?.RaycastBlockBelow(
						entity.model.transform.position.add(new Vector3(0, 0.25, 0)),
					)?.blockId;

					for (let i = 0; i < particles.Length; i++) {
						let particle = particles.GetValue(i);
						const isSmoke = particle.gameObject.name === "Smoke";
						if (isSmoke) {
							particle.startSize = MathUtil.Lerp(0.75, 4, fallDelta);
							particle.startSpeed = MathUtil.Lerp(20, 80, fallDelta);
						} else {
							particle.startSize = MathUtil.Lerp(0.05, 0.4, fallDelta * fallDelta);
							particle.startSpeed = MathUtil.Lerp(50, 120, fallDelta);
							if (blockId) {
								EffectsManager.SetParticleToBlockMaterial(
									particle.GetComponent<ParticleSystemRenderer>(),
									world.GetVoxelIdFromId(blockId),
								);
							}
						}
						particle.startLifetime = MathUtil.Lerp(0.8, 3, fallDelta);
					}
				}
			}
		});

		// Fun
		const skinColors = [
			ColorUtil.HexToColor("#edcdad"),
			ColorUtil.HexToColor("#f2c291"),
			ColorUtil.HexToColor("#cc9d6a"),
			ColorUtil.HexToColor("#ebbc78"),
			ColorUtil.HexToColor("#f2c27e"),
			ColorUtil.HexToColor("#d69e5e"),
			ColorUtil.HexToColor("#e8bd92"),
		];

		const hairColors = [
			ColorUtil.HexToColor("#aa8866"),
			ColorUtil.HexToColor("#debe99"),
			ColorUtil.HexToColor("#241c11"),
			ColorUtil.HexToColor("#4f1a00"),
			ColorUtil.HexToColor("#9a3300"),
			ColorUtil.HexToColor("#f0ede5"),
			ColorUtil.HexToColor("#b07922"),
			ColorUtil.HexToColor("#e6e6fa"),
			ColorUtil.HexToColor("#2d170e"),
			ColorUtil.HexToColor("#1d1513"),
			ColorUtil.HexToColor("#2c2424"),
			ColorUtil.HexToColor("#aa8866"),
		];
		CoreClientSignals.EntitySpawn.Connect((event) => {
			if (event.entity.IsLocalCharacter()) {
				//Keep local player the default look for now
				return;
			}
			let randomId: number;
			//if (event.entity.player) {
			//randomId = string.byte(event.entity.player.userId)[0];
			//} else {
			randomId = math.random(0, 10000000);
			//}
			let skinColor = skinColors[randomId % skinColors.size()];
			let hairColor = hairColors[randomId % hairColors.size()];
			let shirtColor = hairColors[(randomId * 2) % hairColors.size()];

			//Body Meshes
			Profiler.BeginSample("ColorRandomization");
			event.entity.accessoryBuilder.SetSkinColor(skinColor, false);
			// event.entity.accessoryBuilder.SetAccessoryColor(AccessorySlot.Hair, hairColor, false);
			// event.entity.accessoryBuilder.SetAccessoryColor(AccessorySlot.Shirt, shirtColor, true);
			Profiler.EndSample();
		});
	}

	private DespawnEntity(entity: Entity): void {
		entity.Destroy();
		CoreClientSignals.EntityDespawn.Fire(entity);
		this.entities.delete(entity.id);
	}

	private AddEntity(entityDto: EntityDto): Entity | undefined {
		const nob = NetworkUtil.WaitForNobId(entityDto.nobId);

		nob.gameObject.name = `entity_${entityDto.id}`;
		let entity: Entity;
		if (entityDto.serializer === EntitySerializer.DEFAULT) {
			entity = new Entity(entityDto.id, nob, entityDto.clientId);
		} else if (entityDto.serializer === EntitySerializer.CHARACTER) {
			const characterEntityDto = entityDto as CharacterEntityDto;

			let inv = this.invController.GetInventory(characterEntityDto.invId);
			if (!inv) {
				/*
				 * Inventory hasn't been received by server yet, so we create one on client that will
				 * be used in further updates.
				 */
				inv = new Inventory(characterEntityDto.invId);
				this.invController.RegisterInventory(inv);
			}

			const abilities = characterEntityDto.abilities.mapFiltered((abilityDto) => {
				const ability = this.abilityRegistry.GetAbilityById(abilityDto.id);
				return ability;
			});

			Profiler.BeginSample("CharacterEntity.Constructor");

			entity = new CharacterEntity(entityDto.id, nob, entityDto.clientId, inv, abilities);
			Profiler.EndSample();
		} else {
			error("Unable to find entity serializer for dto: " + entityDto);
		}
		entity.SetHealth(entityDto.health);
		entity.SetMaxHealth(entityDto.maxHealth);
		entity.SetDisplayName(entityDto.displayName);
		if (entityDto.healthbar) {
			Profiler.BeginSample("AddHealthbar");
			entity.AddHealthbar();
			Profiler.EndSample();
		}

		this.entities.set(entity.id, entity);

		if (entity.player) {
			if (entity instanceof CharacterEntity) {
				entity.player.SetCharacter(entity);
			} else {
				print("Failed to set player character because it wasn't a CharacterEntity.");
			}
		}

		Profiler.BeginSample("EntitySpawnSignal");
		CoreClientSignals.EntitySpawn.Fire(new EntitySpawnClientSignal(entity));
		Profiler.EndSample();

		return entity;
	}

	public GetEntityById(entityId: number): Entity | undefined {
		return this.entities.get(entityId);
	}

	public async WaitForId(entityId: number): Promise<Entity | undefined> {
		let existing = this.GetEntityById(entityId);
		if (existing) {
			return existing;
		}
		return new Promise<Entity | undefined>((resolve) => {
			const bin = new Bin();
			bin.Add(
				CoreClientSignals.EntitySpawn.Connect((event) => {
					if (event.entity.id === entityId) {
						bin.Clean();
						resolve(event.entity);
						return;
					}
				}),
			);
		});
	}

	public GetEntityByClientId(clientId: number) {
		return ObjectUtils.values(this.entities).find((e) => e.ClientId === clientId);
	}

	public GetEntityByPlayerId(playerId: number): Entity | undefined {
		return ObjectUtils.values(this.entities).find((e) => e.ClientId === playerId);
	}

	/** Yields until entity that corresponds to `playerId` exists. */
	public WaitForEntityByPlayerId(playerId: number): Entity {
		let entity = ObjectUtils.values(this.entities).find((e) => e.ClientId === playerId);
		if (entity) return entity;
		while (!entity) {
			Task.Wait(0.1);
			entity = ObjectUtils.values(this.entities).find((e) => e.ClientId === playerId);
		}
		return entity;
	}

	public GetEntities(): Entity[] {
		return ObjectUtils.values(this.entities);
	}
}
