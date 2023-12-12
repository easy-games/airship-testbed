export class AvatarUtils {
	public static readonly DefaultAccessoryCollectionPath =
		"@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset";
	//@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset
	private static readonly avatarAccessories = new Map<AccessorySlot, Accessory[]>();
	private static readonly avatarSkinAccessories: AccessorySkin[] = [];

	public static defaultKitAccessory: AccessoryCollection | undefined;

	public static Initialize() {
		AvatarUtils.defaultKitAccessory = AssetBridge.Instance.LoadAsset<AccessoryCollection>(
			AvatarUtils.DefaultAccessoryCollectionPath,
		);
		print("Init kit: " + AvatarUtils.defaultKitAccessory?.name);

		let i = 0;
		//Load avatar accessories
		let avatarCollection = AssetBridge.Instance.LoadAsset<AvatarCollection>(
			"@Easy/Core/Shared/Resources/Accessories/AvatarItems/AllAvatarItems.asset",
		);
		for (let i = 0; i < avatarCollection.skinAccessories.Length; i++) {
			const element = avatarCollection.skinAccessories.GetValue(i);
			print("Found avatar skin item: " + element.ToString());
			this.avatarSkinAccessories.push(element);
		}
		for (let i = 0; i < avatarCollection.torsoAccessories.Length; i++) {
			const element = avatarCollection.torsoAccessories.GetValue(i);
			print("Found avatar item: " + element.ToString());
			this.AddAvailableAvatarItem(element);
		}

		//Print all of the mapped accessories
		for (const [key, value] of this.avatarAccessories) {
			print("Loaded Avatar ACC: " + tostring(key) + ", " + value.size());
			for (let i = 0; i < value.size(); i++) {
				print("Acc " + i + ": " + value[i].ToString());
			}
		}
	}

	public static AddAvailableAvatarItem(item: Accessory) {
		const slotNumber: number = item.GetSlotNumber();
		let items = this.avatarAccessories.get(slotNumber);
		if (!items) {
			print("making new items for slot: " + slotNumber);
			items = [];
		}
		items.push(item);
		print("setting item slot " + slotNumber + " to: " + item.ToString());
		this.avatarAccessories.set(slotNumber, items);
	}

	public static GetAllAvatarItems(slotType: AccessorySlot) {
		print("Getting slot " + tostring(slotType) + " size: " + this.avatarAccessories.get(slotType)?.size());
		return this.avatarAccessories.get(slotType);
	}

	public static GetAllAvatarSkins() {
		return this.avatarSkinAccessories;
	}
}
