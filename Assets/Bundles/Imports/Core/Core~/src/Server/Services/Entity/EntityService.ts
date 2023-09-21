import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import ObjectUtil from "@easy-games/unity-object-utils";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { BeforeEntitySpawnServerEvent } from "Server/Signals/BeforeEntitySpawnServerEvent";
import { EntitySpawnEvent } from "Server/Signals/EntitySpawnServerEvent";
import { MoveCommandDataEvent } from "Server/Signals/MoveCommandDataEvent";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Entity } from "Shared/Entity/Entity";
import { EntityPrefabType } from "Shared/Entity/EntityPrefabType";
import { Player } from "Shared/Player/Player";
import { NetworkUtil } from "Shared/Util/NetworkUtil";
import { SignalPriority } from "Shared/Util/Signal";
import { ChatService } from "../Chat/ChatService";
import { EntityCommand } from "../Chat/Commands/EntityCommand";
import { InventoryService } from "../Inventory/InventoryService";
import { PlayerService } from "../Player/PlayerService";

@Service({})
export class EntityService implements OnStart {
	private idCounter = 1;
	private entities = new Map<number, Entity>();
	private loadedEntityPrefabs = new Map<EntityPrefabType, NetworkObject>();
	private airshipPool = GameObject.Find("Network").GetComponent<AirshipObjectPool>();

	constructor(private readonly invService: InventoryService, private readonly chatService: ChatService) {
		this.chatService.RegisterCommand(new EntityCommand());

		const humanEntityPrefab = this.GetEntityPrefab(EntityPrefabType.HUMAN);
		this.airshipPool.SlowlyCacheObjects(humanEntityPrefab, 100);
	}

	OnStart(): void {
		const playerService = Dependency<PlayerService>();
		playerService.ObservePlayers((player) => {
			for (let entity of ObjectUtil.values(this.entities)) {
				if (entity instanceof CharacterEntity) {
					const invDto = entity.GetInventory().Encode();
					CoreNetwork.ServerToClient.UpdateInventory.Server.FireClient(player.clientId, invDto);
				}
			}
			const dto = ObjectUtil.values(this.entities).map((e) => e.Encode());
			CoreNetwork.ServerToClient.SpawnEntities.Server.FireClient(player.clientId, dto);

			return () => {
				if (player.Character) {
					this.DespawnEntity(player.Character);
				}
			};
		}, SignalPriority.HIGHEST);
		CoreServerSignals.PlayerLeave.Connect((event) => {
			if (event.player.Character) {
				this.DespawnEntity(event.player.Character);
			}
		});
	}

	public GetEntityPrefab(entityPrefabType: EntityPrefabType): NetworkObject {
		let entityPrefab: NetworkObject;
		if (this.loadedEntityPrefabs.has(entityPrefabType)) {
			entityPrefab = this.loadedEntityPrefabs.get(entityPrefabType)!;
		} else {
			entityPrefab = AssetBridge.Instance.LoadAsset<GameObject>(entityPrefabType).GetComponent<NetworkObject>();
			this.loadedEntityPrefabs.set(entityPrefabType, entityPrefab);
		}
		return entityPrefab;
	}

	public SpawnEntityForPlayer(player: Player | undefined, entityPrefabType: EntityPrefabType, pos?: Vector3): Entity {
		const id = this.idCounter;
		this.idCounter++;

		const beforeEvent = CoreServerSignals.BeforeEntitySpawn.Fire(
			new BeforeEntitySpawnServerEvent(id, player, pos ?? new Vector3(0, 0, 0)),
		);

		// Spawn character game object
		let entityPrefab = this.GetEntityPrefab(entityPrefabType);
		const entityNob = InstanceFinder.NetworkManager.GetPooledInstantiated(
			entityPrefab,
			entityPrefab.SpawnableCollectionId,
			true,
		);
		const entityGO = entityNob.gameObject;
		const entityTransform = entityGO.transform;
		entityTransform.position = beforeEvent.spawnPosition;
		// const entityGO = PoolManager.SpawnObject(entityPrefab, beforeEvent.spawnPosition, Quaternion.identity);
		entityGO.name = `entity_${id}`;
		if (player) {
			NetworkUtil.SpawnWithClientOwnership(entityGO, player.clientId);
		} else {
			NetworkUtil.Spawn(entityGO);
		}

		// const entityDriver = entityGO.GetComponent<EntityDriver>();
		const inv = this.invService.MakeInventory();
		if (player) {
			this.invService.Subscribe(player.clientId, inv, true);
		}
		const entity = new CharacterEntity(id, entityNob, player?.clientId, inv);
		this.entities.set(id, entity);
		if (player) {
			player.SetCharacter(entity);
		}

		// Custom move command data handling:
		const customDataConn = entity.entityDriver.OnDispatchCustomData((tick, customData) => {
			const allData = customData.Decode() as { key: unknown; value: unknown }[];
			for (const data of allData) {
				const moveEvent = new MoveCommandDataEvent(player?.clientId ?? -1, tick, data.key, data.value);
				CoreServerSignals.CustomMoveCommand.Fire(moveEvent);
			}
		});
		entity.GetBin().Add(() => {
			Bridge.DisconnectEvent(customDataConn);
		});

		// fire SpawnEntities after so the initial entity packet has all the latest info.
		CoreServerSignals.EntitySpawn.Fire(new EntitySpawnEvent(entity));

		CoreNetwork.ServerToClient.SpawnEntities.Server.FireAllClients([entity.Encode()]);
		CoreNetwork.ServerToClient.UpdateInventory.Server.FireAllClients(entity.GetInventory().Encode());
		entity.GetInventory().StartNetworkingDiffs();

		return entity;
	}

	public DespawnEntity(entity: Entity): void {
		CoreServerSignals.EntityDespawn.Fire(entity);
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
