import { Controller, OnStart } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { EntitySpawnClientSignal } from "Client/Signals/EntitySpawnClientEvent";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity, CharacterEntityDto } from "Shared/Entity/Character/CharacterEntity";
import { Entity, EntityDto } from "Shared/Entity/Entity";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { EntitySerializer } from "Shared/Entity/EntitySerializer";
import { Inventory } from "Shared/Inventory/Inventory";
import { Bin } from "Shared/Util/Bin";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { Task } from "Shared/Util/Task";
import { InventoryController } from "../Inventory/InventoryController";
import { PlayerController } from "../Player/PlayerController";

@Controller({})
export class EntityController implements OnStart {
	private entities = new Map<number, Entity>();

	constructor(
		private readonly invController: InventoryController,
		private readonly playerController: PlayerController,
	) {
		const humanEntityPrefab = AssetBridge.Instance.LoadAsset<GameObject>(
			EntityPrefabType.HUMAN,
		).GetComponent<NetworkObject>();
		const airshipPool = InstanceFinder.NetworkManager.ObjectPool as AirshipObjectPool;
		airshipPool.SlowlyCacheObjects(humanEntityPrefab, 100);
	}

	OnStart(): void {
		CoreNetwork.ServerToClient.SpawnEntities.Client.OnServerEvent((entityDtos) => {
			entityDtos.forEach((entityDto) => {
				try {
					this.AddEntity(entityDto);
				} catch (err) {
					error("[FATAL]: Failed to add entity:" + err);
				}
			});
		});
		CoreNetwork.ServerToClient.DespawnEntity.Client.OnServerEvent((entityId) => {
			const entity = this.GetEntityById(entityId);
			if (entity) {
				this.DespawnEntity(entity);
			}
		});
		CoreNetwork.ServerToClient.PlayEntityItemAnimation.Client.OnServerEvent((entityId, animationId, playMode) => {
			const entity = this.GetEntityById(entityId);
			if (!entity) return;

			entity.anim?.PlayItemUse(animationId, playMode);
		});

		CoreNetwork.ServerToClient.Entity.SetHealth.Client.OnServerEvent((entityId, health) => {
			const entity = this.GetEntityById(entityId);
			if (entity) {
				entity.SetHealth(health);
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

		// Fun
		const skinColors = [
			ColorUtil.HexToColor("#CAA075"),
			ColorUtil.HexToColor("#A4784B"),
			ColorUtil.HexToColor("#735638"),
			ColorUtil.HexToColor("#B4905B"),
			ColorUtil.HexToColor("#E09E53"),
			ColorUtil.HexToColor("#875C2C"),
			ColorUtil.HexToColor("#9AA427"), // green
			ColorUtil.HexToColor("#90684C"),
		];
		CoreClientSignals.EntitySpawn.Connect((event) => {
			let randomId: number;
			if (event.entity.player) {
				randomId = string.byte(event.entity.player.userId)[0];
			} else {
				randomId = math.random(0, 10000000);
			}
			let index = randomId % skinColors.size();
			let skinColor = skinColors[index];
			const thirdPersonMat = event.entity.model.transform.GetChild(1).GetComponent<MaterialColor>();
			const firstPersonMat = event.entity.model.transform.GetChild(2).GetComponent<MaterialColor>();

			thirdPersonMat.SetMaterialColor(0, skinColor);
			thirdPersonMat.DoUpdate();
			firstPersonMat.SetMaterialColor(0, skinColor);
			firstPersonMat.DoUpdate();
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

			entity = new CharacterEntity(entityDto.id, nob, entityDto.clientId, inv);
		} else {
			error("Unable to find entity serializer for dto: " + entityDto);
		}
		entity.SetHealth(entityDto.health);
		entity.SetMaxHealth(entityDto.maxHealth);
		entity.SetDisplayName(entityDto.displayName);
		if (entityDto.healthbar) {
			entity.AddHealthbar();
		}

		this.entities.set(entity.id, entity);

		if (entity.player) {
			if (entity instanceof CharacterEntity) {
				entity.player.SetCharacter(entity);
			} else {
				print("Failed to set player character because it wasn't a CharacterEntity.");
			}
		}

		CoreClientSignals.EntitySpawn.Fire(new EntitySpawnClientSignal(entity));

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
		return Object.values(this.entities).find((e) => e.ClientId === clientId);
	}

	public GetEntityByPlayerId(playerId: number): Entity | undefined {
		return Object.values(this.entities).find((e) => e.ClientId === playerId);
	}

	/** Yields until entity that corresponds to `playerId` exists. */
	public WaitForEntityByPlayerId(playerId: number): Entity {
		let entity = Object.values(this.entities).find((e) => e.ClientId === playerId);
		if (entity) return entity;
		while (!entity) {
			Task.Wait(0.1);
			entity = Object.values(this.entities).find((e) => e.ClientId === playerId);
		}
		return entity;
	}

	public GetEntities(): Entity[] {
		return Object.values(this.entities);
	}
}
