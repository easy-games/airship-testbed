import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { DecodeJSON, EncodeJSON } from "Shared/json";

export type ItemClass = {
	resourceType: "GAME" | "ORGANIZATION";
	resourceId: string;
	classId: string;
	name: string;
	imageId: string;
	description: string;
};

export type AccessoryClass = ItemClass & {
	accessory: {};
};

export type AccessoryItem = {
	instanceId: string;
	class: AccessoryClass;
};

export type Accessory = {
	item: AccessoryItem;
};

export type Outfit = {
	outfitId: string;
	owner: string;

	name: string;
	accessories: Accessory[];
	skinColor: string;

	equipped: boolean;
};

export class AvatarPlatformAPI {
	private static Log(message: string) {
		print("AvatarAPI: " + message);
	}

	public static GetHttpUrl(path: string) {
		let url = `${AirshipUrl.ContentService}/${path}`;
		this.Log("HTTP URL: " + url);
		return url;
	}

	public static GetAllOutfits(): Outfit[] | undefined {
		this.Log("GetAllOutfits");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits`));
		if (res.success) {
			return DecodeJSON(res.data) as Outfit[];
		}
	}

	public static GetEquippedOutfit(): Outfit | undefined {
		this.Log("GetEquippedOutfit");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/equipped`));
		if (res.success) {
			return DecodeJSON(res.data) as Outfit;
		}
	}

	public static GetAvatarOutfit(outfitId: string): Outfit | undefined {
		this.Log("GetAvatarOutfit");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}`));
		if (res.success) {
			return DecodeJSON(res.data) as Outfit;
		}
	}

	public static CreateAvatarOutfit(outfit: Outfit) {
		this.Log("CreateAvatarOutfit");
		let res = InternalHttpManager.PostAsync(this.GetHttpUrl(`outfits`), EncodeJSON(outfit));
		if (res.success) {
			print("CREATED OUTFIT: " + res.data);
		}
	}

	public static EquipAvatarOutfit(outfitId: string) {
		this.Log("EquipAvatarOutfit");
		let res = InternalHttpManager.PostAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}/equip`));
		if (res.success) {
			print("EQUIPPED OUTFIT: " + DecodeJSON<Outfit>(res.data).name);
		}
	}

	public static GetAccessories() {
		this.Log("GetAccessories");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`accessories`));
		if (res.success) {
			return DecodeJSON<AccessoryItem[]>(res.data);
		}
	}

	public static CreateDefaultAvatarOutfit(
		entityId: string,
		outfitId: string,
		name: string,
		skinColor: Color,
	): Outfit {
		this.Log("CreateDefaultAvatarOutfit");
		let outfit = {
			name: name,
			outfitId: outfitId,
			accessories: [],
			equipped: true,
			owner: entityId,
			skinColor: ColorUtil.ColorToHex(skinColor),
		};
		this.CreateAvatarOutfit(outfit);
		return outfit;
	}

	public static SaveOutfitAccessories(outfitId: string, instanceIds: string[]) {
		this.Log("SaveOutfitAccessories");
		let res = InternalHttpManager.PatchAsync(
			this.GetHttpUrl(`outfits/outfit-id/${outfitId}`),
			EncodeJSON({
				accessories: instanceIds,
			}),
		);
		if (res.success) {
			print("Outfit Saved: " + res.data);
			return DecodeJSON<Outfit>(res.data);
		} else {
			error("Error Saving: " + res.error);
		}
	}

	public static SaveAvatarOutfit(outfit: Outfit) {
		this.Log("SaveAvatarOutfit");
		//TODO: Save Outfit to server
		//InternalHttpManager.PatchAsync(this.GetHttpUrl(`outfits/outfit-id/${outfit.outfitId}`), EncodeJSON(outfit));
	}

	public static LoadImage(fileId: string) {
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`images/${fileId}`));
		if (res.success) {
			return DecodeJSON<AccessoryItem[]>(res.data);
		} else {
			error("Error loading image: " + res.error);
		}
	}
}
