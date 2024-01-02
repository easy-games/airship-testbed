import { ColorUtil } from "Shared/Util/ColorUtil";

export class AvatarUtil {
	public static readonly DefaultAccessoryCollectionPath =
		"@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset";
	//@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset
	private static readonly avatarAccessories = new Map<AccessorySlot, Accessory[]>();
	private static readonly avatarSkinAccessories: AccessorySkin[] = [];

	public static DefaultKitAccessory: AccessoryCollection | undefined;

	public static readonly SkinColors = [
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
		AvatarUtil.DefaultKitAccessory = AssetBridge.Instance.LoadAsset<AccessoryCollection>(
			AvatarUtil.DefaultAccessoryCollectionPath,
		);
		//print("Init kit: " + AvatarUtil.defaultKitAccessory?.name);

		let i = 0;
		//Load avatar accessories
		let avatarCollection = AssetBridge.Instance.LoadAsset<AvatarCollection>(
			"@Easy/Core/Shared/Resources/Accessories/AvatarItems/AllAvatarItems.asset",
		);
		for (let i = 0; i < avatarCollection.skinAccessories.Length; i++) {
			const element = avatarCollection.skinAccessories.GetValue(i);
			//print("Found avatar skin item: " + element.ToString());
			this.avatarSkinAccessories.push(element);
		}
		for (let i = 0; i < avatarCollection.generalAccessories.Length; i++) {
			const element = avatarCollection.generalAccessories.GetValue(i);
			//print("Found avatar item: " + element.ToString());
			this.AddAvailableAvatarItem(element);
		}

		//Print all of the mapped accessories
		// for (const [key, value] of this.avatarAccessories) {
		// 	print("Loaded Avatar ACC: " + tostring(key) + ", " + value.size());
		// 	for (let i = 0; i < value.size(); i++) {
		// 		print("Acc " + i + ": " + value[i].ToString());
		// 	}
		// }
	}

	public static AddAvailableAvatarItem(item: Accessory) {
		const slotNumber: number = item.GetSlotNumber();
		let items = this.avatarAccessories.get(slotNumber);
		if (!items) {
			//print("making new items for slot: " + slotNumber);
			items = [];
		}
		items.push(item);
		//print("setting item slot " + slotNumber + " to: " + item.ToString());
		this.avatarAccessories.set(slotNumber, items);
	}

	public static GetAllAvatarItems(slotType: AccessorySlot) {
		//print("Getting slot " + tostring(slotType) + " size: " + this.avatarAccessories.get(slotType)?.size());
		return this.avatarAccessories.get(slotType);
	}

	public static GetAllAvatarSkins() {
		return this.avatarSkinAccessories;
	}
}
