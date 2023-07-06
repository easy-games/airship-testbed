import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import { ServerSignals } from "Server/ServerSignals";
import { BeforeEntityDropItemSignal } from "Server/Signals/BeforeEntityDropItemSignal";
import { EntityDropItemSignal } from "Server/Signals/EntityDropItemSignal";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { GameObjectBridge } from "Shared/GameObjectBridge";
import { GroundItemUtil } from "Shared/GroundItem/GroundItemUtil";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Network } from "Shared/Network";
import { NetworkBridge } from "Shared/NetworkBridge";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { EntityService } from "../Entity/EntityService";
import { PlayerService } from "../Player/PlayerService";

interface GroundItemEntry {
	nob: NetworkObject;
	itemStack: ItemStack;
}

@Service({})
export class GroundItemService implements OnStart {
	private groundItemPrefab: Object;
	private groundItems = new Map<number, GroundItemEntry>();

	constructor(private readonly entityService: EntityService) {
		this.groundItemPrefab = AssetBridge.LoadAsset("Shared/Resources/Prefabs/GroundItem.prefab");
	}

	OnStart(): void {
		Network.ClientToServer.DropItemInHand.Server.OnClientEvent((clientId, amount) => {
			const entity = this.entityService.GetEntityByClientId(clientId);
			if (entity?.IsAlive() && entity instanceof CharacterEntity) {
				const item = entity.GetInventory().GetHeldItem();
				if (!item) return;

				const transform = entity.networkObject.gameObject.transform;
				const position = transform.position.add(new Vector3(0, 1.8, 0)).add(transform.forward.mul(0.6));
				let force = transform.forward.add(new Vector3(0, 0.4, 0)).mul(2.9);

				const beforeEvent = ServerSignals.BeforeEntityDropItem.Fire(
					new BeforeEntityDropItemSignal(entity, item, force),
				);
				if (beforeEvent.IsCancelled()) return;

				item.Decrement(1);
				const newItem = item.Clone();
				newItem.SetAmount(1);

				const groundItemGO = this.SpawnGroundItem(newItem, position, force);

				ServerSignals.EntityDropItem.Fire(new EntityDropItemSignal(entity, item, groundItemGO));
			}
		});

		Network.ClientToServer.PickupGroundItem.Server.OnClientEvent((clientId, groundItemId) => {
			const groundItemEntry = this.groundItems.get(groundItemId);
			if (!groundItemEntry) return;

			const entity = this.entityService.GetEntityByClientId(clientId);
			if (!entity?.IsAlive()) return;

			if (
				!GroundItemUtil.CanPickupGroundItem(
					groundItemEntry.itemStack,
					groundItemEntry.nob,
					entity.networkObject.gameObject.transform.position,
				)
			) {
				return;
			}

			const groundObjectAttributes = groundItemEntry.nob.gameObject.GetComponent<EasyAttributes>();
			const generatorId = groundObjectAttributes.GetString("generatorId");
			if (generatorId) {
				ServerSignals.GeneratorItemPickedUp.Fire({ pickupEntity: entity, generatorId: generatorId });
			}

			ServerSignals.EntityPickupItem.Fire({
				entity,
				itemStack: groundItemEntry.itemStack,
				groundItemGO: groundItemEntry.nob.gameObject,
			});

			this.groundItems.delete(groundItemEntry.nob.ObjectId);
			NetworkBridge.Despawn(groundItemEntry.nob.gameObject);

			if (entity instanceof CharacterEntity) {
				entity.GetInventory().AddItem(groundItemEntry.itemStack);
			}
			Network.ServerToClient.EntityPickedUpGroundItem.Server.FireAllClients(
				entity.id,
				groundItemEntry.itemStack.GetItemType(),
			);
		});

		Dependency<PlayerService>().ObservePlayers((player) => {
			print("GroundItemService");
			for (let pair of this.groundItems) {
				Network.ServerToClient.AddGroundItem.Server.FireClient(
					player.clientId,
					pair[0],
					pair[1].itemStack.Encode(),
				);
			}
		});
	}

	public SpawnGroundItem(itemStack: ItemStack, pos: Vector3, impulse?: Vector3, generatorId?: string): GameObject {
		if (impulse === undefined) {
			impulse = new Vector3(0, 1, 0);
		}

		const groundItemGO = GameObjectBridge.InstantiateAt(this.groundItemPrefab, pos, Quaternion.identity);
		const nob = groundItemGO.GetComponent<NetworkObject>();

		const attributes = groundItemGO.GetComponent<EasyAttributes>();

		if (!generatorId) {
			attributes.SetAttribute("pickupTime", TimeUtil.GetServerTime() + 1.5);
		} else {
			attributes.SetAttribute("generatorId", generatorId);
		}

		NetworkBridge.Spawn(groundItemGO);

		this.groundItems.set(nob.ObjectId, {
			nob,
			itemStack,
		});

		// enable for server
		groundItemGO.GetComponent<MeshRenderer>().enabled = true;

		const rb = groundItemGO.GetComponent<Rigidbody>();
		rb.AddForce(impulse, ForceMode.Impulse);

		Network.ServerToClient.AddGroundItem.Server.FireAllClients(nob.ObjectId, itemStack.Encode());

		return groundItemGO;
	}
}
