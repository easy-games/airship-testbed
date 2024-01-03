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

	private readonly groundItemsFolder: GameObject;
	// private readonly offlineGroundItems: OfflineGroundItems;

	constructor(
		private readonly playerController: PlayerController,
		private readonly entityAccessoryController: EntityAccessoryController,
	) {
		// this.groundItemsFolder = GameObject.Create("GroundItems");
		this.groundItemsFolder = GameObjectUtil.Instantiate(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/GroundItems.prefab"),
		);
		// this.offlineGroundItems = this.groundItemsFolder.GetComponent<OfflineGroundItems>();
		this.groundItemPrefab = AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/GroundItem.prefab");
		// PoolManager.PreLoadPool(this.groundItemPrefab, 4);
		this.fallbackDisplayObj = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Shared/Resources/Prefabs/GroundItems/_fallback.prefab",
		);

		ItemUtil.WaitForInitialized().then(() => {
			for (const itemType of ItemUtil.GetItemTypes()) {
				const itemMeta = ItemUtil.GetItemDef(itemType);
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

	private CreateDisplayGO(itemStack: ItemStack, parent: Transform, displayOffset: Vector3): GameObject {
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
		displayGO.transform.localPosition = displayOffset;
		return displayGO;
	}

	// private readonly groundItemPool: GameObject[] = [];
	OnStart(): void {
		CoreNetwork.ServerToClient.GroundItem.Add.client.OnServerEvent(async (dtos) => {
			// print("Received " + dtos.size() + " ground items.");
			if (WorldAPI.GetMainWorld()) {
				await WorldAPI.GetMainWorld()!.WaitForFinishedLoading();
			}
			for (const dto of dtos) {
				const itemStack = ItemStack.Decode(dto.itemStack);

				let go = undefined; //this.groundItemPool.pop();
				if (!go) {
					go = PoolManager.SpawnObject(this.groundItemPrefab, dto.pos, Quaternion.identity);
					const displayGO = this.CreateDisplayGO(
						itemStack,
						go.transform.GetChild(0),
						dto.data.LocalOffset || new Vector3(0, 0.5, 0),
					);
					go.transform.SetParent(this.groundItemsFolder.transform);
					// this.offlineGroundItems.AddObject(go);

					const bin = new Bin();
					const destroyedConn = go.GetComponent<DestroyWatcher>().OnDestroyedEvent(() => {
						this.groundItems.delete(groundItem.id);
						bin.Clean();
					});

					bin.Add(() => {
						Bridge.DisconnectEvent(destroyedConn);
					});
				}

				const data = dto.data;

				const drop = go.GetComponent<GroundItemDrop>();

				drop.SetVelocity(dto.velocity);
				const groundItem = new GroundItem(dto.id, itemStack, drop, TimeUtil.GetServerTime() + 1.2, dto.data);

				if (typeIs(data.Spinning, "boolean")) {
					drop.SetSpinActive(data.Spinning);

					// Reset rotation of pooled item
					if (!data.Spinning) {
						go.transform.GetChild(0).transform.rotation = Quaternion.identity;
					}
				}

				if (typeIs(data.Grounded, "boolean")) {
					drop.SetGrounded(data.Grounded);
				}

				if (typeIs(data.Direction, "vector")) {
					go.transform.LookAt(go.transform.position.add(data.Direction));
				}

				this.groundItems.set(dto.id, groundItem);
			}
		});

		CoreNetwork.ServerToClient.GroundItem.UpdatePosition.client.OnServerEvent((dtos) => {
			for (const dto of dtos) {
				const groundItem = this.groundItems.get(dto.id);
				if (groundItem) {
					groundItem.drop.SetPosition(dto.pos);
				}
			}
		});

		// Pickup when nearbys
		SetInterval(0.1, () => {
			const characterPos = Game.localPlayer.character?.gameObject.transform.position;
			if (!characterPos) return;

			let toPickup: GroundItem[] = [];
			for (let pair of this.groundItems) {
				if (!GroundItemUtil.CanPickupGroundItem(pair[1], pair[1].transform.position, characterPos)) continue;
				toPickup.push(pair[1]);
			}

			toPickup = toPickup.sort((a, b) => {
				return a.transform.position.Distance(characterPos) < b.transform.position.Distance(characterPos);
			});

			for (let groundItem of toPickup) {
				CoreNetwork.ClientToServer.PickupGroundItem.client.FireServer(groundItem.id);
			}
		});

		CoreNetwork.ServerToClient.EntityPickedUpGroundItem.client.OnServerEvent((entityId, groundItemId) => {
			const groundItem = this.groundItems.get(groundItemId);
			if (!groundItem) {
				return;
			}

			const entity = Entity.FindById(entityId);
			if (entity) {
				CoreClientSignals.EntityPickupItem.Fire({ entity, groundItem });
			}

			const go = groundItem.drop.gameObject;
			// this.groundItemPool.push(go);
			// go.GetComponent<ParentSetter>().ClearParent();
			// go.SetActive(false);
			go.transform.GetChild(0).gameObject.ClearChildren();
			PoolManager.ReleaseObject(go);
			this.groundItems.delete(groundItemId);
			// this.offlineGroundItems.RemoveObject(go);
		});

		CoreNetwork.ServerToClient.GroundItemDestroyed.client.OnServerEvent((groundItemId) => {
			const groundItem = this.groundItems.get(groundItemId);
			if (!groundItem) {
				return;
			}

			const go = groundItem.drop.gameObject;
			// this.groundItemPool.push(go);
			// go.GetComponent<ParentSetter>().ClearParent();
			// go.SetActive(false);
			go.transform.GetChild(0).gameObject.ClearChildren();
			PoolManager.ReleaseObject(go);
			this.groundItems.delete(groundItemId);
			// this.offlineGroundItems.RemoveObject(go);
		});
	}
}
