import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { InventoryController } from "@Easy/Core/Client/Controllers/Inventory/InventoryController";
import { AudioManager } from "@Easy/Core/Shared/Audio/AudioManager";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { Game } from "@Easy/Core/Shared/Game";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { ItemType } from "@Easy/Core/Shared/Item/ItemType";
import { ItemUtil } from "@Easy/Core/Shared/Item/ItemUtil";
import { CoreUI } from "@Easy/Core/Shared/UI/CoreUI";
import { AppManager } from "@Easy/Core/Shared/Util/AppManager";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerButton } from "@Easy/Core/Shared/Util/CanvasAPI";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { SetInterval, SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { ItemShopMeta, ShopCategory, ShopElement } from "Shared/ItemShop/ItemShopMeta";
import { Network } from "Shared/Network";

@Controller({})
export class ItemShopController implements OnStart {
	/** Game object references. See `Shop` prefab. */
	private refs: GameObjectReferences;
	/** Shop canvas. */
	private shopCanvas: Canvas;
	/** Individual shop item prefab. */
	private shopItemPrefab: Object;
	/** Currently selected item. */
	private selectedShopElement: ShopElement | undefined;
	private selectedItemBin = new Bin();

	private purchaseButton: GameObject;
	private purchaseButtonText: TMP_Text;

	private purchasedTierItems = new Set<ItemType>();

	public OnPurchase = new Signal<ShopElement>();

	private itemPurchasePopupPrefab: GameObject;
	private purchaseButtonEnabled = false;

	constructor() {
		/* Fetch refs. */
		const shopGO = GameObject.Find("Shop");
		this.shopCanvas = shopGO.GetComponent<Canvas>();
		this.shopCanvas.enabled = false;
		this.shopItemPrefab = AssetBridge.Instance.LoadAsset("Shared/Resources/Prefabs/GameUI/ShopItem.prefab");
		this.refs = shopGO.GetComponent<GameObjectReferences>();
		this.purchaseButton = this.refs.GetValue("SidebarContainer", "PurchaseButton");
		this.purchaseButtonText = this.refs.GetValue("SidebarContainer", "PurchaseButtonText");

		this.itemPurchasePopupPrefab = AssetBridge.Instance.LoadAsset(
			"Shared/Resources/Prefabs/ItemPurchasePopup.prefab",
		);
	}

	OnStart(): void {
		this.Init();

		Network.ServerToClient.ItemShop.RemoveTierPurchases.Client.OnServerEvent((itemTypes) => {
			for (const itemType of itemTypes) {
				this.purchasedTierItems.delete(itemType);
			}
		});

		Network.ServerToClient.ItemShop.ItemPurchased.Client.OnServerEvent((entityId, itemType) => {
			const entity = Entity.FindById(entityId);
			if (!entity) return;
			if (entity.IsLocalCharacter()) return;

			const pos = entity.GetHeadPosition().add(new Vector3(0, 0.7, 0));
			const go = PoolManager.SpawnObject(this.itemPurchasePopupPrefab, pos, Quaternion.identity);
			const image = go.transform.GetChild(0).GetChild(0).GetComponent<Image>();
			CanvasUIBridge.SetSprite(image.gameObject, ItemUtil.GetItemRenderPath(itemType));
			const canvasGroup = go.transform.GetChild(0).GetComponent<CanvasGroup>();
			canvasGroup.alpha = 1;
			SetTimeout(0.4, () => {
				canvasGroup.TweenCanvasGroupAlpha(0, 0.1);
			});
			go.transform.TweenLocalPosition(pos.add(new Vector3(0, 0.5, 0)), 0.5).SetEase(EaseType.QuadOut);

			AudioManager.PlayAtPosition(
				"@Easy/Core/Shared/Resources/Sound/ItemShopPurchase.wav",
				entity.GetMiddlePosition(),
				{
					volumeScale: 0.3,
					rollOffMode: AudioRolloffMode.Linear,
					maxDistance: 10,
				},
			);
		});
	}

	public Open(): void {
		const bin = new Bin();

		this.UpdateItems(false);
		if (this.selectedShopElement) {
			this.SetSidebarItem(this.selectedShopElement, true);
		}

		if (Game.LocalPlayer.character) {
			const startingPos = Game.LocalPlayer.character.model.transform.position;
			bin.Add(
				SetInterval(0.1, () => {
					if (Game.LocalPlayer.character) {
						if (startingPos.sub(Game.LocalPlayer.character.model.transform.position).magnitude >= 1) {
							AppManager.Close();
						}
					}
				}),
			);
		}

		AppManager.Open(this.shopCanvas, {
			onClose: () => {
				bin.Clean();
				this.selectedItemBin.Clean();
			},
		});
	}

	private Init(): void {
		const shopItems = ItemShopMeta.defaultItems.shopItems;
		// Default sidebar to _first_ item in default shop array..
		const defaultItem = shopItems[0];
		this.SetSidebarItem(defaultItem, true);
		// Instantiate individual item prefabs underneath relevant category container.
		this.UpdateItems(true);
		// Handle purchase requests.
		const purchaseButton = this.refs.GetValue<GameObject>("SidebarContainer", "PurchaseButton");
		CoreUI.SetupButton(purchaseButton);
		CanvasAPI.OnClickEvent(purchaseButton, () => {
			if (this.selectedShopElement) {
				this.SendPurchaseRequest(this.selectedShopElement);
			}
		});
		/**
		 *	CanvasEventAPI.OnHoverEvent(purchaseButton, (hoverState) => {
		 *		if (hoverState === HoverState.ENTER) print("Entering button!");
		 *		if (hoverState === HoverState.EXIT) print("Exiting button!");
		 *	});
		 */
	}

	private UpdateItems(init: boolean): void {
		ItemShopMeta.defaultItems.shopItems.forEach((shopItem) => {
			let shown = true;
			if (shopItem.prevTier && !this.purchasedTierItems.has(shopItem.prevTier)) {
				shown = false;
			} else if (shopItem.nextTier && this.purchasedTierItems.has(shopItem.itemType)) {
				shown = false;
			}

			const container = this.GetCategoryContainer(shopItem.category);
			if (!container) {
				warn(`Failed to find container "${shopItem.category}" for shop item "${shopItem.itemType}"`);
				return;
			}

			const itemMeta = ItemUtil.GetItemMeta(shopItem.itemType);
			let itemGO = container.transform.FindChild("id_" + itemMeta.id)?.gameObject;
			if (itemGO === undefined) {
				itemGO = GameObjectUtil.InstantiateIn(this.shopItemPrefab, container.transform);
				itemGO.name = "id_" + itemMeta.id;
			}
			CanvasUIBridge.SetSprite(
				itemGO.transform.GetChild(0).gameObject,
				ItemUtil.GetItemRenderPath(shopItem.itemType),
			);

			if (shown) {
				itemGO.SetActive(true);
			} else {
				itemGO.SetActive(false);
			}

			if (init) {
				CoreUI.SetupButton(itemGO);
				let lastClick = 0;
				CanvasAPI.OnClickEvent(itemGO, () => {
					if (this.selectedShopElement === shopItem && Time.time - lastClick < 0.3) {
						lastClick = Time.time;
						this.SendPurchaseRequest(shopItem);
						return;
					}
					lastClick = Time.time;
					if (this.selectedShopElement !== shopItem) {
						this.SetSidebarItem(shopItem);
					}
				});
				CanvasAPI.OnPointerEvent(itemGO, (direction, button) => {
					if (button === PointerButton.RIGHT) {
						this.SendPurchaseRequest(shopItem);
					}
				});
			}
		});
	}

	private CanPurchase(shopElement: ShopElement): boolean {
		if (!Game.LocalPlayer.character?.GetInventory().HasEnough(shopElement.currency, shopElement.price)) {
			return false;
		}
		if (shopElement.lockAfterPurchase && this.purchasedTierItems.has(shopElement.itemType)) {
			return false;
		}
		return true;
	}

	/**
	 * Sends purchase request to server for currently selected item.
	 */
	private SendPurchaseRequest(shopElement: ShopElement): void {
		if (!shopElement || !this.CanPurchase(shopElement) || !this.purchaseButtonEnabled) {
			AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/UI_Error.wav", {
				volumeScale: 0.5,
			});
			return;
		}
		const result = Network.ClientToServer.ItemShop.PurchaseRequest.Client.FireServer(shopElement.itemType);
		if (result) {
			this.purchasedTierItems.add(shopElement.itemType);
			AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/ItemShopPurchase.wav", {
				volumeScale: 0.2,
			});
			this.UpdateItems(false);

			if (shopElement.nextTier) {
				this.SetSidebarItem(ItemShopMeta.GetShopElementFromItemType(shopElement.nextTier)!);
			}
			this.OnPurchase.Fire(shopElement);
		}
	}

	/**
	 * Updates sidebar to reflect selected shop item.
	 * @param shopItem A shop item.
	 */
	private SetSidebarItem(shopItem: ShopElement, noEffect = false): void {
		this.selectedItemBin.Clean();

		/* TODO: We should probably fetch and cache these references inside of `OnStart` or the constructor. */
		this.selectedShopElement = shopItem;
		const selectedItemIcon = this.refs.GetValue<GameObject>("SidebarContainer", "SelectedItemIcon");
		const selectedItemQuantity = this.refs.GetValue<TextMeshProUGUI>("SidebarContainer", "SelectedItemQuantity");
		const selectedItemName = this.refs.GetValue<TextMeshProUGUI>("SidebarContainer", "SelectedItemName");
		const selectedItemCost = this.refs.GetValue<TextMeshProUGUI>("SidebarContainer", "SelectedItemCost");

		CanvasUIBridge.SetSprite(selectedItemIcon, ItemUtil.GetItemRenderPath(shopItem.itemType));
		const itemMeta = ItemUtil.GetItemMeta(shopItem.itemType);
		selectedItemQuantity.text = `x${shopItem.quantity}`;
		selectedItemName.text = itemMeta.displayName;

		if (!noEffect) {
			const itemRect = selectedItemIcon.GetComponent<RectTransform>();
			itemRect.TweenLocalScale(new Vector3(0.9, 1.23, 1), 0.05).SetPingPong();
		}

		const currencyMeta = ItemUtil.GetItemMeta(shopItem.currency);
		selectedItemCost.text = `${shopItem.price} ${currencyMeta.displayName}`;

		if (shopItem.currency === ItemType.EMERALD) {
			selectedItemCost.color = Theme.Green;
		} else if (shopItem.currency === ItemType.DIAMOND) {
			selectedItemCost.color = Theme.Aqua;
		} else {
			selectedItemCost.color = Theme.White;
		}

		const purchaseButtonImage = this.purchaseButton.GetComponent<Image>();

		const updateButton = () => {
			this.purchaseButtonEnabled = false;
			const inv = Game.LocalPlayer.character?.GetInventory();

			if (shopItem.lockAfterPurchase && this.purchasedTierItems.has(shopItem.itemType)) {
				this.purchaseButtonText.text = "Owned";
				purchaseButtonImage.color = new Color(0.29, 0.31, 0.29);
				return;
			}

			if (
				shopItem.preventPurchasingIfAlreadyOwned &&
				inv?.FindSlotWithItemType(shopItem.itemType) !== undefined
			) {
				this.purchaseButtonText.text = "Owned";
				purchaseButtonImage.color = new Color(0.29, 0.31, 0.29);
				return;
			}

			if (inv?.HasEnough(shopItem.currency, shopItem.price)) {
				this.purchaseButtonText.text = "Purchase";
				purchaseButtonImage.color = new Color(0.5, 0.87, 0.63);
				this.purchaseButtonEnabled = true;
			} else {
				this.purchaseButtonText.text = "Not Enough";
				purchaseButtonImage.color = new Color(0.62, 0.2, 0.24);
			}
		};
		updateButton();

		this.selectedItemBin.Add(
			Dependency<InventoryController>().ObserveLocalInventory((inv) => {
				this.selectedItemBin.Add(
					inv.SlotChanged.Connect((slot, itemStack) => {
						if (itemStack) {
							updateButton();
							this.selectedItemBin.Add(
								itemStack?.Changed.Connect(() => {
									updateButton();
								}),
							);
						}
					}),
				);
			}),
		);

		this.selectedItemBin.Add(
			this.OnPurchase.Connect((shopItem) => {
				if (shopItem.lockAfterPurchase) {
					updateButton();
				}
			}),
		);
	}

	/**
	 * Fetch container for a provided shop category.
	 * @param category A shop category.
	 * @returns Canvas panel container that corresponds to category if present.
	 */
	private GetCategoryContainer(category: ShopCategory): GameObject | undefined {
		let container: GameObject | undefined;
		switch (category) {
			case ShopCategory.BLOCKS:
				container = this.refs.GetValue("ContentContainer", "BlockSection");
				break;
			case ShopCategory.COMBAT:
				container = this.refs.GetValue("ContentContainer", "CombatSection");
				break;
			case ShopCategory.TOOLS:
				container = this.refs.GetValue("ContentContainer", "ToolSection");
				break;
		}
		return container;
	}
}
