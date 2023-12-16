import { Dependency } from "@easy-games/flamework-core";
import { LocalEntityController } from "Client/Controllers/Character/LocalEntityController";
import { Entity } from "Shared/Entity/Entity";
import { Bin } from "Shared/Util/Bin";
import { CharacterEntity } from "../../Entity/Character/CharacterEntity";
import { ItemDef } from "../ItemDefinitionTypes";
import { ItemType } from "../ItemType";
import { BreakBlockHeldItem } from "./BlockPlacement/BreakBlockHeldItem";
import { PlaceBlockHeldItem } from "./BlockPlacement/PlaceBlockHeldItem";
import { TillBlockHeldItem } from "./BlockPlacement/TillBlockHeldItem";
import { MeleeHeldItem } from "./Damagers/MeleeHeldItem";
import { HeldItem } from "./HeldItem";
import { HeldItemState } from "./HeldItemState";
import { ProjectileLauncherHeldItem } from "./ProjectileLauncher/ProjectileLauncherHeldItem";

export type HeldItemCondition = (itemDef: ItemDef) => boolean;
export type HeldItemFactory = (entity: Entity, itemDef: ItemDef) => HeldItem;
export type HeldItemEntry = {
	condition: HeldItemCondition;
	factory: HeldItemFactory;
};

/**
 * This class is attached to an {@link Entity}.
 *
 * One item manager per entity, calls functionality on currently equipped item for that entity
 */
export class HeldItemManager {
	public entity: CharacterEntity;
	private heldItemMap = new Map<ItemType, HeldItem>();
	private emptyHeldItem: HeldItem | undefined;
	private currentHeldItem: HeldItem;
	private currentItemState: HeldItemState = HeldItemState.NONE;
	private bin = new Bin();
	private newStateQueued = false;

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

	private GetOrCreateHeldItem(itemDef?: ItemDef) {
		if (itemDef === undefined) {
			if (this.emptyHeldItem) {
				return this.emptyHeldItem;
			}
			this.emptyHeldItem = new HeldItem(this.entity, itemDef);
			this.emptyHeldItem.OnLoadAssets();
			return this.emptyHeldItem;
		}

		let item = this.heldItemMap.get(itemDef.itemType);
		if (item === undefined) {
			//Create the held item instance
			for (let i = HeldItemManager.heldItemClasses.size() - 1; i >= 0; i--) {
				const entry = HeldItemManager.heldItemClasses[i];
				if (entry.condition(itemDef)) {
					item = entry.factory(this.entity, itemDef);
				}
			}
			if (item === undefined) {
				item = new HeldItem(this.entity, itemDef);
			}
			item.OnLoadAssets();
			this.heldItemMap.set(itemDef.itemType, item);
		}
		return item;
	}

	constructor(entity: CharacterEntity) {
		this.entity = entity;
		this.Log("Creating Held Items");
		this.currentHeldItem = this.GetOrCreateHeldItem();

		//Listen for item switches
		this.bin.Add(
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
			}),
		);
	}

	public Destroy(): void {
		this.bin.Clean();
	}

	//LOCAL CLIENT ONLY
	public TriggerNewState(itemState: HeldItemState) {
		if (this.newStateQueued) return;
		this.newStateQueued = true;

		const lookVector = this.entity.entityDriver.GetLookVector();

		//Notify server of new State
		Dependency<LocalEntityController>().AddToMoveData(
			"HeldItemState",
			{
				e: this.entity.id,
				s: itemState,
				l: lookVector,
			},
			() => {
				this.newStateQueued = false;
				//Handle the state locally
				this.OnNewState(itemState, lookVector);
			},
		);
	}

	public OnNewState(itemState: HeldItemState, lookVector: Vector3) {
		this.Log("New State: " + itemState);
		// if (this.currentItemState === itemState) {
		// 	return;
		// }
		if (this.currentHeldItem === undefined) {
			error("Trying to interact without any held item!");
			return;
		}
		this.currentItemState = itemState;
		this.currentHeldItem.SetLookVector(lookVector);
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
	(itemMeta) => itemMeta.tillBlock !== undefined,
	(entity, itemMeta) => new TillBlockHeldItem(entity, itemMeta),
);
HeldItemManager.RegisterHeldItem(
	(itemMeta) => itemMeta.projectileLauncher !== undefined,
	(entity, itemMeta) => new ProjectileLauncherHeldItem(entity, itemMeta),
);
