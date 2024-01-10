import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { DecodeJSON, EncodeJSON } from "Shared/json";

export type ItemClass = {
	resourceType: "GAME" | "ORGANIZATION";
	resourceId: string;
	classId: string;
	name: string;
	imageId: string;
	description: string;
};

export type Accessory = {
	item: {
		instanceId: string;
		class: ItemClass & {
			accessory: {};
		};
	};
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
	public static GetAllOutfits(): Outfit[] | undefined {
		let res = HttpManager.GetAsync(`${AirshipUrl.ContentService}/outfits`);
		if (res.success) {
			return DecodeJSON(res.data) as Outfit[];
		}
	}

	public static GetEquippedOutfit(): Outfit | undefined {
		let res = HttpManager.GetAsync(`${AirshipUrl.ContentService}/outfits/equipped`);
		if (res.success) {
			return DecodeJSON(res.data) as Outfit;
		}
	}

	public static GetAvatarOutfit(outfitId: string): Outfit | undefined {
		let res = HttpManager.GetAsync(`${AirshipUrl.ContentService}/outfits/outfit-id/${outfitId}`);
		if (res.success) {
			return DecodeJSON(res.data) as Outfit;
		}
	}

	public static CreateAvatarOutfit(outfit: Outfit) {
		HttpManager.PostAsync(`${AirshipUrl.ContentService}/outfits/create`, EncodeJSON(outfit));
	}

	public static EquipAvatarOutfit(outfitId: string) {
		HttpManager.PostAsync(`${AirshipUrl.ContentService}/outfits/outfit-id/${outfitId}/equip`, outfitId);
	}

	public static CreateDefaultAvatarOutfit(
		entityId: string,
		outfitId: string,
		name: string,
		skinColor: Color,
	): Outfit {
		let outfit = {
			name: name,
			outfitId: outfitId,
			accessories: [],
			equipped: true,
			owner: entityId,
			//skinColor: RandomUtil.FromArray(this.skinColors).ToString(),
			skinColor: skinColor.ToString(),
		};
		this.CreateAvatarOutfit(outfit);
		return outfit;
	}

	public static SaveAvatarOutfit(outfit: Outfit) {
		HttpManager.PatchAsync(`${AirshipUrl.ContentService}/outfits/outfit-id/${outfit.outfitId}`, EncodeJSON(outfit));
	}
}
