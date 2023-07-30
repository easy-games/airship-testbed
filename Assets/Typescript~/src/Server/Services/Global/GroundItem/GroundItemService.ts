import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { ServerSignals } from "Server/ServerSignals";
import { BeforeEntityDropItemSignal } from "Server/Signals/BeforeEntityDropItemSignal";
import { EntityDropItemSignal } from "Server/Signals/EntityDropItemSignal";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { GameObjectUtil } from "Shared/GameObjectBridge";
import { GroundItem } from "Shared/GroundItem/GroundItem";
import { GroundItemUtil } from "Shared/GroundItem/GroundItemUtil";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Network } from "Shared/Network";
import { Task } from "Shared/Util/Task";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { EntityService } from "../Entity/EntityService";
import { PlayerService } from "../Player/PlayerService";

@Service({})
export class GroundItemService implements OnStart {
	private groundItemPrefab: Object;
	private groundItems = new Map<number, GroundItem>();
	private idCounter = 0;

	constructor(private readonly entityService: EntityService) {
		this.groundItemPrefab = AssetBridge.LoadAsset("Shared/Resources/Prefabs/GroundItem.prefab");
	}

	OnStart(): void {
		Network.ClientToServer.DropItemInHand.Server.OnClientEvent((clientId, amount) => {
			const entity = this.entityService.GetEntityByClientId(clientId);
			if (entity?.IsAlive() && entity instanceof CharacterEntity) {
				const item = entity.GetInventory().GetHeldItem();
				if (!item) return;

				const transform = entity.model.transform;
				const position = transform.position.add(new Vector3(0, 1.8, 0)).add(transform.forward.mul(0.6));
				let impulse = transform.forward.add(new Vector3(0, 0.4, 0));
				impulse = impulse.mul(10);
				print("impulse: " + tostring(impulse));

				const beforeEvent = ServerSignals.BeforeEntityDropItem.Fire(
					new BeforeEntityDropItemSignal(entity, item, impulse),
				);
				if (beforeEvent.IsCancelled()) return;

				item.Decrement(1);
				const newItem = item.Clone();
				newItem.SetAmount(1);

				const groundItem = this.SpawnGroundItem(newItem, position, beforeEvent.force);

				ServerSignals.EntityDropItem.Fire(new EntityDropItemSignal(entity, item, groundItem));

				// Sync position when it's done moving
				Task.Delay(1.5, () => {
					if (this.groundItems.has(groundItem.id)) {
						Network.ServerToClient.GroundItem.UpdatePosition.Server.FireAllClients([
							{ id: groundItem.id, pos: groundItem.rb.position, vel: groundItem.rb.velocity },
						]);
					}
				});
			}
		});

		Network.ClientToServer.PickupGroundItem.Server.OnClientEvent((clientId, groundItemId) => {
			const groundItem = this.groundItems.get(groundItemId);
			if (!groundItem) return;

			const entity = this.entityService.GetEntityByClientId(clientId);
			if (!entity?.IsAlive()) return;

			if (
				!GroundItemUtil.CanPickupGroundItem(
					groundItem,
					groundItem.rb.position,
					entity.networkObject.gameObject.transform.position,
				)
			) {
				return;
			}

			ServerSignals.EntityPickupItem.Fire({
				entity,
				groundItem: groundItem,
			});

			this.groundItems.delete(groundItem.id);
			Network.ServerToClient.EntityPickedUpGroundItem.Server.FireAllClients(entity.id, groundItem.id);
			if (entity instanceof CharacterEntity) {
				entity.GetInventory().AddItem(groundItem.itemStack);
			}
		});

		Dependency<PlayerService>().ObservePlayers((player) => {
			print("GroundItemService");
			Network.ServerToClient.GroundItem.Add.Server.FireClient(
				player.clientId,
				Object.values(this.groundItems).map((i) => {
					return {
						id: i.id,
						itemStack: i.itemStack.Encode(),
						pos: i.rb.position,
						velocity: i.rb.velocity,
						pickupTime: i.pickupTime,
						data: i.data,
					};
				}),
			);
		});
	}

	public SpawnGroundItem(
		itemStack: ItemStack,
		pos: Vector3,
		velocity?: Vector3,
		data?: Record<string, unknown>,
	): GroundItem {
		if (velocity === undefined) {
			velocity = new Vector3(0, 1, 0);
		}

		const go = GameObjectUtil.InstantiateAt(this.groundItemPrefab, pos, Quaternion.identity);
		const rb = go.GetComponent<Rigidbody>();
		rb.velocity = velocity;
		const id = this.MakeNewID();
		const groundItem = new GroundItem(id, itemStack, rb, TimeUtil.GetServerTime() + 1.2, data ?? {});
		this.groundItems.set(id, groundItem);

		Network.ServerToClient.GroundItem.Add.Server.FireAllClients([
			{
				id: groundItem.id,
				itemStack: groundItem.itemStack.Encode(),
				pos: pos,
				velocity: velocity,
				pickupTime: groundItem.pickupTime,
				data: groundItem.data,
			},
		]);

		return groundItem;
	}

	private MakeNewID(): number {
		const id = this.idCounter;
		this.idCounter++;
		return id;
	}
}
