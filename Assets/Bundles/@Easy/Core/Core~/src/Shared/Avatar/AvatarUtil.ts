import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { DecodeJSON, EncodeJSON } from "Shared/json";
import { Outfit } from "./AvatarBackendTypes";

export class AvatarUtil {
	public static readonly defaultAccessoryCollectionPath =
		"@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset";
	//@Easy/Core/Shared/Resources/Accessories/AvatarItems/GothGirl/Kit_GothGirl_Collection.asset
	private static readonly avatarAccessories = new Map<AccessorySlot, Accessory[]>();
	private static readonly avatarSkinAccessories: AccessorySkin[] = [];

	public static defaultKitAccessory: AccessoryCollection | undefined;

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
		AvatarUtil.defaultKitAccessory = AssetBridge.Instance.LoadAsset<AccessoryCollection>(
			AvatarUtil.defaultAccessoryCollectionPath,
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

	public static GetAllOutfits(): Outfit[] | undefined {
		let res = HttpManager.GetAsync(`${AirshipUrl.ContentService}/outfits`);
		if (res.success) {
			return DecodeJSON(res.data) as Outfit[];
		}
	}

	public static GetEquippedOutfit(): Outfit | undefined{
		let res = HttpManager.GetAsync(`${AirshipUrl.ContentService}/outfits/equipped`);
		if (res.success) {
			return DecodeJSON(res.data) as Outfit;
		}
	}

	public static GetAvatarOutfit(outfitId: string): Outfit | undefined{
		let res = HttpManager.GetAsync(`${AirshipUrl.ContentService}/outfits/outfit-id/${outfitId}`);
		if (res.success) {
			return DecodeJSON(res.data) as Outfit;
		}
	}

	public static CreateAvatarOutfit(outfit: Outfit){
		HttpManager.PostAsync(`${AirshipUrl.ContentService}/outfits/create`, EncodeJSON(outfit));
	}

	public static EquipAvatarOutfit(outfitId: string){
		HttpManager.PostAsync(`${AirshipUrl.ContentService}/outfits/outfit-id/${outfitId}/equip`, outfitId);
	}

	public static CreateDefaultAvatarOutfit(entityId: string, name: string, id: string): Outfit{
		let outfit = {
			name: name,
			outfitId: id,
			accessories: [],
			equipped: true,
			owner: entityId,
			skinColor: RandomUtil.FromArray(this.skinColors).ToString(),
		};
		this.CreateAvatarOutfit(outfit);
		return outfit;
	}

	public static SaveAvatarOutfit(outfit: Outfit){
		HttpManager.PatchAsync(`${AirshipUrl.ContentService}/outfits/outfit-id/${outfit.outfitId}`, EncodeJSON(outfit));
	}
}
