import { Dependency, OnStart, Service } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { CoreServerSignals } from "Server/CoreServerSignals";
import { BeforeEntityDropItemSignal } from "Server/Signals/BeforeEntityDropItemSignal";
import { EntityDropItemSignal } from "Server/Signals/EntityDropItemSignal";
import { CoreNetwork } from "Shared/CoreNetwork";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { GroundItem } from "Shared/GroundItem/GroundItem";
import { GroundItemUtil } from "Shared/GroundItem/GroundItemUtil";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { Task } from "Shared/Util/Task";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { EntityService } from "../Entity/EntityService";
import { PlayerService } from "../Player/PlayerService";

// Position of items are rounded to a multiple of this number,
// and are merged if they share the same rounded position:
const MERGE_POSITION_SIZE = 1;

const VELOCITY_EPSILON = 0.001;

@Service({})
export class GroundItemService implements OnStart {
	private groundItemPrefab: Object;
	private groundItems = new Map<number, GroundItem>();
	private idCounter = 0;

	private movingGroundItems = new Array<GroundItem>();
	private removeMovingGroundItems = new Array<GroundItem>();
	private idleGroundItemsByPosition = new Map<Vector3, GroundItem[]>();

	constructor(private readonly entityService: EntityService) {
		this.groundItemPrefab = AssetBridge.Instance.LoadAsset(
			"Imports/Core/Shared/Resources/Prefabs/GroundItem.prefab",
		);
	}

	OnStart(): void {
		CoreNetwork.ClientToServer.DropItemInHand.Server.OnClientEvent((clientId, amount) => {
			const entity = this.entityService.GetEntityByClientId(clientId);
			if (entity?.IsAlive() && entity instanceof CharacterEntity) {
				const item = entity.GetInventory().GetHeldItem();
				if (!item) return;

				const transform = entity.model.transform;
				const position = transform.position.add(new Vector3(0, 1.5, 0)).add(transform.forward.mul(0.6));
				let velocity = transform.forward.add(new Vector3(0, 0.7, 0));
				velocity = velocity.mul(4);
				print("velocity: " + tostring(velocity));

				const beforeEvent = CoreServerSignals.BeforeEntityDropItem.Fire(
					new BeforeEntityDropItemSignal(entity, item, velocity),
				);
				if (beforeEvent.IsCancelled()) return;

				item.Decrement(1);
				const newItem = item.Clone();
				newItem.SetAmount(1);

				const groundItem = this.SpawnGroundItem(newItem, position, beforeEvent.velocity);

				CoreServerSignals.EntityDropItem.Fire(new EntityDropItemSignal(entity, item, groundItem));

				// Sync position when it's done moving
				Task.Delay(1.5, () => {
					if (this.groundItems.has(groundItem.id)) {
						CoreNetwork.ServerToClient.GroundItem.UpdatePosition.Server.FireAllClients([
							{ id: groundItem.id, pos: groundItem.rb.position, vel: groundItem.rb.velocity },
						]);
					}
				});
			}
		});

		CoreNetwork.ClientToServer.PickupGroundItem.Server.OnClientEvent((clientId, groundItemId) => {
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

			CoreServerSignals.EntityPickupItem.Fire({
				entity,
				groundItem: groundItem,
			});

			this.RemoveGroundItemFromTracking(groundItem);

			CoreNetwork.ServerToClient.EntityPickedUpGroundItem.Server.FireAllClients(entity.id, groundItem.id);
			if (entity instanceof CharacterEntity) {
				entity.GetInventory().AddItem(groundItem.itemStack);
			}
		});

		Dependency<PlayerService>().ObservePlayers((player) => {
			CoreNetwork.ServerToClient.GroundItem.Add.Server.FireClient(
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

		Task.Repeat(1, () => this.ScanForIdleItems());
	}

	private RemoveGroundItemFromTracking(groundItem: GroundItem) {
		this.groundItems.delete(groundItem.id);

		const key = this.GetGroundItemPositionKey(groundItem);
		const items = this.idleGroundItemsByPosition.get(key);
		if (items) {
			const itemsIdx = items.indexOf(groundItem);
			if (itemsIdx !== -1) {
				items.unorderedRemove(itemsIdx);
			}
		}

		const movingIdx = this.movingGroundItems.indexOf(groundItem);
		if (movingIdx !== -1) {
			this.movingGroundItems.unorderedRemove(movingIdx);
		}
	}

	private GetGroundItemPositionKey(groundItem: GroundItem): Vector3 {
		const pos = groundItem.rb.position;
		return new Vector3(
			math.round(pos.x / MERGE_POSITION_SIZE) * MERGE_POSITION_SIZE,
			math.round(pos.y / MERGE_POSITION_SIZE) * MERGE_POSITION_SIZE,
			math.round(pos.z / MERGE_POSITION_SIZE) * MERGE_POSITION_SIZE,
		);
	}

	private IsGroundItemMoving(groundItem: GroundItem): boolean {
		return groundItem.rb.velocity.sqrMagnitude > VELOCITY_EPSILON;
	}

	private ScanForIdleItems() {
		// Find ground items that are now idle:
		for (const groundItem of this.movingGroundItems) {
			if (this.IsGroundItemMoving(groundItem)) continue;

			this.removeMovingGroundItems.push(groundItem);

			const posKey = this.GetGroundItemPositionKey(groundItem);
			let itemsAtPos = this.idleGroundItemsByPosition.get(posKey);
			if (itemsAtPos === undefined) {
				itemsAtPos = [groundItem];
				this.idleGroundItemsByPosition.set(posKey, itemsAtPos);
			} else {
				// See if it can merge with anything:
				let didMerge = false;
				for (const item of itemsAtPos) {
					if (item.itemStack.CanMerge(groundItem.itemStack)) {
						// Merge
						item.itemStack.SetAmount(item.itemStack.GetAmount() + groundItem.itemStack.GetAmount());
						didMerge = true;
						this.DestroyGroundItem(groundItem);
						break;
					}
				}

				if (!didMerge) {
					itemsAtPos.push(groundItem);
				}
			}
		}

		// Remove idle ground items from the 'movingGroundItems' list:
		if (this.removeMovingGroundItems.size() > 0) {
			for (const groundItem of this.removeMovingGroundItems) {
				const idx = this.movingGroundItems.indexOf(groundItem);
				if (idx === -1) continue;
				this.movingGroundItems.unorderedRemove(idx);
			}
			this.removeMovingGroundItems.clear();
		}
	}

	public DestroyGroundItem(groundItem: GroundItem): void {
		this.RemoveGroundItemFromTracking(groundItem);
		CoreNetwork.ServerToClient.GroundItemDestroyed.Server.FireAllClients(groundItem.id);
	}

	public SpawnGroundItem(
		itemStack: ItemStack,
		pos: Vector3,
		velocity?: Vector3,
		data?: Record<string, unknown>,
	): GroundItem {
		if (velocity === undefined) {
			velocity = Vector3.up;
		}

		const go = GameObjectUtil.InstantiateAt(this.groundItemPrefab, pos, Quaternion.identity);
		const rb = go.GetComponent<Rigidbody>();
		rb.velocity = velocity;
		const id = this.MakeNewID();
		const groundItem = new GroundItem(id, itemStack, rb, TimeUtil.GetServerTime() + 1.2, data ?? {});
		this.groundItems.set(id, groundItem);
		this.movingGroundItems.push(groundItem);

		CoreNetwork.ServerToClient.GroundItem.Add.Server.FireAllClients([
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
