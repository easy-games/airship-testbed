import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { Entity } from "Shared/Entity/Entity";
import { CharacterEntity } from "../../Entity/Character/CharacterEntity";
import { ItemMeta } from "../ItemMeta";
import { ItemType } from "../ItemType";
import { BreakBlockHeldItem } from "./BlockPlacement/BreakBlockHeldItem";
import { PlaceBlockHeldItem } from "./BlockPlacement/PlaceBlockHeldItem";
import { MeleeHeldItem } from "./Damagers/MeleeHeldItem";
import { HeldItem } from "./HeldItem";
import { HeldItemState } from "./HeldItemState";
import { ProjectileLauncherHeldItem } from "./ProjectileLauncher/ProjectileLauncherHeldItem";

export type HeldItemCondition = (itemMeta: ItemMeta) => boolean;
export type HeldItemFactory = (entity: Entity, itemMeta: ItemMeta) => HeldItem;
export type HeldItemEntry = {
	condition: HeldItemCondition;
	factory: HeldItemFactory;
};

//One item manager per entity, calls functionality on currently equipped item for that entity
export class HeldItemManager {
	private entity: CharacterEntity;
	private heldItemMap = new Map<ItemType, HeldItem>();
	private emptyHeldItem: HeldItem | undefined;
	private currentHeldItem: HeldItem;
	private currentItemState: HeldItemState = HeldItemState.NONE;

	private static heldItemClasses = new Array<HeldItemEntry>();

	public static RegisterHeldItem(condition: HeldItemCondition, factory: HeldItemFactory): void {
		this.heldItemClasses.push({ condition, factory });
	}

	public GetLabel() {
		return this.entity.id;
	}

	private Log(message: string) {
		return;
		print("Entity " + this.entity.id + " " + message);
	}

	private GetOrCreateHeldItem(itemMeta?: ItemMeta) {
		if (itemMeta === undefined) {
			if (this.emptyHeldItem) {
				return this.emptyHeldItem;
			}
			this.emptyHeldItem = new HeldItem(this.entity, itemMeta);
			return this.emptyHeldItem;
		}

		let item = this.heldItemMap.get(itemMeta.itemType);
		if (item === undefined) {
			//Create the held item instance
			for (let i = HeldItemManager.heldItemClasses.size() - 1; i >= 0; i--) {
				const entry = HeldItemManager.heldItemClasses[i];
				if (entry.condition(itemMeta)) {
					item = entry.factory(this.entity, itemMeta);
				}
			}
			if (item === undefined) {
				item = new HeldItem(this.entity, itemMeta);
			}
			this.heldItemMap.set(itemMeta.itemType, item);
		}
		return item;
	}

	constructor(entity: CharacterEntity) {
		this.entity = entity;
		this.Log("Creating Held Items");
		this.currentHeldItem = this.GetOrCreateHeldItem();

		//Listen for item switches
		this.entity.GetInventory().ObserveHeldItem((itemStack) => {
			this.Log("is equipping a new item: " + itemStack?.GetMeta().displayName);
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
		Dependency<LocalEntityController>().AddToMoveData("HeldItemState", {
			entityId: this.entity.id,
			state: itemState,
		});

		//Handle the state locally
		this.OnNewState(itemState);
	}

	public OnNewState(itemState: HeldItemState) {
		this.Log("New State: " + itemState);
		// if (this.currentItemState === itemState) {
		// 	return;
		// }
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
			case HeldItemState.SECONDARY_ACTION_START:
				this.currentHeldItem.OnSecondaryActionStart();
				break;
			case HeldItemState.SECONDARY_ACTION_END:
				this.currentHeldItem.OnSecondaryActionEnd();
				break;
			case HeldItemState.INSPECT:
				this.currentHeldItem.OnInspect();
				break;
			case HeldItemState.ON_DESTROY:
				//When destroyed un equip so any logic can clean itself up
				this.currentHeldItem.OnUnEquip();
				//Fill current held item with default item
				this.currentHeldItem = this.GetOrCreateHeldItem();
		}
	}
}

HeldItemManager.RegisterHeldItem(
	(itemMeta) => itemMeta.melee !== undefined,
	(entity, itemMeta) => new MeleeHeldItem(entity, itemMeta),
);
HeldItemManager.RegisterHeldItem(
	(itemMeta) => itemMeta.block !== undefined,
	(entity, itemMeta) => new PlaceBlockHeldItem(entity, itemMeta),
);
HeldItemManager.RegisterHeldItem(
	(itemMeta) => itemMeta.breakBlock !== undefined,
	(entity, itemMeta) => new BreakBlockHeldItem(entity, itemMeta),
);
HeldItemManager.RegisterHeldItem(
	(itemMeta) => itemMeta.projectileLauncher !== undefined,
	(entity, itemMeta) => new ProjectileLauncherHeldItem(entity, itemMeta),
);
