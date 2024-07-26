import { Airship } from "../Airship";
import { AccessoryClass, OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { AvatarPlatformAPI } from "./AvatarPlatformAPI";
import { Singleton } from "../Flamework";
import { CoreLogger } from "../Logger/CoreLogger";
import { ColorUtil } from "../Util/ColorUtil";
import { RandomUtil } from "../Util/RandomUtil";

/**
 * Access using {@link Airship.Avatar}. Avatar singleton provides utilities for working with visual elements of a character
 *
 * Can be used to load outfits from the server
 */
@Singleton()
export class AirshipAvatarSingleton {
	private readonly allAvatarAccessories = new Map<string, AccessoryComponent>();
	private readonly allAvatarFaces = new Map<string, AccessoryFace>();
	private readonly allAvatarClasses = new Map<string, AccessoryClass>();
	private readonly ownedAvatarAccessories = new Map<
		AccessorySlot,
		{ instanceId: string; item: AccessoryComponent }[]
	>();
	private readonly ownedAvatarFaces: AccessoryFace[] = [];
	private readonly avatarSkinAccessories: AccessorySkin[] = [];

	public defaultOutfit: AccessoryOutfit | undefined;

	public readonly skinColors: Color[] = [];

	constructor() {
		Airship.Avatar = this;

		// Airship.Avatar.defaultOutfit = AssetCache.LoadAsset<AccessoryOutfit>(
		// 	Airship.Avatar.defaultAccessoryOutfitPath,
		// );
		//print("Init kit: " + Airship.Avatar.defaultKitAccessory?.name);

		let i = 0;
		//Load avatar accessories
		let avatarCollection = AssetBridge.Instance.LoadAsset<AvatarAccessoryCollection>(
			"AirshipPackages/@Easy/Core/Prefabs/Accessories/AvatarItems/EntireAvatarCollection.asset",
		);
		// print("Found avatar collection: " + avatarCollection);
		for (let i = 0; i < avatarCollection.accessories.Length; i++) {
			const element = avatarCollection.accessories.GetValue(i);
			if (!element) {
				CoreLogger.Warn("Empty element in avatar generalAccessories collection: " + i);
				continue;
			}
			//print("Found avatar item: " + element.ToString());
			this.allAvatarAccessories.set(element.serverClassId, element);
		}
		for (let i = 0; i < avatarCollection.faces.Length; i++) {
			const element = avatarCollection.faces.GetValue(i);
			if (!element) {
				CoreLogger.Warn("Empty element in avatar generalAccessories collection: " + i);
				continue;
			}
			//print("Found avatar item: " + element.ToString());
			this.allAvatarFaces.set(element.serverClassId, element);
		}

		for (let i = 0; i < avatarCollection.skinColors.Length; i++) {
			const element = avatarCollection.skinColors.GetValue(i);
			this.skinColors.push(element);
		}

		//Print all of the mapped accessories
		// for (const [key, value] of this.avatarAccessories) {
		// 	print("Loaded Avatar ACC: " + tostring(key) + ", " + value.size());
		// 	for (let i = 0; i < value.size(); i++) {
		// 		print("Acc " + i + ": " + value[i].ToString());
		// 	}
		// }
	}

	/**
	 * @internal
	 */
	public DownloadOwnedAccessories() {
		AvatarPlatformAPI.GetAccessories().then((acc) => {
			if (acc) {
				acc.forEach((itemData) => {
					this.allAvatarClasses.set(itemData.class.classId, itemData.class);
					//print("Possible item " + itemData.class.name + ": " + itemData.class.classId);
					let item = this.allAvatarAccessories.get(itemData.class.classId);
					let foundMatchingItem = false;
					if (item) {
						this.AddAvailableAvatarItem(itemData.instanceId, item);
						foundMatchingItem = true;
					} else {
						let faceItem = this.allAvatarFaces.get(itemData.class.classId);
						if (faceItem) {
							faceItem.serverInstanceId = itemData.instanceId;
							this.AddAvailableFaceItem(faceItem);
							foundMatchingItem = true;
						}
					}

					if (!foundMatchingItem) {
						CoreLogger.Log("Unpaired Server Item " + itemData.class.name + ": " + itemData.class.classId);
					}
				});
			}
		});
	}

	/**
	 * @internal
	 */
	public GetClass(classId: string) {
		return this.allAvatarClasses.get(classId);
	}

	/**
	 * @internal
	 */
	public GetClassThumbnailUrl(classId: string) {
		const classData = this.GetClass(classId);
		if (classData) {
			return AvatarPlatformAPI.GetImageUrl(classData.imageId);
		}
		return "";
	}

	/**
	 * @internal
	 */
	public InitUserOutfits(userId: string) {
		AvatarPlatformAPI.GetAllOutfits().then((outfits) => {
			const maxNumberOfOutfits = 5;
			const numberOfOutfits = outfits ? outfits.size() : 0;
			let name = "";
			//Create missing outfits up to 5
			for (let i = numberOfOutfits; i < maxNumberOfOutfits; i++) {
				name = "Default" + i;
				print("Creating missing outfit: " + name);
				let outfit = AvatarPlatformAPI.CreateDefaultAvatarOutfit(
					userId,
					name,
					name,
					RandomUtil.FromArray(this.skinColors),
				);
				if (!outfit) {
					error("Unable to make a new outfit :(");
				}
			}
			//Make sure an outfit is equipped
			if (!outfits || outfits.size() === 0 || AvatarPlatformAPI.GetEquippedOutfit() === undefined) {
				AvatarPlatformAPI.EquipAvatarOutfit(name);
			}
		});
	}

	/**
	 * @internal
	 */
	public AddAvailableAvatarItem(instanceId: string, item: AccessoryComponent) {
		const slotNumber: number = item.GetSlotNumber();
		let items = this.ownedAvatarAccessories.get(slotNumber);
		if (!items) {
			//print("making new items for slot: " + slotNumber);
			items = [];
		}
		items.push({ instanceId: instanceId, item: item });
		//print("setting item slot " + slotNumber + " to: " + item.ToString());
		this.ownedAvatarAccessories.set(slotNumber, items);
	}

	/**
	 * @internal
	 */
	public AddAvailableFaceItem(item: AccessoryFace) {
		this.ownedAvatarFaces.push(item);
	}

	/**
	 * @internal
	 */
	public GetAllAvatarItems(slotType: AccessorySlot) {
		//print("Getting slot " + tostring(slotType) + " size: " + this.avatarAccessories.get(slotType)?.size());
		return this.ownedAvatarAccessories.get(slotType);
	}

	/**
	 * @internal
	 */
	public GetAllAvatarFaceItems() {
		return this.ownedAvatarFaces;
	}

	/**
	 * @internal
	 */
	public GetAllAvatarSkins() {
		return this.avatarSkinAccessories;
	}

	/**
	 * @internal
	 */
	public GetAllPossibleAvatarItems() {
		return this.allAvatarAccessories;
	}

	/**
	 * @internal
	 */
	public GetAccessoryFromClassId(classId: string) {
		return this.allAvatarAccessories.get(classId);
	}

	/**
	 * @internal
	 */
	public GetAccessoryFaceFromClassId(classId: string) {
		return this.allAvatarFaces.get(classId);
	}

	/**
	 * Gets the equipped outfit for your local logged in character
	 * @param builder accessory builder for character
	 * @param options optional params
	 */
	public LoadEquippedUserOutfit(
		builder: AccessoryBuilder,
		options: {
			removeOldClothingAccessories?: boolean;
			combineMeshes?: boolean;
		} = {},
	) {
		AvatarPlatformAPI.GetEquippedOutfit().then((outfitDto) => {
			if (!outfitDto) {
				// warn("Unable to load users default outfit. Equipping baked default outfit");
				this.LoadDefaultOutfit(builder);
				return;
			}
			this.LoadUserOutfit(outfitDto, builder, options);
		});
	}

	/**
	 * Load a default outfit onto the character so they aren't nakey
	 * @param builder accessory builder for character
	 */
	public LoadDefaultOutfit(builder: AccessoryBuilder) {
		if (this.defaultOutfit) {
			builder.AddAccessoryOutfit(this.defaultOutfit, true);
		}
	}

	/**
	 * Load the equipped outfit of a user into the accessory builder
	 * @param userId target userId
	 * @param builder accessory builder for character
	 * @param options optional params
	 */
	public LoadUsersEquippedOutfit(
		userId: string,
		builder: AccessoryBuilder,
		options: { removeOldClothingAccessories?: boolean } = {},
	) {
		AvatarPlatformAPI.GetUserEquippedOutfit(userId).then((outfit) => {
			if (outfit) {
				this.LoadUserOutfit(outfit, builder, options);
			}
		});
	}

	/**
	 * Load an outfit into the accessory builder
	 * @param outfit  outfit from server
	 * @param builder accessory builder for character
	 * @param options optional params
	 */
	public LoadUserOutfit(
		outfit: OutfitDto,
		builder: AccessoryBuilder,
		options: { removeOldClothingAccessories?: boolean } = {},
	) {
		if (options.removeOldClothingAccessories) {
			builder.RemoveClothingAccessories();
		}
		outfit.accessories.forEach((acc) => {
			const accComponentTemplate = this.GetAccessoryFromClassId(acc.class.classId);
			if (accComponentTemplate) {
				let accComponent = builder.AddSingleAccessory(accComponentTemplate, false);
				if (accComponent?.AccessoryComponent) {
					accComponent.AccessoryComponent.SetInstanceId(acc.instanceId);
				} else {
					warn("Unable to find accessory with class ID: " + acc.class.classId);
				}
			} else {
				const face = this.GetAccessoryFaceFromClassId(acc.class.classId);
				if (face?.decalTexture) {
					builder.SetFaceTexture(face.decalTexture);
				} else {
					warn("Unable to find accessory with class ID: " + acc.class.classId);
				}
			}
		});
		builder.SetSkinColor(ColorUtil.HexToColor(outfit.skinColor), true);
		builder.TryCombineMeshes();
	}
}
