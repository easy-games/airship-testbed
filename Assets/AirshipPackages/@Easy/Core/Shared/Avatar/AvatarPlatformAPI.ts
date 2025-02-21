import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import {
	GearInstanceDto,
	OutfitCreateDto,
	OutfitDto,
	OutfitPatch,
} from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { CoreLogger } from "../Logger/CoreLogger";

// TODO this needs to be moved to the main menu lua sandbox
export class AvatarPlatformAPI {
	public static defaultFace?: GearInstanceDto;
	public static defaultShirt?: GearInstanceDto;
	public static defaultPants?: GearInstanceDto;
	public static defaultShoes?: GearInstanceDto;

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
			return json.decode(res.data) as OutfitDto[];
		}
	}

	public static async GetEquippedOutfit(): Promise<OutfitDto | undefined> {
		this.Log("GetEquippedOutfit");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/equipped/self`));
		if (res.success) {
			return json.decode<{ outfit: OutfitDto | undefined }>(res.data).outfit;
		} else {
			CoreLogger.Error("failed to load user equipped outfit: " + (res.error ?? "Empty Data"));
		}
	}

	public static async GetUserEquippedOutfit(userId: string): Promise<OutfitDto | undefined> {
		const res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/uid/${userId}/equipped`));
		if (res.success) {
			this.Log("LOADED OUTFIT: " + res.data);
			return json.decode<{ outfit: OutfitDto | undefined }>(res.data).outfit;
		} else {
			CoreLogger.Error("failed to load users equipped outfit: " + (res.error ?? "Empty Data"));
		}
	}

	public static async GetAvatarOutfit(outfitId: string): Promise<OutfitDto | undefined> {
		this.Log("GetAvatarOutfit");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}`));
		if (res.success) {
			this.Log("LOADED OUTFIT: " + res.data);
			return json.decode<{ outfit: OutfitDto | undefined }>(res.data).outfit;
		} else {
			CoreLogger.Error("failed to load user outfit: " + (res.error ?? "Empty Data"));
		}
	}

	public static async CreateAvatarOutfit(outfit: OutfitCreateDto) {
		this.Log("CreateAvatarOutfit: " + this.GetHttpUrl(`outfits`) + " data: " + json.encode(outfit));
		let res = InternalHttpManager.PostAsync(this.GetHttpUrl(`outfits`), json.encode(outfit));
		if (res.success) {
			this.Log("CREATED OUTFIT: " + res.data);
			return json.decode<{ outfit: OutfitDto }>(res.data).outfit;
		} else {
			CoreLogger.Error("Error creating outfit: " + res.error);
		}
	}

	public static async EquipAvatarOutfit(outfitId: string) {
		this.Log("EquipAvatarOutfit");
		let res = InternalHttpManager.PostAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}/equip`));
		if (res.success) {
			this.Log("EQUIPPED OUTFIT: " + res.data);
		} else {
			CoreLogger.Error("Failed to equip outfit: " + res.error);
		}
	}

	public static async GetAccessories() {
		this.Log("GetAccessories");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`gear/self`));
		if (res.success) {
			//this.Log("Got acc: " + res.data);
			return json.decode<GearInstanceDto[]>(res.data);
		} else {
			CoreLogger.Error("Unable to load avatar items for user");
		}
	}

	public static async CreateDefaultAvatarOutfit(equipped: boolean, outfitId: string, name: string, skinColor: Color) {
		this.Log("CreateDefaultAvatarOutfit");
		let accessorUUIDs: string[] = [];

		let ownerId = "";
		if (this.defaultFace) {
			ownerId = this.defaultFace.ownerId;
			accessorUUIDs.push(this.defaultFace.instanceId);
		}
		if (this.defaultShirt) {
			ownerId = this.defaultShirt.ownerId;
			accessorUUIDs.push(this.defaultShirt.instanceId);
		}
		if (this.defaultPants) {
			ownerId = this.defaultPants.ownerId;
			accessorUUIDs.push(this.defaultPants.instanceId);
		}
		if (this.defaultShoes) {
			ownerId = this.defaultShoes.ownerId;
			accessorUUIDs.push(this.defaultShoes.instanceId);
		}

		let outfit: OutfitCreateDto = {
			name: name,
			outfitId: outfitId,
			gear: accessorUUIDs,
			equipped: equipped,
			owner: ownerId,
			skinColor: ColorUtil.ColorToHex(skinColor),
		};
		return this.CreateAvatarOutfit(outfit);
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
			gear: instanceIds,
			skinColor: skinColor,
		});
	}

	private static UpdateOutfit(outfitId: string, update: Partial<OutfitPatch>) {
		let res = InternalHttpManager.PatchAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}`), json.encode(update));
		if (res.success) {
			return json.decode<{ outfit: OutfitDto }>(res.data).outfit;
		} else {
			CoreLogger.Error("Error Updating Outfit: " + res.error);
		}
	}

	public static async LoadImage(fileId: string) {
		let res = InternalHttpManager.GetAsync(this.GetImageUrl(fileId));
		if (res.success) {
			return json.decode<GearInstanceDto[]>(res.data);
		} else {
			CoreLogger.Error("Error loading image: " + res.error);
		}
	}

	public static async UploadItemImage(classId: string, resourceId: string, filePath: string, fileSize: number) {
		const imageId = await this.UploadImage(resourceId, filePath, fileSize);
		if (imageId === "" || imageId === undefined) {
			return;
		}
		this.Log("Updating item with new image");
		let res = InternalHttpManager.PatchAsync(
			this.GetHttpUrl(`gear/class-id/${classId}`),
			json.encode({
				image: undefined,
				imageId,
			}),
		);
		if (res.success) {
			this.Log("Finished updating item");
		} else {
			CoreLogger.Error("Unable to update item " + classId + " with new image: " + imageId);
		}
	}

	public static async UploadImage(resourceId: string, filePath: string, fileSize: number): Promise<string> {
		this.Log("Requesting image url: " + resourceId);

		let postPath = `${AirshipUrl.ContentService}/images`;
		this.Log("post path: " + postPath);
		const res = InternalHttpManager.PostAsync(
			postPath,
			json.encode({
				contentType: "image/png",
				contentLength: fileSize,
				resourceId,
				namespace: "items",
			}),
		);

		if (res.success) {
			const data = json.decode<{ url: string; imageId: string }>(res.data);
			const url = data.url;
			const imageId = data.imageId;
			this.Log("Got image url: " + url);
			const uploadRes = InternalHttpManager.PutImageAsync(url, filePath);
			if (uploadRes.success) {
				this.Log("UPLOAD COMPLETE: " + url);
			} else {
				CoreLogger.Error("Error Uploading item image: " + uploadRes.error);
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
			CoreLogger.Error("Error Gettin item image resource: " + res.error);
			return "";
		}
	}
}
