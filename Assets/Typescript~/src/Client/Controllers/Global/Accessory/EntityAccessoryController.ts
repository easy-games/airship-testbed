import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { Game } from "Shared/Game";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ArmorType } from "Shared/Item/ArmorType";
import { Bin } from "Shared/Util/Bin";
import { CSArrayUtil } from "Shared/Util/CSArrayUtil";
import { ItemUtil } from "../../../../Shared/Item/ItemUtil";
import { Layer } from "../../../../Shared/Util/Layer";
import { LocalEntityController } from "../Character/LocalEntityController";

@Controller({})
export class EntityAccessoryController implements OnStart {
	private isFirstPerson = false;

	constructor(private readonly localController: LocalEntityController) {}

	private AutoEquipArmor() {
		ClientSignals.EntitySpawn.Connect((event) => {
			if (event.entity instanceof CharacterEntity) {
				//Add Kit Accessory
				if (ItemUtil.defaultKitAccessory) {
					const accessories = event.entity.accessoryBuilder.EquipAccessoryCollection(
						ItemUtil.defaultKitAccessory,
					);
					if (event.entity.IsLocalCharacter()) {
						for (const accessory of CSArrayUtil.Convert(accessories)) {
							this.HandleAccessoryVisibility(accessory);
						}
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
								accessoryBuilder.RemoveAccessorySlot(slot);
							}
						}
						for (const acc of armorAccessories) {
							accessoryBuilder.SetAccessory(acc);
						}
						currentArmor = armorAccessories;
					} else {
						if (currentArmor) {
							// Clear armor:
							for (const acc of currentArmor) {
								accessoryBuilder.RemoveAccessorySlot(acc.AccessorySlot);
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
		});

		this.localController.ObserveFirstPerson((firstPerson) => {
			this.HandleAllAccessoryVisibility();
		});
	}

	private HandleAllAccessoryVisibility(): void {
		const accessories = Game.LocalPlayer.Character?.accessoryBuilder.GetActiveAccessories();
		if (!accessories) return;

		for (let i = 0; i < accessories.Length; i++) {
			const accessory = accessories.GetValue(i);
			this.HandleAccessoryVisibility(accessory);
		}
	}

	public HandleAccessoryVisibility(activeAccessory: ActiveAccessory): void {
		const firstPerson = this.localController.IsFirstPerson();

		if (firstPerson) {
			if (!activeAccessory.accessory.VisibleInFirstPerson) {
				for (let renderer of CSArrayUtil.Convert(activeAccessory.renderers)) {
					renderer.enabled = false;
				}
			}
		} else {
			if (!activeAccessory.accessory.VisibleInFirstPerson) {
				for (let renderer of CSArrayUtil.Convert(activeAccessory.renderers)) {
					renderer.enabled = true;
				}
			}
		}
	}

	OnStart(): void {
		this.AutoEquipArmor();

		ClientSignals.EntitySpawn.Connect((event) => {
			if (!(event.entity instanceof CharacterEntity)) return;

			const accessoryBuilder = event.entity.accessoryBuilder;

			const bin = new Bin();
			bin.Add(
				event.entity.GetInventory().ObserveHeldItem((itemStack) => {
					if (itemStack === undefined) {
						accessoryBuilder.RemoveAccessorySlot(AccessorySlot.LeftHand);
						accessoryBuilder.RemoveAccessorySlot(AccessorySlot.RightHand);
						return;
					}

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

	private SetFirstPersonLayer(accessoryBuilder: AccessoryBuilder) {
		//Accessories with first person mesh variants need to be on layer FPS

		//Turn off root accessories unless they are on the first person layer
		let rootItems: CSArray<Renderer> = accessoryBuilder.GetAccessoryMeshes(AccessorySlot.Root);
		for (let i = 0; i < rootItems.Length; i++) {
			let item = rootItems.GetValue(i);
			item.enabled =
				(!this.isFirstPerson && item.gameObject.layer !== Layer.FIRST_PERSON) ||
				(this.isFirstPerson && item.gameObject.layer === Layer.FIRST_PERSON);
		}

		//Set hand items to render in the first person camera
		let rightHandItems: CSArray<Renderer> = accessoryBuilder.GetAccessoryMeshes(AccessorySlot.RightHand);
		for (let i = 0; i < rightHandItems.Length; i++) {
			rightHandItems.GetValue(i).gameObject.layer = this.isFirstPerson ? 10 : 3;
		}
		let leftHandItems: CSArray<Renderer> = accessoryBuilder.GetAccessoryMeshes(AccessorySlot.LeftHand);
		for (let i = 0; i < leftHandItems.Length; i++) {
			leftHandItems.GetValue(i).gameObject.layer = this.isFirstPerson ? 10 : 3;
		}
	}
}
