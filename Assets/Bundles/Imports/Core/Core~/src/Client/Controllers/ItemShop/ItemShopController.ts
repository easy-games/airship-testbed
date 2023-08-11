import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { AudioManager } from "Shared/Audio/AudioManager";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObjectBridge";
import { ItemType } from "Shared/Item/ItemType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { ItemShopMeta, ShopCategory, ShopElement } from "Shared/ItemShop/ItemShopMeta";
import { Network } from "Shared/Network";
import { BedWarsUI } from "Shared/UI/BedWarsUI";
import { AppManager } from "Shared/Util/AppManager";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { Signal } from "Shared/Util/Signal";
import { InventoryController } from "../Inventory/InventoryController";

@Controller({})
export class ItemShopController implements OnStart {
	/** Game object references. See `Shop` prefab. */
	private refs: GameObjectReferences;
	/** Shop canvas. */
	private shopCanvas: Canvas;
	/** Individual shop item prefab. */
	private shopItemPrefab: Object;
	/** Currently selected item. */
	private selectedItem: ShopElement | undefined;
	private selectedItemBin = new Bin();

	private purchaseButton: GameObject;
	private purchaseButtonText: TMP_Text;

	private purchasedTierItems = new Set<ItemType>();

	public OnPurchase = new Signal<ShopElement>();

	constructor() {
		/* Fetch refs. */
		const shopGO = GameObject.Find("Shop");
		this.shopCanvas = shopGO.GetComponent<Canvas>();
		this.shopCanvas.enabled = false;
		this.shopItemPrefab = AssetBridge.LoadAsset("Shared/Resources/Prefabs/GameUI/ShopItem.prefab");
		this.refs = shopGO.GetComponent<GameObjectReferences>();
		this.purchaseButton = this.refs.GetValue("SidebarContainer", "PurchaseButton");
		this.purchaseButtonText = this.refs.GetValue("SidebarContainer", "PurchaseButtonText");
	}

	OnStart(): void {
		this.Init();

		Network.ServerToClient.ItemShop.RemoveTierPurchases.Client.OnServerEvent((itemTypes) => {
			for (const itemType of itemTypes) {
				this.purchasedTierItems.delete(itemType);
			}
		});
	}

	public Open(): void {
		const bin = new Bin();

		this.UpdateItems(false);
		if (this.selectedItem) {
			this.SetSidebarItem(this.selectedItem);
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
		this.SetSidebarItem(defaultItem);
		// Instantiate individual item prefabs underneath relevant category container.
		this.UpdateItems(true);
		// Handle purchase requests.
		const purchaseButton = this.refs.GetValue<GameObject>("SidebarContainer", "PurchaseButton");
		BedWarsUI.SetupButton(purchaseButton);
		CanvasAPI.OnClickEvent(purchaseButton, () => {
			this.HandlePurchaseRequest();
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

			let itemGO = container.transform.FindChild(shopItem.itemType)?.gameObject;
			if (itemGO === undefined) {
				itemGO = GameObjectUtil.InstantiateIn(this.shopItemPrefab, container.transform);
				itemGO.name = shopItem.itemType;
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
				BedWarsUI.SetupButton(itemGO);
				CanvasAPI.OnClickEvent(itemGO, () => {
					this.SetSidebarItem(shopItem);
				});
			}
		});
	}

	private CanPurchase(shopElement: ShopElement): boolean {
		if (!Game.LocalPlayer.Character?.GetInventory().HasEnough(shopElement.currency, shopElement.price)) {
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
	private HandlePurchaseRequest(): void {
		if (!this.selectedItem || !this.CanPurchase(this.selectedItem)) {
			AudioManager.PlayGlobal("UI_Error.wav");
			return;
		}
		const shopItem = this.selectedItem;
		const result = Network.ClientToServer.ItemShop.PurchaseRequest.Client.FireServer(shopItem.itemType);
		if (result) {
			this.purchasedTierItems.add(shopItem.itemType);
			AudioManager.PlayGlobal("ItemShopPurchase.wav");
			this.UpdateItems(false);

			if (shopItem.nextTier) {
				this.SetSidebarItem(ItemShopMeta.GetShopElementFromItemType(shopItem.nextTier)!);
			}
			this.OnPurchase.Fire(shopItem);
		}
	}

	/**
	 * Updates sidebar to reflect selected shop item.
	 * @param shopItem A shop item.
	 */
	private SetSidebarItem(shopItem: ShopElement): void {
		this.selectedItemBin.Clean();

		/* TODO: We should probably fetch and cache these references inside of `OnStart` or the constructor. */
		this.selectedItem = shopItem;
		const selectedItemIcon = this.refs.GetValue<GameObject>("SidebarContainer", "SelectedItemIcon");
		const selectedItemQuantity = this.refs.GetValue<TextMeshProUGUI>("SidebarContainer", "SelectedItemQuantity");
		const selectedItemName = this.refs.GetValue<TextMeshProUGUI>("SidebarContainer", "SelectedItemName");
		const selectedItemCost = this.refs.GetValue<TextMeshProUGUI>("SidebarContainer", "SelectedItemCost");

		CanvasUIBridge.SetSprite(selectedItemIcon, ItemUtil.GetItemRenderPath(shopItem.itemType));
		const itemMeta = ItemUtil.GetItemMeta(shopItem.itemType);
		selectedItemQuantity.text = `x${shopItem.quantity}`;
		selectedItemName.text = itemMeta.displayName;

		const currencyMeta = ItemUtil.GetItemMeta(shopItem.currency);
		selectedItemCost.text = `${shopItem.price} ${currencyMeta.displayName}`;

		const purchaseButtonImage = this.purchaseButton.GetComponent<Image>();

		const updateButton = () => {
			if (shopItem.lockAfterPurchase && this.purchasedTierItems.has(shopItem.itemType)) {
				this.purchaseButtonText.text = "Owned";
				purchaseButtonImage.color = new Color(0.29, 0.31, 0.29);
				return;
			}

			const inv = Game.LocalPlayer.Character?.GetInventory();
			if (inv?.HasEnough(shopItem.currency, shopItem.price)) {
				this.purchaseButtonText.text = "Purchase";
				purchaseButtonImage.color = new Color(0.5, 0.87, 0.63);
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
