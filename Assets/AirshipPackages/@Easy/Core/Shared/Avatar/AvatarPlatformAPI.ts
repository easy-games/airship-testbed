import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { DecodeJSON, EncodeJSON } from "@Easy/Core/Shared/json";
import { AccessoryInstanceDto, OutfitDto, OutfitPatch } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { CoreLogger } from "../Logger/CoreLogger";

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

	public static async GetAllOutfits(): Promise<OutfitDto[] | undefined> {
		this.Log("GetAllOutfits");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits`));
		if (res.success) {
			return DecodeJSON(res.data) as OutfitDto[];
		}
	}

	public static async GetEquippedOutfit(): Promise<OutfitDto | undefined> {
		this.Log("GetEquippedOutfit");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/equipped/self`));
		if (res.success && res.data && res.data !== "") {
			return DecodeJSON(res.data) as OutfitDto;
		} else {
			CoreLogger.Error("failed to load user equipped outfit: " + (res.error ?? "Empty Data"));
		}
	}

	public static async GetPlayerEquippedOutfit(playerId: string): Promise<OutfitDto | undefined> {
		const res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/uid/${playerId}/equipped`));
		if (res.success && res.data && res.data !== "") {
			return DecodeJSON<OutfitDto>(res.data);
		} else {
			CoreLogger.Error("failed to load player equipped outfit: " + (res.error ?? "Empty Data"));
		}
	}

	public static async GetAvatarOutfit(outfitId: string): Promise<OutfitDto | undefined> {
		this.Log("GetAvatarOutfit");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}`));
		if (res.success && res.data && res.data !== "") {
			return DecodeJSON(res.data) as OutfitDto;
		} else {
			CoreLogger.Error("failed to load user outfit: " + (res.error ?? "Empty Data"));
		}
	}

	public static async CreateAvatarOutfit(outfit: OutfitDto) {
		this.Log("CreateAvatarOutfit");
		let res = InternalHttpManager.PostAsync(this.GetHttpUrl(`outfits`), EncodeJSON(outfit));
		if (res.success) {
			print("CREATED OUTFIT: " + res.data);
		}
	}

	public static async EquipAvatarOutfit(outfitId: string) {
		this.Log("EquipAvatarOutfit");
		let res = InternalHttpManager.PostAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}/equip`));
		if (res.success) {
			// print("EQUIPPED OUTFIT: " + DecodeJSON<OutfitDto>(res.data).name);
		} else {
			CoreLogger.Warn("Failed to equip outfit: " + res.error);
		}
	}

	public static async GetAccessories() {
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

	public static async RenameOutfit(outfitId: string, newName: string) {
		this.Log("RenameOutfitAccessories");
		return this.UpdateOutfit(outfitId, {
			name: newName,
		});
	}

	public static async SaveOutfitAccessories(outfitId: string, skinColor: string, instanceIds: string[]) {
		this.Log("SaveOutfitAccessories");
		return this.UpdateOutfit(outfitId, {
			accessories: instanceIds,
			skinColor: skinColor,
		});
	}

	private static UpdateOutfit(outfitId: string, update: Partial<OutfitPatch>) {
		let res = InternalHttpManager.PatchAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}`), EncodeJSON(update));
		if (res.success) {
			const decodedResult = DecodeJSON<OutfitDto>(res.data);
			return decodedResult;
		} else {
			CoreLogger.Error("Error Updating Outfit: " + res.error);
		}
	}

	public static async LoadImage(fileId: string) {
		let res = InternalHttpManager.GetAsync(this.GetImageUrl(fileId));
		if (res.success) {
			return DecodeJSON<AccessoryInstanceDto[]>(res.data);
		} else {
			error("Error loading image: " + res.error);
		}
	}

	public static async UploadItemImage(classId: string, resourceId: string, filePath: string, fileSize: number) {
		const imageId = await this.UploadImage(resourceId, filePath, fileSize);
		if (imageId === "" || imageId === undefined) {
			return;
		}
		print("Updating item with new image");
		let res = InternalHttpManager.PatchAsync(
			this.GetHttpUrl(`accessories/class-id/${classId}`),
			EncodeJSON({
				image: undefined,
				imageId,
			}),
		);
		if (res.success) {
			print("Finished updating item");
		} else {
			error("Unable to update item " + classId + " with new image: " + imageId);
		}
	}

	public static async UploadImage(resourceId: string, filePath: string, fileSize: number): Promise<string> {
		print("Requesting image url: " + resourceId);

		let getPath = `${AirshipUrl.ContentService}/item-classes/images/resource-id/${resourceId}/signed-url?contentType=image%2Fpng&contentLength=${fileSize}`;
		print("get path: " + getPath);
		const res = InternalHttpManager.GetAsync(getPath);

		//GET /item-classes/images/resource-id/6536df9f3843ac629cf3b8b1/signed-url?contentType=image%2Fpng&contentLength=1128045 HTTP/3

		if (res.success) {
			const data = DecodeJSON<{ url: string; imageId: string }>(res.data);
			const url = data.url;
			const imageId = data.imageId;
			print("Got image url: " + url);
			const uploadRes = InternalHttpManager.PutImageAsync(url, filePath);
			if (uploadRes.success) {
				print("UPLOAD COMPLETE: " + url);
			} else {
				error("Error Uploading item image: " + uploadRes.error);
			}

			return imageId;

			// const url = res.data.url;
			// const imageId = res.data.imageId;
			// await axios.put(url, file, {
			// 	headers: {
			// 		"Content-Type": file.type,
			// 	},
			// });
		} else {
			error("Error Gettin item image resource: " + res.error);
		}
	}
}
