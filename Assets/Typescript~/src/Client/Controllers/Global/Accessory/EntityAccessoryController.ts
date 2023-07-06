import { Controller, OnStart } from "@easy-games/flamework-core";
import Object from "@easy-games/unity-object-utils";
import { ClientSignals } from "Client/ClientSignals";
import { CharacterEntity } from "Shared/Entity/Character/CharacterEntity";
import { ItemStack } from "Shared/Inventory/ItemStack";
import { ArmorType } from "Shared/Item/ArmorType";
import { GetItemMeta } from "Shared/Item/ItemDefinitions";
import { ItemType } from "Shared/Item/ItemType";
import { Bin } from "Shared/Util/Bin";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { Layer } from "../../../../Shared/Util/Layer";
import { LocalEntityController } from "../Character/LocalEntityController";

@Controller({})
export class EntityAccessoryController implements OnStart {
	private DefaultKitPath = "Shared/Resources/Accessories/Kits/Whim/WhimKit.asset";
	private itemAccessories = new Map<ItemType, Accessory[]>();
	private missingItemAccessory: Accessory;
	private isFirstPerson = false;
	private defaultKitAccessory: AccessoryKit | undefined;

	constructor(private readonly localController: LocalEntityController) {
		this.missingItemAccessory = AssetBridge.LoadAsset<Accessory>("Shared/Resources/Accessories/missing_item.asset");
		for (const itemTypeStr of Object.keys(ItemType)) {
			const itemType = itemTypeStr as ItemType;
			const itemMeta = GetItemMeta(itemType);

			let accessoryNames: string[] = [itemTypeStr];
			if (itemMeta.AccessoryNames) {
				accessoryNames = itemMeta.AccessoryNames;
			} else if (itemMeta.block?.blockId) {
				accessoryNames = ["block"];
			}

			if (accessoryNames.size() > 0) {
				const accessories: Accessory[] = [];
				this.itemAccessories.set(itemType, accessories);

				for (const accessoryName of accessoryNames) {
					let accNameLower = accessoryName.lower();
					let accessory = AssetBridge.LoadAssetIfExists<Accessory>(
						`Shared/Resources/Accessories/${accNameLower}.asset`,
					);
					if (!accessory) {
						warn("Couldn't find: " + accNameLower);
						continue;
					}

					// this.itemAccessories.set(itemType, accessory);
					accessories.push(accessory);
				}
			}

			this.defaultKitAccessory = AssetBridge.LoadAssetIfExists<AccessoryKit>(this.DefaultKitPath);
		}
	}

	public GetFirstAccessoryForItemType(itemType: ItemType): Accessory {
		let accessories = this.itemAccessories.get(itemType);
		if (accessories) return accessories[0];

		return this.missingItemAccessory;
	}

	public GetAccessoriesForItemType(itemType: ItemType): Readonly<Accessory[]> {
		let accessories = this.itemAccessories.get(itemType);
		if (accessories) return accessories;

		return [this.missingItemAccessory];
	}

	private AutoEquipArmor() {
		ClientSignals.EntitySpawn.Connect((event) => {
			if (event.Entity instanceof CharacterEntity) {
				const inventory = event.Entity.GetInventory();
				const accessoryBuilder = event.Entity.gameObject.GetComponent<AccessoryBuilder>();
				const bin = new Bin();

				let currentArmor: Readonly<Accessory[]> | undefined;

				const onArmorSlotChanged = (itemStack?: ItemStack) => {
					if (itemStack) {
						const itemType = itemStack.GetItemType();
						const armorAccessories = this.GetAccessoriesForItemType(itemType);
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

				onArmorSlotChanged(inventory.GetItem(inventory.armorSlots[ArmorType.CHESTPLATE]));

				bin.Connect(inventory.SlotChanged, (slotIndex, itemStack) => {
					if (slotIndex === inventory.armorSlots[ArmorType.CHESTPLATE]) {
						onArmorSlotChanged(itemStack);
					}
				});

				event.Entity.OnDespawn.Once(() => {
					bin.Clean();
				});
			}
		});
	}

	OnStart(): void {
		this.AutoEquipArmor();

		ClientSignals.EntitySpawn.Connect((event) => {
			if (event.Entity instanceof CharacterEntity) {
				const accessoryBuilder = event.Entity.accessoryBuilder;

				//Add Kit Accessory
				if (this.defaultKitAccessory) {
					accessoryBuilder.SetAccessoryKit(this.defaultKitAccessory);
				}

				const bin = new Bin();
				bin.Add(
					event.Entity.GetInventory().ObserveHeldItem((itemStack) => {
						if (itemStack === undefined) {
							accessoryBuilder.RemoveAccessorySlot(AccessorySlot.RightHand);
							return;
						}

						const accessories = this.GetAccessoriesForItemType(itemStack.GetItemType());

						for (const accessory of accessories) {
							accessoryBuilder.SetAccessory(accessory);
						}

						const itemMeta = itemStack.GetItemMeta();
						if (itemMeta.block && itemMeta.AccessoryNames === undefined) {
							const blockDefinition = WorldAPI.GetMainWorld().GetBlockDefinition(itemMeta.block.blockId);
							const blockGO = MeshProcessor.ProduceSingleBlock(
								itemMeta.block.blockId,
								WorldAPI.GetMainWorld().voxelWorld,
							);
							const gameObjects = accessoryBuilder.GetAccessories(AccessorySlot.RightHand);
							blockGO.transform.SetParent(gameObjects.GetValue(0).transform);
							blockGO.transform.localPosition = new Vector3(0, 0, 0);
							const scale = 1;
							blockGO.transform.localScale = new Vector3(scale, scale, scale);
							blockGO.transform.localRotation = Quaternion.identity;
							blockGO.transform.Rotate(new Vector3(90, 90, 0));
						}

						if (event.Entity.IsLocalCharacter()) {
							this.SetFirstPersonLayer(accessoryBuilder);
						}
					}),
				);

				if (event.Entity.IsLocalCharacter()) {
					bin.Add(
						this.localController.ObserveFirstPerson((isFirstPerson: boolean) => {
							this.isFirstPerson = isFirstPerson;
							this.SetFirstPersonLayer(accessoryBuilder);
						}),
					);
				}

				event.Entity.OnDespawn.Once(() => {
					bin.Clean();
				});
			}
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
