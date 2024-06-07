import { RandomUtil } from "@Easy/Core/Shared/Util/RandomUtil";
import { AccessoryClass, OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { CoreLogger } from "../Logger/CoreLogger";
import { ColorUtil } from "../Util/ColorUtil";
import { AvatarPlatformAPI } from "./AvatarPlatformAPI";

export class AvatarUtil {
	// public static readonly defaultAccessoryOutfitPath =
	// 	"AirshipPackages/@Easy/Core/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset";
	//AirshipPackages/@Easy/Core/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset
	private static readonly allAvatarAccessories = new Map<string, AccessoryComponent>();
	private static readonly allAvatarFaces = new Map<string, AccessoryFace>();
	private static readonly allAvatarClasses = new Map<string, AccessoryClass>();
	private static readonly ownedAvatarAccessories = new Map<
		AccessorySlot,
		{ instanceId: string; item: AccessoryComponent }[]
	>();
	private static readonly ownedAvatarFaces: AccessoryFace[] = [];
	private static readonly avatarSkinAccessories: AccessorySkin[] = [];

	public static defaultOutfit: AccessoryOutfit | undefined;

	public static readonly skinColors: Color[] = [];

	public static Initialize() {
		// AvatarUtil.defaultOutfit = AssetCache.LoadAsset<AccessoryOutfit>(
		// 	AvatarUtil.defaultAccessoryOutfitPath,
		// );
		//print("Init kit: " + AvatarUtil.defaultKitAccessory?.name);

		let i = 0;
		//Load avatar accessories
		let avatarCollection = AssetBridge.Instance.LoadAsset<AvatarAccessoryCollection>(
			"AirshipPackages/@Easy/Core/Prefabs/Accessories/AvatarItems/EntireAvatarCollection.asset",
		);
		/*for (let i = 0; i < avatarCollection.skinAccessories.Length; i++) {
			const element = avatarCollection.skinAccessories.GetValue(i);
			if (!element) {
				warn("Empty element in avatar skinAccessories collection: " + i);
				continue;
			}
			//print("Found avatar skin item: " + element.ToString());
			this.avatarSkinAccessories.push(element);
		}*/
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

	public static DownloadOwnedAccessories() {
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
						print("Unpaired Server Item " + itemData.class.name + ": " + itemData.class.classId);
					}
				});
			}
		});
	}

	public static GetClass(classId: string) {
		return this.allAvatarClasses.get(classId);
	}

	public static GetClassThumbnailUrl(classId: string) {
		const classData = AvatarUtil.GetClass(classId);
		if (classData) {
			return AvatarPlatformAPI.GetImageUrl(classData.imageId);
		}
		return "";
	}

	public static InitUserOutfits(userId: string) {
		const maxNumberOfOutfits = 5;
		let outfits = AvatarPlatformAPI.GetAllOutfits();
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
	}

	public static AddAvailableAvatarItem(instanceId: string, item: AccessoryComponent) {
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

	public static AddAvailableFaceItem(item: AccessoryFace) {
		this.ownedAvatarFaces.push(item);
	}

	public static GetAllAvatarItems(slotType: AccessorySlot) {
		//print("Getting slot " + tostring(slotType) + " size: " + this.avatarAccessories.get(slotType)?.size());
		return this.ownedAvatarAccessories.get(slotType);
	}

	public static GetAllAvatarFaceItems() {
		return this.ownedAvatarFaces;
	}

	public static GetAllAvatarSkins() {
		return this.avatarSkinAccessories;
	}

	public static GetAllPossibleAvatarItems() {
		return this.allAvatarAccessories;
	}

	public static GetAccessoryFromClassId(classId: string) {
		return this.allAvatarAccessories.get(classId);
	}

	public static GetAccessoryFaceFromClassId(classId: string) {
		return this.allAvatarFaces.get(classId);
	}

	public static LoadEquippedUserOutfit(
		builder: AccessoryBuilder,
		options: {
			removeOldClothingAccessories?: boolean;
			combineMeshes?: boolean;
		} = {},
	) {
		AvatarPlatformAPI.GetEquippedOutfit().then((outfitDto)=>{
			if (!outfitDto) {
				// warn("Unable to load users default outfit. Equipping baked default outfit");
				this.LoadDefaultOutfit(builder);
				return;
			}
			this.LoadUserOutfit(outfitDto, builder, options);
		})
	}

	public static LoadDefaultOutfit(builder: AccessoryBuilder) {
		if (this.defaultOutfit) {
			builder.EquipAccessoryOutfit(this.defaultOutfit, true);
		}
	}

	public static LoadPlayersEquippedOutfit(
		playerId: string,
		builder: AccessoryBuilder,
		options: { removeOldClothingAccessories?: boolean } = {},
	) {
		AvatarPlatformAPI.GetPlayerEquippedOutfit(playerId).then((outfit) => {
			if (outfit) {
				this.LoadUserOutfit(outfit, builder, options);
			}
		});
	}

	public static LoadUserOutfit(
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
				accComponent.AccessoryComponent.SetInstanceId(acc.instanceId);
			} else {
				const face = this.GetAccessoryFaceFromClassId(acc.class.classId);
				if (face) {
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
