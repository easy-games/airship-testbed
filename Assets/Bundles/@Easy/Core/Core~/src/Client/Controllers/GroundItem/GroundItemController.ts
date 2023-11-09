import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Entity } from "Shared/Entity/Entity";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { GroundItem } from "Shared/GroundItem/GroundItem";
import { GroundItemUtil } from "Shared/GroundItem/GroundItemUtil";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Bin } from "Shared/Util/Bin";
import { TimeUtil } from "Shared/Util/TimeUtil";
import { SetInterval } from "Shared/Util/Timer";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { EntityAccessoryController } from "../Accessory/EntityAccessoryController";
import { PlayerController } from "../Player/PlayerController";

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
	private groundItemsFolder: GameObject;

	constructor(
		private readonly playerController: PlayerController,
		private readonly entityAccessoryController: EntityAccessoryController,
	) {
		this.groundItemsFolder = GameObject.Create("GroundItems");
		this.groundItemPrefab = AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/GroundItem.prefab");
		this.fallbackDisplayObj = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Shared/Resources/Prefabs/GroundItems/_fallback.prefab",
		);

		ItemUtil.WaitForInitialized().then(() => {
			for (const itemType of ItemUtil.GetItemTypes()) {
				const itemMeta = ItemUtil.GetItemMeta(itemType);
				let obj: Object | undefined;
				if (itemMeta.groundItemPrefab) {
					obj = AssetBridge.Instance.LoadAssetIfExists<Object>(itemMeta.groundItemPrefab);
				}
				if (obj) {
					this.itemTypeToDisplayObjMap.set(itemType, obj);
				}
			}
		});
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
			displayGO.transform.localScale = accessory.Scale.add(new Vector3(1, 1, 1));
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
		CoreNetwork.ServerToClient.GroundItem.Add.Client.OnServerEvent(async (dtos) => {
			// print("Received " + dtos.size() + " ground items.");
			if (WorldAPI.GetMainWorld()) {
				await WorldAPI.GetMainWorld()!.WaitForFinishedLoading();
			}
			for (const dto of dtos) {
				const itemStack = ItemStack.Decode(dto.itemStack);
				const go = GameObjectUtil.InstantiateAt(this.groundItemPrefab, dto.pos, Quaternion.identity);
				go.transform.SetParent(this.groundItemsFolder.transform);
				const rb = go.GetComponent<Rigidbody>();
				rb.velocity = dto.velocity;
				const groundItem = new GroundItem(dto.id, itemStack, rb, TimeUtil.GetServerTime() + 1.2, dto.data);
				this.groundItems.set(dto.id, groundItem);

				const displayGO = this.CreateDisplayGO(itemStack, go.transform.GetChild(0));

				const bin = new Bin();
				const destroyedConn = go.GetComponent<DestroyWatcher>().OnDestroyedEvent(() => {
					this.groundItems.delete(groundItem.id);
					bin.Clean();
				});
				bin.Add(() => {
					Bridge.DisconnectEvent(destroyedConn);
				});
			}
		});

		CoreNetwork.ServerToClient.GroundItem.UpdatePosition.Client.OnServerEvent((dtos) => {
			for (const dto of dtos) {
				const groundItem = this.groundItems.get(dto.id);
				if (groundItem) {
					groundItem.rb.position = dto.pos;
				}
			}
		});

		// Pickup when nearbys
		SetInterval(0.1, () => {
			const characterPos = Game.LocalPlayer.character?.gameObject.transform.position;
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
				CoreNetwork.ClientToServer.PickupGroundItem.Client.FireServer(groundItem.id);
			}
		});

		CoreNetwork.ServerToClient.EntityPickedUpGroundItem.Client.OnServerEvent((entityId, groundItemId) => {
			const groundItem = this.groundItems.get(groundItemId);
			if (!groundItem) {
				return;
			}

			const entity = Entity.FindById(entityId);
			if (entity) {
				CoreClientSignals.EntityPickupItem.Fire({ entity, groundItem });
			}

			GameObjectUtil.Destroy(groundItem.rb.gameObject);
			this.groundItems.delete(groundItemId);
		});

		CoreNetwork.ServerToClient.GroundItemDestroyed.Client.OnServerEvent((groundItemId) => {
			const groundItem = this.groundItems.get(groundItemId);
			if (!groundItem) {
				return;
			}

			GameObjectUtil.Destroy(groundItem.rb.gameObject);
			this.groundItems.delete(groundItemId);
		});
	}
}
