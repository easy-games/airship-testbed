import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import ObjectUtil from "@easy-games/unity-object-utils";
import { ServerSignals } from "Server/ServerSignals";
import { EntitySpawnEvent } from "Server/Signals/EntitySpawnServerEvent";
import { MoveCommandDataEvent } from "Server/Signals/MoveCommandDataEvent";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { GameObjectUtil } from "Shared/GameObjectBridge";
import { Network } from "Shared/Network";
import { Player } from "Shared/Player/Player";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { EntityPrefabType } from "../../../Entity/EntityPrefabType";
import { ChatService } from "../Chat/ChatService";
import { InventoryService } from "../Inventory/InventoryService";
import { PlayerService } from "../Player/PlayerService";
import { EntityCommand } from "./EntityCommand";

@Service({})
export class EntityService implements OnStart {
	private idCounter = 1;
	private entities = new Map<number, Entity>();
	private loadedEntityPrefabs = new Map<EntityPrefabType, Object>();

	constructor(private readonly invService: InventoryService, private readonly chatService: ChatService) {
		this.chatService.RegisterCommand(new EntityCommand());
	}

	OnStart(): void {
		const playerService = Dependency<PlayerService>();
		playerService.ObservePlayers((player) => {
			for (let entity of ObjectUtil.values(this.entities)) {
				if (entity instanceof CharacterEntity) {
					const invDto = entity.GetInventory().Encode();
					Network.ServerToClient.UpdateInventory.Server.FireClient(player.clientId, invDto);
				}
			}
			const dto = ObjectUtil.values(this.entities).map((e) => e.Encode());
			Network.ServerToClient.SpawnEntities.Server.FireClient(player.clientId, dto);

			return () => {
				if (player.Character) {
					this.DespawnEntity(player.Character);
				}
			};
		}, SignalPriority.HIGHEST);
		ServerSignals.PlayerLeave.connect((event) => {
			if (event.player.Character) {
				this.DespawnEntity(event.player.Character);
			}
		});
	}

	public SpawnEntityForPlayer(
		player: Player | undefined,
		entityPrefabType: EntityPrefabType,
		pos?: Vector3,
		onDestroyed?: () => void,
	): Entity {
		const id = this.idCounter;
		this.idCounter++;

		const beforeEvent = ServerSignals.BeforeEntitySpawn.fire(id, player, pos ?? new Vector3(0, 0, 0));

		// Spawn character game object
		let entityPrefab: Object;
		if (this.loadedEntityPrefabs.has(entityPrefabType)) {
			entityPrefab = this.loadedEntityPrefabs.get(entityPrefabType)!;
		} else {
			entityPrefab = AssetBridge.LoadAsset(entityPrefabType);
			if (!entityPrefab) {
				throw "failed to find entity prefab: " + entityPrefabType;
			}
			this.loadedEntityPrefabs.set(entityPrefabType, entityPrefab);
		}
		const entityGO = GameObjectUtil.InstantiateAt(entityPrefab, beforeEvent.spawnPosition, Quaternion.identity);
		entityGO.name = `entity_${id}`;

		const entityModelGO = entityGO.transform.Find("EntityModel");

		const destroyWatcher = entityGO.AddComponent("DestroyWatcher") as DestroyWatcher;
		destroyWatcher.OnDestroyedEvent(() => {
			if (onDestroyed !== undefined) {
				onDestroyed();
			}
		});
		if (player) {
			NetworkUtil.SpawnWithClientOwnership(entityGO, player.clientId);
		} else {
			NetworkUtil.Spawn(entityGO);
		}

		const nob = entityGO.GetComponent("NetworkObject") as NetworkObject;

		const inv = this.invService.MakeInventory();
		if (player) {
			this.invService.Subscribe(player.clientId, inv, true);
		}
		const entity = new CharacterEntity(id, nob, player?.clientId, inv);
		this.entities.set(id, entity);
		if (player) {
			player.SetCharacter(entity);
		}

		// Spawn character model
		// entity.SpawnCharacterModel(characterDef);

		const entityDriver = entityGO.GetComponent<EntityDriver>();

		// Custom move command data handling:
		entityDriver.OnDispatchCustomData((tick, customData) => {
			const allData = customData.Decode() as { key: unknown; value: unknown }[];
			for (const data of allData) {
				const moveEvent = new MoveCommandDataEvent(player?.clientId ?? -1, tick, data.key, data.value);
				ServerSignals.CustomMoveCommand.Fire(moveEvent);
			}
		});

		// fire SpawnEntities after so the initial entity packet has all the latest info.
		ServerSignals.EntitySpawn.Fire(new EntitySpawnEvent(entity));

		Network.ServerToClient.SpawnEntities.Server.FireAllClients([entity.Encode()]);
		Network.ServerToClient.UpdateInventory.Server.FireAllClients(entity.GetInventory().Encode());
		entity.GetInventory().StartNetworkingDiffs();

		return entity;
	}

	public DespawnEntity(entity: Entity): void {
		ServerSignals.EntityDespawn.Fire(entity);
		entity.Destroy();
		this.entities.delete(entity.id);
	}

	public GetEntityById(entityId: number): Entity | undefined {
		return this.entities.get(entityId);
	}

	public GetEntityByClientId(clientId: number) {
		return ObjectUtil.values(this.entities).find((e) => e.ClientId === clientId);
	}

	public GetEntities(): Entity[] {
		return ObjectUtil.values(this.entities);
	}
}
