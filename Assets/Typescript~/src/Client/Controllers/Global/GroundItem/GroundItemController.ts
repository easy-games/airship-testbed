import { Controller, OnStart } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { ClientSignals } from "Client/ClientSignals";
import { PlayerController } from "Client/Controllers/Global/Player/PlayerController";
import { Entity } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObjectBridge";
import { GroundItem } from "Shared/GroundItem/GroundItem";
import { GroundItemUtil } from "Shared/GroundItem/GroundItemUtil";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { Network } from "Shared/Network";
import { Bin } from "Shared/Util/Bin";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { SetInterval } from "Shared/Util/Timer";
import { ItemUtil } from "../../../../Shared/Item/ItemUtil";
import { EntityAccessoryController } from "../Accessory/EntityAccessoryController";

interface GroundItemEntry {
	nob: NetworkObject;
	itemStack: ItemStack;
}

@Controller({})
export class GroundItemController implements OnStart {
	private groundItemPrefab: Object;
	private fallbackDisplayObj: Object;
	private groundItems = new Map<number, GroundItem>();
	private itemTypeToDisplayObjMap = new Map<ItemType, Object>();

	constructor(
		private readonly playerController: PlayerController,
		private readonly entityAccessoryController: EntityAccessoryController,
	) {
		this.groundItemPrefab = AssetBridge.LoadAsset("Shared/Resources/Prefabs/GroundItem.prefab");
		this.fallbackDisplayObj = AssetBridge.LoadAsset("Shared/Resources/Prefabs/GroundItems/_fallback.prefab");

		for (const itemType of Object.values(ItemType)) {
			const obj = AssetBridge.LoadAssetIfExists<Object>(
				`Shared/Resources/Prefabs/GroundItems/${itemType.lower()}.prefab`,
			);
			if (obj) {
				this.itemTypeToDisplayObjMap.set(itemType, obj);
			}
		}
	}

	private CreateDisplayGO(itemStack: ItemStack, parent: Transform): GameObject {
		let obj = this.itemTypeToDisplayObjMap.get(itemStack.GetItemType());
		let accessory: Accessory | undefined;
		if (!obj) {
			const acc = ItemUtil.GetFirstAccessoryForItemType(itemStack.GetItemType());
			obj = acc.Prefab;
			accessory = acc;
		}
		const displayGO = GameObjectUtil.InstantiateIn(obj, parent);
		if (accessory) {
			displayGO.transform.localScale = accessory.Scale.mul(2);
			displayGO.transform.localRotation = Quaternion.Euler(
				accessory.Rotation.x,
				accessory.Rotation.y,
				accessory.Rotation.z,
			);
		}
		displayGO.transform.localPosition = new Vector3(0, 0.5, 0);
		return displayGO;
	}

	OnStart(): void {
		Network.ServerToClient.GroundItem.Add.Client.OnServerEvent((dtos) => {
			for (const dto of dtos) {
				const itemStack = ItemStack.Decode(dto.itemStack);
				const go = GameObjectUtil.InstantiateAt(this.groundItemPrefab, dto.pos, Quaternion.identity);
				const rb = go.GetComponent<Rigidbody>();
				rb.velocity = dto.velocity;
				const groundItem = new GroundItem(dto.id, itemStack, rb, TimeUtil.GetServerTime() + 1.2, dto.data);
				this.groundItems.set(dto.id, groundItem);

				const displayGO = this.CreateDisplayGO(itemStack, go.transform.GetChild(0));

				const bin = new Bin();
				go.GetComponent<DestroyWatcher>().OnDestroyedEvent(() => {
					this.groundItems.delete(groundItem.id);
					bin.Clean();
				});
			}
		});

		// Pickup when nearbys
		SetInterval(0.1, () => {
			const characterPos = Game.LocalPlayer.Character?.gameObject.transform.position;
			if (!characterPos) return;

			let toPickup: GroundItem[] = [];
			for (let pair of this.groundItems) {
				if (!GroundItemUtil.CanPickupGroundItem(pair[1], pair[1].rb.position, characterPos)) continue;
				toPickup.push(pair[1]);
			}

			toPickup = toPickup.sort((a, b) => {
				return a.rb.position.Distance(characterPos) < b.rb.transform.position.Distance(characterPos);
			});

			for (let groundItem of toPickup) {
				Network.ClientToServer.PickupGroundItem.Client.FireServer(groundItem.id);
			}
		});

		Network.ServerToClient.EntityPickedUpGroundItem.Client.OnServerEvent((entityId, groundItemId) => {
			const groundItem = this.groundItems.get(groundItemId);
			if (!groundItem) {
				return;
			}

			const entity = Entity.FindById(entityId);
			if (entity) {
				ClientSignals.EntityPickupItem.Fire({ entity, groundItem });
			}

			GameObjectUtil.Destroy(groundItem.rb.gameObject);
			this.groundItems.delete(groundItemId);
		});
	}
}
