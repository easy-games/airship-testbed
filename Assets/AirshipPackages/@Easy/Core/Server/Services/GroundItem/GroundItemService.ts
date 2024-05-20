import { OnStart, Service } from "@Easy/Core/Shared/Flamework";
import Object from "@Easy/Core/Shared/Util/ObjectUtils";
import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreNetwork } from "@Easy/Core/Shared/CoreNetwork";
import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import {
  GroundItem,
  GroundItemData,
} from "@Easy/Core/Shared/GroundItem/GroundItem";
import { GroundItemUtil } from "@Easy/Core/Shared/GroundItem/GroundItemUtil";
import { ItemStack } from "@Easy/Core/Shared/Inventory/ItemStack";
import { Task } from "@Easy/Core/Shared/Util/Task";
import { TimeUtil } from "@Easy/Core/Shared/Util/TimeUtil";

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
  private groundItemsFolder: GameObject;

  constructor() {
    this.groundItemsFolder = GameObject.Create("GroundItemsServer");
    this.groundItemsFolder.transform.SetParent(CoreRefs.rootTransform);
    this.groundItemPrefab = AssetBridge.Instance.LoadAsset(
      "@Easy/Core/Shared/Resources/Prefabs/GroundItem.prefab"
    );
  }

  OnStart(): void {
    CoreNetwork.ClientToServer.DropItemInSlot.server.OnClientEvent(
      (clientId, slot, amount) => {
        // const character = Airship.Characters.FindByClientId(clientId);
        // if (character?.IsAlive() && character instanceof CharacterEntity) {
        // 	const item = character.GetInventory().GetItem(slot);
        // 	if (!item) return;
        // 	if (item.GetAmount() < amount) return;
        // 	const transform = character.model.transform;
        // 	const position = transform.position.add(new Vector3(0, 1.5, 0)).add(transform.forward.mul(0.6));
        // 	let velocity = transform.forward.add(new Vector3(0, 0.7, 0)).mul(6);
        // 	velocity = velocity.add(character.movement.GetVelocity());
        // 	// print("velocity: " + tostring(velocity));
        // 	const beforeEvent = CoreServerSignals.BeforeEntityDropItem.Fire(
        // 		new BeforeEntityDropItemSignal(character, item, velocity),
        // 	);
        // 	if (beforeEvent.IsCancelled()) return;
        // 	item.Decrement(amount);
        // 	const newItem = item.Clone();
        // 	newItem.SetAmount(amount);
        // 	const groundItem = this.SpawnGroundItem(newItem, position, beforeEvent.velocity);
        // 	CoreServerSignals.EntityDropItem.Fire(new EntityDropItemSignal(character, item, groundItem));
        // 	// Sync position when it's done moving
        // 	const stopRepeat = Task.Repeat(0.1, () => {
        // 		if (!this.groundItems.has(groundItem.id)) {
        // 			stopRepeat();
        // 			return;
        // 		}
        // 		if (!groundItem.drop.IsGrounded()) return;
        // 		stopRepeat();
        // 		CoreNetwork.ServerToClient.GroundItem.UpdatePosition.server.FireAllClients([
        // 			{
        // 				id: groundItem.id,
        // 				pos: groundItem.transform.position,
        // 				vel: groundItem.drop.GetVelocity(),
        // 			},
        // 		]);
        // 	});
        // }
      }
    );

    CoreNetwork.ClientToServer.PickupGroundItem.server.OnClientEvent(
      (player, groundItemId) => {
        const groundItem = this.groundItems.get(groundItemId);
        if (!groundItem) return;

        const character = Airship.characters.FindByPlayer(player);
        if (!character?.IsAlive()) return;

        if (
          !GroundItemUtil.CanPickupGroundItem(
            groundItem,
            groundItem.transform.position,
            character.networkObject.gameObject.transform.position
          )
        ) {
          return;
        }

        // CoreServerSignals.EntityPickupItem.Fire({
        // 	entity,
        // 	groundItem: groundItem,
        // });

        // this.RemoveGroundItemFromTracking(groundItem);
        // GameObjectUtil.Destroy(groundItem.rb.gameObject);
        this.DestroyGroundItem(groundItem);

        CoreNetwork.ServerToClient.EntityPickedUpGroundItem.server.FireAllClients(
          character.id,
          groundItem.id
        );
        // if (entity instanceof CharacterEntity) {
        // 	entity.GetInventory().AddItem(groundItem.itemStack);
        // }
      }
    );

    Airship.players.ObservePlayers((player) => {
      CoreNetwork.ServerToClient.GroundItem.Add.server.FireClient(
        player,
        Object.values(this.groundItems).map((i) => {
          return {
            id: i.id,
            itemStack: i.itemStack.Encode(),
            pos: i.transform.position,
            velocity: i.drop.GetVelocity(),
            pickupTime: i.pickupTime,
            data: i.data,
          };
        })
      );
    });

    Task.Repeat(0, () => this.ScanForIdleItems());
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
    const pos = groundItem.transform.position;
    return new Vector3(
      math.round(pos.x / MERGE_POSITION_SIZE) * MERGE_POSITION_SIZE,
      math.round(pos.y / MERGE_POSITION_SIZE) * MERGE_POSITION_SIZE,
      math.round(pos.z / MERGE_POSITION_SIZE) * MERGE_POSITION_SIZE
    );
  }

  private IsGroundItemMoving(groundItem: GroundItem): boolean {
    // return groundItem.rb.velocity.sqrMagnitude > VELOCITY_EPSILON;
    return !groundItem.drop.IsGrounded();
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
          if (
            item.shouldMerge &&
            item.itemStack.CanMerge(groundItem.itemStack)
          ) {
            // Merge
            item.itemStack.SetAmount(
              item.itemStack.GetAmount() + groundItem.itemStack.GetAmount()
            );
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
    GameObjectUtil.Destroy(groundItem.drop.gameObject);
  }

  public SpawnGroundItem(
    itemStack: ItemStack,
    pos: Vector3,
    velocity?: Vector3,
    data?: GroundItemData
  ): GroundItem | undefined {
    if (velocity === undefined) {
      velocity = Vector3.zero;
    }

    const go = GameObjectUtil.InstantiateAt(
      this.groundItemPrefab,
      pos,
      Quaternion.identity
    );
    go.transform.SetParent(this.groundItemsFolder.transform);
    const rb = go.GetComponent<Rigidbody>();
    // rb.velocity = velocity;
    const drop = go.GetComponent<GroundItemDrop>();
    if (!rb || !drop) {
      error("Ground objects must include a rigidbody and groundItemDrop");
    }
    drop.SetVelocity(velocity);
    const id = this.MakeNewID();
    const pickupTime = data !== undefined && "generatorId" in data ? 0.1 : 1;
    const groundItem = new GroundItem(
      id,
      itemStack,
      drop,
      TimeUtil.GetServerTime() + pickupTime,
      data ?? {}
    );
    this.groundItems.set(id, groundItem);

    if (data) {
      if (typeIs(data.Spinning, "boolean")) {
        drop.SetSpinActive(data.Spinning);
      }

      if (typeIs(data.Grounded, "boolean")) {
        drop.SetGrounded(data.Grounded);
      }

      if (typeIs(data.Direction, "vector")) {
        go.transform.LookAt(go.transform.position.add(data.Direction));
      }
    }

    this.movingGroundItems.push(groundItem);

    let destroyWatcher = go.GetComponent<DestroyWatcher>();
    if (!destroyWatcher) {
      error("Ground objects must include a destroy watcher");
    }
    const destroyedConn = destroyWatcher.OnDestroyedEvent(() => {
      this.RemoveGroundItemFromTracking(groundItem);
      this.groundItems.delete(groundItem.id);
      CoreNetwork.ServerToClient.GroundItemDestroyed.server.FireAllClients(
        groundItem.id
      );
    });

    CoreNetwork.ServerToClient.GroundItem.Add.server.FireAllClients([
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
