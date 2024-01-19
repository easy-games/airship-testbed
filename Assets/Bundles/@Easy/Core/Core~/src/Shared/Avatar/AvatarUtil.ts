import { ColorUtil } from "Shared/Util/ColorUtil";
import { AvatarPlatformAPI } from "./AvatarPlatformAPI";

export class AvatarUtil {
	public static readonly defaultAccessoryOutfitPath =
		"@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset";
	//@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset
	private static readonly allAvatarAccessories = new Map<string, AccessoryComponent>();
	private static readonly ownedAvatarAccessories = new Map<AccessorySlot, AccessoryComponent[]>();
	private static readonly avatarSkinAccessories: AccessorySkin[] = [];

	public static defaultOutfit: AccessoryOutfit | undefined;

	public static readonly skinColors = [
		//Natural
		ColorUtil.HexToColor("#edcdad"),
		ColorUtil.HexToColor("#f2c291"),
		ColorUtil.HexToColor("#cc9d6a"),
		ColorUtil.HexToColor("#ebbc78"),
		ColorUtil.HexToColor("#f2c27e"),
		ColorUtil.HexToColor("#d69e5e"),
		ColorUtil.HexToColor("#e8bd92"),
		ColorUtil.HexToColor("#4d2a22"),
		ColorUtil.HexToColor("#5e372e"),

		//Fun
		ColorUtil.HexToColor("#9bc063"),
		ColorUtil.HexToColor("#5a4862"),
		ColorUtil.HexToColor("#DB2E2A"),
		ColorUtil.HexToColor("#7D8C93"),
		ColorUtil.HexToColor("#251000"),
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
		print("Found avatar collection: " + avatarCollection);
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
				let item = this.allAvatarAccessories.get(itemData.class.classId);
				if (item) {
					//print("Found item: " + item.gameObject.name);
					item.serverInstanceId = itemData.instanceId;
					this.AddAvailableAvatarItem(item);
				}
			});
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

	public static GetAllAvatarItems(slotType: AccessorySlot) {
		//print("Getting slot " + tostring(slotType) + " size: " + this.avatarAccessories.get(slotType)?.size());
		return this.ownedAvatarAccessories.get(slotType);
	}

	public static GetAllAvatarSkins() {
		return this.avatarSkinAccessories;
	}

	public static GetAccessoryFromClassId(classId: string) {
		return this.allAvatarAccessories.get(classId);
	}
}
