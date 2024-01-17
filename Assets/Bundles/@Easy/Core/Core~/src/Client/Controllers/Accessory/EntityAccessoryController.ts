import { Controller, Dependency, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AvatarUtil } from "Shared/Avatar/AvatarUtil";
import { CoreTest } from "Shared/CoreTest";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ArmorType } from "Shared/Item/ArmorType";
import { ItemUtil } from "Shared/Item/ItemUtil";
import { Bin } from "Shared/Util/Bin";
import { LocalEntityController } from "../Character/LocalEntityController";
import { ViewmodelController } from "../Viewmodel/ViewmodelController";

@Controller({})
export class EntityAccessoryController implements OnStart {
	private isFirstPerson = false;

	constructor(private readonly localController: LocalEntityController) {
		const test = new CoreTest();
	}

	private AutoEquipArmor() {
		CoreClientSignals.EntitySpawn.Connect((event) => {
			Profiler.BeginSample("AutoEqupArmor");
			if (event.entity instanceof CharacterEntity) {
				if (event.entity.IsPlayerOwned() || true) {
					//Add Kit Accessory
					if (AvatarUtil.defaultKitAccessory) {
						Profiler.BeginSample("EquipAccessories");
						const accessories = event.entity.accessoryBuilder.EquipAccessoryCollection(
							AvatarUtil.defaultKitAccessory,
							true,
						);
						if (event.entity.IsLocalCharacter()) {
							Dependency<ViewmodelController>().accessoryBuilder.EquipAccessoryCollection(
								AvatarUtil.defaultKitAccessory,
								true,
							);
						}
						Profiler.EndSample();
					}
				}

				const inventory = event.entity.GetInventory();
				const accessoryBuilder = event.entity.gameObject.GetComponent<AccessoryBuilder>();
				const bin = new Bin();

				let currentArmor: Readonly<AccessoryComponent[]> | undefined;

				const onArmorSlotChanged = (itemStack?: ItemStack) => {
					if (itemStack) {
						const itemType = itemStack.GetItemType();
						const armorAccessories = ItemUtil.GetAccessoriesForItemType(itemType);
						if (currentArmor) {
							// Remove accessory slots from previous armor that aren't on the new armor:
							const currentSlots = currentArmor.map((acc) => acc.accessorySlot);
							const newSlots = armorAccessories.map((acc) => acc.accessorySlot);
							const slotsToRemove = currentSlots.filter((slot) => !newSlots.includes(slot));
							for (const slot of slotsToRemove) {
								accessoryBuilder.RemoveAccessorySlot(slot, false);
								if (event.entity.IsLocalCharacter()) {
									Dependency<ViewmodelController>().accessoryBuilder.RemoveAccessorySlot(slot, false);
								}
							}
						}
						for (const acc of armorAccessories) {
							accessoryBuilder.AddSingleAccessory(acc, true);
							if (event.entity.IsLocalCharacter()) {
								Dependency<ViewmodelController>().accessoryBuilder.AddSingleAccessory(acc, true);
							}
						}
						currentArmor = armorAccessories;
					} else {
						if (currentArmor) {
							// Clear armor:
							for (const acc of currentArmor) {
								accessoryBuilder.RemoveAccessorySlot(acc.accessorySlot, false);
								if (event.entity.IsLocalCharacter()) {
									Dependency<ViewmodelController>().accessoryBuilder.RemoveAccessorySlot(
										acc.accessorySlot,
										false,
									);
								}
							}
							currentArmor = undefined;
						}
					}
				};

				onArmorSlotChanged(inventory.GetItem(inventory.armorSlots[ArmorType.HELMET]));
				onArmorSlotChanged(inventory.GetItem(inventory.armorSlots[ArmorType.CHESTPLATE]));
				onArmorSlotChanged(inventory.GetItem(inventory.armorSlots[ArmorType.BOOTS]));

				bin.Connect(inventory.slotChanged, (slotIndex, itemStack) => {
					if (slotIndex === inventory.armorSlots[ArmorType.HELMET]) {
						onArmorSlotChanged(itemStack);
					}
				});

				event.entity.onDespawn.Once(() => {
					bin.Clean();
				});
			}
			Profiler.EndSample();
		});
	}

	OnStart(): void {
		this.AutoEquipArmor();

		CoreClientSignals.EntitySpawn.Connect((event) => {
			if (!(event.entity instanceof CharacterEntity)) return;

			const bin = new Bin();

			if (event.entity.IsLocalCharacter()) {
				bin.Add(
					this.localController.ObserveFirstPerson((isFirstPerson: boolean) => {
						this.isFirstPerson = isFirstPerson;
					}),
				);
			}

			event.entity.onDespawn.Once(() => {
				bin.Clean();
			});
		});
	}
}
