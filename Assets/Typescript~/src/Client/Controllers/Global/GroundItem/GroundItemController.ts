import { Controller, OnStart } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { ClientSignals } from "Client/ClientSignals";
import { PlayerController } from "Client/Controllers/Global/Player/PlayerController";
import { Entity } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { GameObjectBridge } from "Shared/GameObjectBridge";
import { GroundItemUtil } from "Shared/GroundItem/GroundItemUtil";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { Network } from "Shared/Network";
import { Bin } from "Shared/Util/Bin";
import { WaitForNobId } from "Shared/Util/NetworkUtil";
import { OnUpdate, SetInterval } from "Shared/Util/Timer";
import { EntityAccessoryController } from "../Accessory/EntityAccessoryController";

interface GroundItemEntry {
	nob: NetworkObject;
	itemStack: ItemStack;
}

@Controller({})
export class GroundItemController implements OnStart {
	private fallbackDisplayObj: Object;
	private groundItems = new Map<number, GroundItemEntry>();
	private itemTypeToDisplayObjMap = new Map<ItemType, Object>();

	constructor(
		private readonly playerController: PlayerController,
		private readonly entityAccessoryController: EntityAccessoryController,
	) {
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
		if (!obj) {
			const accessory = this.entityAccessoryController.GetFirstAccessoryForItemType(itemStack.GetItemType());
			obj = accessory.Prefab;
		}
		const displayGO = GameObjectBridge.InstantiateIn(obj, parent);
		// displayGO.transform.localScale = new Vector3(0.5, 0.5, 0.5);
		displayGO.transform.localPosition = new Vector3(0, 0.5, 0);
		return displayGO;
	}

	OnStart(): void {
		Network.ServerToClient.AddGroundItem.Client.OnServerEvent((groundItemGOID, itemStackDto) => {
			const itemStack = ItemStack.Decode(itemStackDto);

			const groundItemNob = WaitForNobId(groundItemGOID);

			this.groundItems.set(groundItemGOID, {
				nob: groundItemNob,
				itemStack,
			});

			const displayGO = this.CreateDisplayGO(itemStack, groundItemNob.transform.GetChild(0));

			const bin = new Bin();
			bin.Add(
				OnUpdate.Connect((dt) => {
					displayGO.transform.Rotate(new Vector3(0, 360, 0).mul(dt * 0.3));
				}),
			);
			groundItemNob.GetComponent<DestroyWatcher>().OnDestroyedEvent(() => {
				this.groundItems.delete(groundItemGOID);
				bin.Clean();
			});
		});

		// Pickup when nearbys
		SetInterval(0.1, () => {
			const pawnPos = Game.LocalPlayer.Character?.gameObject.transform.position;
			if (!pawnPos) return;

			let toPickup: GroundItemEntry[] = [];
			for (let pair of this.groundItems) {
				if (!GroundItemUtil.CanPickupGroundItem(pair[1].itemStack, pair[1].nob, pawnPos)) continue;
				toPickup.push(pair[1]);
			}

			toPickup = toPickup.sort((a, b) => {
				return (
					a.nob.gameObject.transform.position.Distance(pawnPos) <
					b.nob.gameObject.transform.position.Distance(pawnPos)
				);
			});

			for (let entry of toPickup) {
				Network.ClientToServer.PickupGroundItem.Client.FireServer(entry.nob.ObjectId);
			}
		});

		Network.ServerToClient.EntityPickedUpGroundItem.Client.OnServerEvent((entityId, itemType) => {
			const entity = Entity.FindById(entityId);
			if (entity) {
				ClientSignals.EntityPickupItem.Fire({ entity, itemType });
			}
		});
	}
}
