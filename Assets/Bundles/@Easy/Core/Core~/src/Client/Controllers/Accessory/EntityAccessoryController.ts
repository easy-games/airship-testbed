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
				if (event.entity.IsPlayerOwned()) {
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

				let currentArmor: Readonly<Accessory[]> | undefined;

				const onArmorSlotChanged = (itemStack?: ItemStack) => {
					if (itemStack) {
						const itemType = itemStack.GetItemType();
						const armorAccessories = ItemUtil.GetAccessoriesForItemType(itemType);
						if (currentArmor) {
							// Remove accessory slots from previous armor that aren't on the new armor:
							const currentSlots = currentArmor.map((acc) => acc.AccessorySlot);
							const newSlots = armorAccessories.map((acc) => acc.AccessorySlot);
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
								accessoryBuilder.RemoveAccessorySlot(acc.AccessorySlot, false);
								if (event.entity.IsLocalCharacter()) {
									Dependency<ViewmodelController>().accessoryBuilder.RemoveAccessorySlot(
										acc.AccessorySlot,
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

				bin.Connect(inventory.SlotChanged, (slotIndex, itemStack) => {
					if (slotIndex === inventory.armorSlots[ArmorType.HELMET]) {
						onArmorSlotChanged(itemStack);
					}
				});

				event.entity.OnDespawn.Once(() => {
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

			const accessoryBuilder = event.entity.accessoryBuilder;

			const bin = new Bin();
			bin.Add(
				event.entity.GetInventory().ObserveHeldItem((itemStack) => {
					if (event.entity.IsLocalCharacter()) {
						this.SetFirstPersonLayer(accessoryBuilder);
					}
				}),
			);

			if (event.entity.IsLocalCharacter()) {
				bin.Add(
					this.localController.ObserveFirstPerson((isFirstPerson: boolean) => {
						this.isFirstPerson = isFirstPerson;
						this.SetFirstPersonLayer(accessoryBuilder);
					}),
				);
			}

			event.entity.OnDespawn.Once(() => {
				bin.Clean();
			});
		});
	}

	//Turn off root accessories unless they are on the first person layer
	private SetFirstPersonLayer(accessoryBuilder: AccessoryBuilder) {
		//Accessories with first person mesh variants need to be on layer FPS
		// Profiler.BeginSample("ToggleMeshVisibility");
		// accessoryBuilder.SetFirstPersonEnabled(this.isFirstPerson);
		// Profiler.EndSample();
	}
}
