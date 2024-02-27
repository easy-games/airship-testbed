import { AccessoryInstanceDto, OutfitDto } from "Shared/Airship/Types/Outputs/PlatformInventory";
import { AirshipUrl } from "Shared/Util/AirshipUrl";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { DecodeJSON, EncodeJSON } from "Shared/json";

// TODO this needs to be moved to the main menu lua sandbox
export class AvatarPlatformAPI {
	private static Log(message: string) {
		//print("AvatarAPI: " + message);
	}

	public static GetHttpUrl(path: string) {
		let url = `${AirshipUrl.ContentService}/${path}`;
		this.Log("HTTP URL: " + url);
		return url;
	}

	public static GetImageUrl(imageId: string) {
		return `${AirshipUrl.CDN}/images/${imageId}.png`;
	}

	public static GetAllOutfits(): OutfitDto[] | undefined {
		this.Log("GetAllOutfits");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits`));
		if (res.success) {
			return DecodeJSON(res.data) as OutfitDto[];
		}
	}

	public static GetEquippedOutfit(): OutfitDto | undefined {
		this.Log("GetEquippedOutfit");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/equipped/self`));
		if (res.success && res.data && res.data !== "") {
			return DecodeJSON(res.data) as OutfitDto;
		}
	}

	public static GetAvatarOutfit(outfitId: string): OutfitDto | undefined {
		this.Log("GetAvatarOutfit");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}`));
		if (res.success && res.data && res.data !== "") {
			return DecodeJSON(res.data) as OutfitDto;
		}
	}

	public static CreateAvatarOutfit(outfit: OutfitDto) {
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
			print("EQUIPPED OUTFIT: " + DecodeJSON<OutfitDto>(res.data).name);
		} else {
			Debug.LogError("Failed to equip outfit: " + res.error);
		}
	}

	public static GetAccessories() {
		this.Log("GetAccessories");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`accessories/self`));
		if (res.success) {
			return DecodeJSON<AccessoryInstanceDto[]>(res.data);
		}
	}

	public static CreateDefaultAvatarOutfit(
		entityId: string,
		outfitId: string,
		name: string,
		skinColor: Color,
	): OutfitDto {
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

	public static SaveOutfitAccessories(outfitId: string, skinColor: string, instanceIds: string[]) {
		this.Log("SaveOutfitAccessories");
		let res = InternalHttpManager.PatchAsync(
			this.GetHttpUrl(`outfits/outfit-id/${outfitId}`),
			EncodeJSON({
				accessories: instanceIds,
				skinColor: skinColor,
			}),
		);
		if (res.success) {
			print("Outfit Saved: " + res.data);
			return DecodeJSON<OutfitDto>(res.data);
		} else {
			error("Error Saving: " + res.error);
		}
	}

	public static SaveAvatarOutfit(outfit: OutfitDto) {
		this.Log("SaveAvatarOutfit");
		//TODO: Save Outfit to server
		//InternalHttpManager.PatchAsync(this.GetHttpUrl(`outfits/outfit-id/${outfit.outfitId}`), EncodeJSON(outfit));
	}

	public static LoadImage(fileId: string) {
		let res = InternalHttpManager.GetAsync(this.GetImageUrl(fileId));
		if (res.success) {
			return DecodeJSON<AccessoryInstanceDto[]>(res.data);
		} else {
			error("Error loading image: " + res.error);
		}
	}
}
