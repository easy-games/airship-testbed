import Character from "Shared/Character/Character";
import Inventory from "Shared/Inventory/Inventory";
import { Bin } from "Shared/Util/Bin";
import { CoreItemType } from "../CoreItemType";
import { ItemDef } from "../ItemDefinitionTypes";
import { MeleeHeldItem } from "./Damagers/MeleeHeldItem";
import { HeldItem } from "./HeldItem";
import { Airship } from "../../Airship";

export type HeldItemCondition = (itemDef: ItemDef) => boolean;
export type HeldItemFactory = (character: Character, itemDef: ItemDef) => HeldItem;
export type HeldItemEntry = {
	condition: HeldItemCondition;
	factory: HeldItemFactory;
};
export interface HeldItemActionState {
	characterId: number;
	stateIndex: number;
	isActive: boolean;
	lookVector: Vector3; //Just a Convenience so the server can know where the client was looking. Maybe add lookStartPos?
}

/**
 * This class is attached to an {@link Character}.
 *
 * One item manager per character, calls functionality on currently equipped item for that entity
 */
export class HeldItemManager {
	public character: Character;
	private heldItemMap = new Map<string, HeldItem>();
	private emptyHeldItem: HeldItem | undefined;
	private currentHeldItem: HeldItem;
	private currentItemState = -1;
	private bin = new Bin();
	private newStateQueued = false;

	private static heldItemClasses = new Array<HeldItemEntry>();

	public static RegisterHeldItem(condition: HeldItemCondition, factory: HeldItemFactory): void {
		this.heldItemClasses.push({ condition, factory });
	}

	public GetLabel() {
		return this.character.id;
	}

	public GetCurrentHeldItem() {
		return this.currentHeldItem;
	}

	public TryGetItem(itemType: CoreItemType) {
		return this.heldItemMap.get(itemType);
	}

	private Log(message: string) {
		//print("HeldItem: " + this.character.id + " " + message);
	}

	private GetOrCreateHeldItem(itemDef?: ItemDef) {
		if (itemDef === undefined) {
			if (this.emptyHeldItem) {
				return this.emptyHeldItem;
			}
			this.emptyHeldItem = new HeldItem(this.character, itemDef);
			this.emptyHeldItem.OnLoadAssets();
			return this.emptyHeldItem;
		}

		let item = this.heldItemMap.get(itemDef.itemType);
		if (item === undefined) {
			//Create the held item instance
			for (let i = HeldItemManager.heldItemClasses.size() - 1; i >= 0; i--) {
				const entry = HeldItemManager.heldItemClasses[i];
				if (entry.condition(itemDef)) {
					item = entry.factory(this.character, itemDef);
				}
			}
			if (item === undefined) {
				item = new HeldItem(this.character, itemDef);
			}
			item.OnLoadAssets();
			this.heldItemMap.set(itemDef.itemType, item);
		}
		return item;
	}

	constructor(character: Character) {
		this.character = character;
		character.heldItems = this;
		this.Log("Creating Held Items");
		this.currentHeldItem = this.GetOrCreateHeldItem();

		//Listen for item switches
		const inv = this.character.gameObject.GetAirshipComponent<Inventory>();
		if (inv) {
			this.bin.Add(
				inv.ObserveHeldItem((itemStack) => {
					this.Log("is equipping a new item: " + itemStack?.GetMeta().displayName);
					//UnEquip last item
					if (this.currentHeldItem !== undefined) {
						this.currentHeldItem.OnUnEquip();
					}
					//Equip the new item
					this.currentItemState = -1;
					this.currentHeldItem = this.GetOrCreateHeldItem(itemStack?.GetMeta());
					this.currentHeldItem.OnEquip();
				}),
			);
		}
	}

	public Destroy(): void {
		this.bin.Clean();
	}

	//LOCAL CLIENT ONLY
	public TriggerNewState(stateIndex: number, isActive: boolean) {
		if (this.newStateQueued) return; //TODO what is this? It should be replaced with an actual queue if needed
		this.newStateQueued = true;

		const lookVector = this.character.movement.GetLookVector();

		//Notify server of new State
		let stateData: HeldItemActionState = {
			characterId: this.character.id,
			stateIndex: stateIndex,
			isActive: isActive,
			lookVector: lookVector,
		};
		Airship.characters.localCharacterManager.AddToMoveData("HeldItemState", stateData, () => {
			//Handle the state locally
			this.newStateQueued = false;
			this.OnNewState(stateIndex, isActive, lookVector);
		});
	}

	public OnNewState(stateIndex: number, isActive: boolean, lookVector: Vector3) {
		this.Log("New State: " + stateIndex);
		if (this.currentHeldItem === undefined) {
			error("Trying to interact without any held item!");
		}

		this.currentItemState = stateIndex;
		this.currentHeldItem.SetLookVector(lookVector);
		if (stateIndex >= 0) {
			this.currentHeldItem.OnNewActionState(stateIndex, isActive);
		} else {
			//DESTROYING
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
// HeldItemManager.RegisterHeldItem(
// 	(itemMeta) => itemMeta.projectileLauncher !== undefined,
// 	(entity, itemMeta) => new ProjectileLauncherHeldItem(entity, itemMeta),
// );
