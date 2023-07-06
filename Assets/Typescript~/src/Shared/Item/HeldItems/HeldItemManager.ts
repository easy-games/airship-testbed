import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Global/Character/LocalEntityController";
import { CharacterEntity } from "../../Entity/Character/CharacterEntity";
import { items } from "../ItemDefinitions";
import { ItemMeta } from "../ItemMeta";
import { ItemType } from "../ItemType";
import { BlockHeldItem } from "./BlockPlacement/BlockHeldItem";
import { BreakBlockHeldItem } from "./BlockPlacement/BreakBlockHeldItem";
import { MeleeHeldItem } from "./Damagers/MeleeHeldItem";
import { HeldItem } from "./HeldItem";
import { ProjectileLauncherHeldItem } from "./ProjectileLauncher/ProjectileLauncherHeldItem";

export enum HeldItemState {
	NONE = -1,
	CALL_TO_ACTION_START = 0,
	CALL_TO_ACTION_END = 1,
	ON_DESTROY,
}

//One item manager per entity, calls functionality on currently equipped item for that entity
export class HeldItemManager {
	private entity: CharacterEntity;
	private heldItemMap = new Map<ItemType, HeldItem>();
	private currentHeldItem: HeldItem;
	private currentItemState: HeldItemState = HeldItemState.NONE;

	public GetLabel() {
		return this.entity.id;
	}

	private Log(message: string) {
		return;
		print("Entity " + this.entity.id + " " + message);
	}

	private GetOrCreateHeldItem(meta?: ItemMeta) {
		if (meta === undefined) {
			meta = items[ItemType.DEFAULT] as ItemMeta;
		}
		let item = this.heldItemMap.get(meta.ItemType);
		if (item === undefined) {
			//Create the held item instance
			let itemType = "NONE";
			this.Log("Creating Held Item...");
			if (meta.melee) {
				itemType = "MELEE";
				item = new MeleeHeldItem(this.entity, meta);
			} else if (meta.block) {
				itemType = "BLOCK";
				item = new BlockHeldItem(this.entity, meta);
			} else if (meta.breakBlock) {
				itemType = "BREAK BLOCK";
				item = new BreakBlockHeldItem(this.entity, meta);
			} else if (meta.ProjectileLauncher) {
				itemType = "PROJECTILE LAUNCHER";
				item = new ProjectileLauncherHeldItem(this.entity, meta);
			} else {
				warn("Entity " + this.entity.id + " " + meta.displayName + " resorting to default held item logic");
				item = new HeldItem(this.entity, meta);
			}
			this.Log("creating Held Item: " + meta.displayName + " of type: " + itemType);
			this.heldItemMap.set(meta.ItemType, item);
		}
		return item;
	}

	constructor(entity: CharacterEntity) {
		this.entity = entity;
		this.Log("Creating Held Items");
		this.currentHeldItem = this.GetOrCreateHeldItem();

		//Listen for item switches
		this.entity.GetInventory().ObserveHeldItem((itemStack) => {
			this.Log("is equipping anew item: " + itemStack?.GetMeta().displayName);
			//UnEquip last item
			if (this.currentHeldItem !== undefined) {
				this.currentHeldItem.OnUnEquip();
			}
			//Equip the new item
			this.currentItemState = HeldItemState.NONE;
			this.currentHeldItem = this.GetOrCreateHeldItem(itemStack?.GetMeta());
			this.currentHeldItem.OnEquip();
		});
	}

	//LOCAL CLIENT ONLY
	public TriggerNewState(itemState: HeldItemState) {
		//Notify server of new State
		// Dependency<LocalEntityController>().AddToMoveData("HeldItemState", itemState);
		Dependency<LocalEntityController>().AddToMoveData("HeldItemState", {
			entityId: this.entity.id,
			state: itemState,
		});
		// Network.ClientToServer.SetHeldItemState.Client.FireServer(this.entity.id, itemState);

		//Handle the state locally
		this.OnNewState(itemState);
	}

	public OnNewState(itemState: HeldItemState) {
		this.Log("New State: " + itemState);
		if (this.currentItemState === itemState) {
			return;
		}
		if (this.currentHeldItem === undefined) {
			error("Trying to interact without any held item!");
			return;
		}
		this.currentItemState = itemState;
		switch (itemState) {
			case HeldItemState.CALL_TO_ACTION_START:
				this.currentHeldItem.OnCallToActionStart();
				break;
			case HeldItemState.CALL_TO_ACTION_END:
				this.currentHeldItem.OnCallToActionEnd();
				break;
			case HeldItemState.ON_DESTROY:
				//When destroyed un equip so any logic can clean itself up
				this.currentHeldItem.OnUnEquip();
				//Fill current held item with default item
				this.currentHeldItem = this.GetOrCreateHeldItem();
		}
	}
}
