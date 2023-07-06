import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { Game } from "Shared/Game";
import { GameObjectBridge } from "Shared/GameObjectBridge";
import { GetItemMeta } from "Shared/Item/ItemDefinitions";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Network } from "Shared/Network";
import { DEFAULT_BEDWARS_SHOP, ShopCategory, ShopItem } from "Shared/Shop/ShopMeta";
import { BedWarsUI } from "Shared/UI/BedWarsUI";
import { AppManager } from "Shared/Util/AppManager";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { SoundUtil } from "Shared/Util/SoundUtil";
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
	private selectedItem: ShopItem | undefined;
	private selectedItemBin = new Bin();

	private purchaseButton: GameObject;
	private purchaseButtonText: TMP_Text;

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
	}

	public Open(): void {
		const bin = new Bin();

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
		const shopItems = DEFAULT_BEDWARS_SHOP.shopItems;
		/* Default sidebar to _first_ item in default shop array.. */
		const defaultItem = shopItems[0];
		this.SetSidebarItem(defaultItem);
		/* Instantiate individual item prefabs underneath relevant category container. */
		DEFAULT_BEDWARS_SHOP.shopItems.forEach((shopItem) => {
			const container = this.GetCategoryContainer(shopItem.category);
			if (container) {
				const itemElement = GameObjectBridge.InstantiateIn(this.shopItemPrefab, container.transform);
				const imageElement = itemElement.transform.GetChild(0).gameObject;
				CanvasUIBridge.SetSprite(imageElement, ItemUtil.GetItemRenderPath(shopItem.item));

				BedWarsUI.SetupButton(itemElement);
				CanvasAPI.OnClickEvent(itemElement, () => {
					this.SetSidebarItem(shopItem);
				});
			}
		});
		/* Handle purchase requests. */
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

	/** Sends purchase request to server for currently selected item. */
	private HandlePurchaseRequest(): void {
		if (!this.selectedItem) return;
		const result = Network.ClientToServer.Shop.PurchaseRequest.Client.FireServer(this.selectedItem);
		if (result) {
			SoundUtil.PlayGlobal("ItemShopPurchase.wav");
		}
	}

	/**
	 * Updates sidebar to reflect selected shop item.
	 * @param shopItem A shop item.
	 */
	private SetSidebarItem(shopItem: ShopItem): void {
		this.selectedItemBin.Clean();

		/* TODO: We should probably fetch and cache these references inside of `OnStart` or the constructor. */
		this.selectedItem = shopItem;
		const selectedItemIcon = this.refs.GetValue<GameObject>("SidebarContainer", "SelectedItemIcon");
		const selectedItemQuantity = this.refs.GetValue<TextMeshProUGUI>("SidebarContainer", "SelectedItemQuantity");
		const selectedItemName = this.refs.GetValue<TextMeshProUGUI>("SidebarContainer", "SelectedItemName");
		const selectedItemCost = this.refs.GetValue<TextMeshProUGUI>("SidebarContainer", "SelectedItemCost");

		CanvasUIBridge.SetSprite(selectedItemIcon, ItemUtil.GetItemRenderPath(shopItem.item));
		const itemMeta = GetItemMeta(shopItem.item);
		selectedItemQuantity.text = `x${shopItem.quantity}`;
		selectedItemName.text = itemMeta.displayName;
		selectedItemCost.text = `${shopItem.price} ${shopItem.currency}`;

		const purchaseButtonImage = this.purchaseButton.GetComponent<Image>();

		const updateHasEnough = () => {
			const inv = Game.LocalPlayer.Character?.GetInventory();
			if (inv?.HasEnough(shopItem.currency, shopItem.price)) {
				this.purchaseButtonText.text = "Purchase";
				purchaseButtonImage.color = new Color(0.5, 0.87, 0.63);
			} else {
				this.purchaseButtonText.text = "Not Enough";
				purchaseButtonImage.color = new Color(0.62, 0.2, 0.24);
			}
		};
		updateHasEnough();

		this.selectedItemBin.Add(
			Dependency<InventoryController>().ObserveLocalInventory((inv) => {
				this.selectedItemBin.Add(
					inv.SlotChanged.Connect((slot, itemStack) => {
						if (itemStack) {
							this.selectedItemBin.Add(
								itemStack?.Changed.Connect(() => {
									updateHasEnough();
								}),
							);
						}
					}),
				);
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
