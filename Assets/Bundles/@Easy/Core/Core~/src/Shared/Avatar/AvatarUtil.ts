import { AccessoryClass, OutfitDto } from "Shared/Airship/Types/Outputs/PlatformInventory";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { AvatarPlatformAPI } from "./AvatarPlatformAPI";

export class AvatarUtil {
	public static readonly defaultAccessoryOutfitPath =
		"@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset";
	//@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset
	private static readonly allAvatarAccessories = new Map<string, AccessoryComponent>();
	private static readonly allAvatarClasses = new Map<string, AccessoryClass>();
	private static readonly ownedAvatarAccessories = new Map<AccessorySlot, AccessoryComponent[]>();
	private static readonly ownedAvatarFaces: AccessoryFace[] = [];
	private static readonly avatarSkinAccessories: AccessorySkin[] = [];

	public static defaultOutfit: AccessoryOutfit | undefined;

	public static readonly skinColors = [
		//Natural
		// ColorUtil.HexToColor("#FFF3EA"),
		ColorUtil.HexToColor("#F6D7BB"),
		ColorUtil.HexToColor("#ECB98C"),
		ColorUtil.HexToColor("#D99E72"),
		ColorUtil.HexToColor("#C68953"),
		ColorUtil.HexToColor("#A56E45"),
		ColorUtil.HexToColor("#925E39"),
		ColorUtil.HexToColor("#7D4F2B"),
		ColorUtil.HexToColor("#4E2F13"),
		ColorUtil.HexToColor("#352214"),
	];

	public static Initialize() {
		AvatarUtil.defaultOutfit = AssetBridge.Instance.LoadAsset<AccessoryOutfit>(
			AvatarUtil.defaultAccessoryOutfitPath,
		);
		//print("Init kit: " + AvatarUtil.defaultKitAccessory?.name);

		let i = 0;
		//Load avatar accessories
		let avatarCollection = AssetBridge.Instance.LoadAsset<AccessoryOutfit>(
			"@Easy/Core/Shared/Resources/Accessories/AvatarItems/AllAvatarItems.asset",
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
				warn("Empty element in avatar generalAccessories collection: " + i);
				continue;
			}
			//print("Found avatar item: " + element.ToString());
			this.allAvatarAccessories.set(element.serverClassId, element);
		}

		//Print all of the mapped accessories
		// for (const [key, value] of this.avatarAccessories) {
		// 	print("Loaded Avatar ACC: " + tostring(key) + ", " + value.size());
		// 	for (let i = 0; i < value.size(); i++) {
		// 		print("Acc " + i + ": " + value[i].ToString());
		// 	}
		// }
	}

	public static GetOwnedAccessories() {
		let acc = AvatarPlatformAPI.GetAccessories();
		if (acc) {
			acc.forEach((itemData) => {
				this.allAvatarClasses.set(itemData.class.classId, itemData.class);
				//print("Possible item " + itemData.class.name + ": " + itemData.class.classId);
				let item = this.allAvatarAccessories.get(itemData.class.classId);
				if (item) {
					//print("Found item: " + item.gameObject.name + ": " + itemData.class.classId);
					item.serverInstanceId = itemData.instanceId;
					this.AddAvailableAvatarItem(item);
				}
			});
		}
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

	public static AddAvailableAvatarItem(item: AccessoryComponent) {
		const slotNumber: number = item.GetSlotNumber();
		let items = this.ownedAvatarAccessories.get(slotNumber);
		if (!items) {
			//print("making new items for slot: " + slotNumber);
			items = [];
		}
		items.push(item);
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

	public static GetAccessoryFromClassId(classId: string) {
		return this.allAvatarAccessories.get(classId);
	}

	public static LoadEquippedUserOutfit(
		builder: AccessoryBuilder,
		options: { removeAllOldAccessories?: boolean; combineMeshes?: boolean } = {},
	) {
		const outfitDto = AvatarPlatformAPI.GetEquippedOutfit();
		if (!outfitDto) {
			// warn("Unable to load users default outfit. Equipping baked default outfit");
			this.LoadDefaultOutfit(builder);
			return;
		}
		this.LoadUserOutfit(outfitDto, builder, options);
	}

	public static LoadDefaultOutfit(builder: AccessoryBuilder) {
		if (this.defaultOutfit) {
			builder.EquipAccessoryOutfit(this.defaultOutfit, true);
		}
	}

	public static LoadUserOutfit(
		outfit: OutfitDto,
		builder: AccessoryBuilder,
		options: { removeAllOldAccessories?: boolean } = {},
	) {
		if (options.removeAllOldAccessories) {
			builder.RemoveAccessories();
		}
		outfit.accessories.forEach((acc) => {
			const accComponent = this.GetAccessoryFromClassId(acc.class.classId);
			if (!accComponent) {
				warn("Unable to find accessory with class ID: " + acc.class.classId);
				return; //Continue
			}
			builder.AddSingleAccessory(accComponent, false);
		});
		builder.TryCombineMeshes();
	}
}
