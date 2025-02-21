import { AuthController } from "@Easy/Core/Client/ProtectedControllers/Auth/AuthController";
import {
	ClothingInstanceDto,
	OutfitCreateDto,
	OutfitDto,
	OutfitPatch,
} from "../../Airship/Types/Outputs/AirshipPlatformInventory";
import { Dependency, Singleton } from "../../Flamework";
import { CoreLogger } from "../../Logger/CoreLogger";
import { Protected } from "../../Protected";
import { AirshipUrl } from "../../Util/AirshipUrl";
import { ColorUtil } from "../../Util/ColorUtil";
import inspect from "../../Util/Inspect";
import { RandomUtil } from "../../Util/RandomUtil";
import { Signal } from "../../Util/Signal";

@Singleton()
export class ProtectedAvatarSingleton {
	public defaultFace?: ClothingInstanceDto;
	public defaultShirt?: ClothingInstanceDto;
	public defaultPants?: ClothingInstanceDto;
	public defaultShoes?: ClothingInstanceDto;

	private isLoadingInventory = false;
	public isInventoryLoaded = false;
	public onInventoryLoaded = new Signal();

	public outfits: OutfitDto[] = [];
	public ownedClothing: ClothingInstanceDto[] = [];
	public equippedOutfit: OutfitDto | undefined;

	public skinColors = [
		"#FFF3EA",
		"#F6D7BB",
		"#ECB98C",
		"#D99E72",
		"#C68953",
		"#A56E45",
		"#925E39",
		"#7D4F2B",
		"#4E2F13",
		"#352214",
	];

	constructor() {
		Protected.Avatar = this;
	}

	public async LoadInventory(): Promise<void> {
		if (this.isInventoryLoaded) return;
		if (this.isLoadingInventory) {
			Debug.LogWarning("Tried to load inventory when already loading.");
			return;
		}

		await Dependency<AuthController>().WaitForAuthed();

		const promises: Promise<void>[] = [];

		let loadedOutfitFromBackend: OutfitDto | undefined;

		// Get all owned clothing and map them to usable values
		promises.push(
			new Promise(async (resolve) => {
				this.Log("Downloading owned clothing...");
				let clothingData = await Protected.Avatar.GetAccessories();
				this.Log("Owned clothing count: " + (clothingData?.size() ?? 0));
				if (clothingData) {
					this.Log("Owned clothing sample: " + inspect(clothingData[0]));
					this.ownedClothing = clothingData;
				}
				resolve();
			}),
		);

		// Load the outfits
		promises.push(
			new Promise(async (resolve) => {
				let outfitsRes = await Protected.Avatar.GetAllOutfits();
				if (outfitsRes) {
					this.outfits = outfitsRes;
				}
				const maxNumberOfOutfits = 5;
				const numberOfOutfits = outfitsRes ? outfitsRes.size() : 0;
				let name = "";
				let equippedOutfitId = "";
				let firstOutfit = true;

				//Create missing outfits up to 5
				for (let i = numberOfOutfits; i < maxNumberOfOutfits; i++) {
					name = "Default" + i;
					print("Creating missing outfit: " + name);
					let outfit = await Protected.Avatar.CreateDefaultAvatarOutfit(
						firstOutfit,
						name,
						name,
						ColorUtil.HexToColor(RandomUtil.FromArray(this.skinColors)),
					);
					if (!outfit) {
						error("Unable to make a new outfit :(");
					} else if (firstOutfit) {
						firstOutfit = false;
						equippedOutfitId = outfit.outfitId;
					}
					this.outfits.push(outfit);
				}

				if (!this.equippedOutfit && this.outfits.size() > 0) {
					this.equippedOutfit = this.outfits[0];
				}

				// Make sure an outfit is equipped. We don't need to wait on this.
				task.spawn(async () => {
					if (equippedOutfitId !== "" && (await Protected.Avatar.GetEquippedOutfit()) === undefined) {
						print("Setting equipped outfit: " + equippedOutfitId);
						await Protected.Avatar.EquipAvatarOutfit(equippedOutfitId);
					}
				});

				resolve();
			}),
		);

		// Get the loaded outfit dto.
		promises.push(
			new Promise(async (resolve) => {
				loadedOutfitFromBackend = await Protected.Avatar.GetEquippedOutfit();
				resolve();
			}),
		);

		// Run in parallel
		await Promise.all(promises);

		// We want the loaded outfit to be the same object as the one in outfits array.
		if (loadedOutfitFromBackend) {
			this.equippedOutfit = this.outfits.find((o) => o.outfitId === loadedOutfitFromBackend?.outfitId);
		}

		this.isLoadingInventory = false;
		this.isInventoryLoaded = true;
		this.onInventoryLoaded.Fire();
	}

	private Log(message: string) {
		// print("Protected.Avatar: " + message);
	}

	public GetHttpUrl(path: string) {
		let url = `${AirshipUrl.ContentService}/${path}`;
		return url;
	}

	public GetImageUrl(imageId: string) {
		return `${AirshipUrl.CDN}/images/${imageId}.png`;
	}

	public async GetAllOutfits(): Promise<OutfitDto[] | undefined> {
		this.Log("GetAllOutfits");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits`));
		if (res.success) {
			return json.decode(res.data) as OutfitDto[];
		}
	}

	public async GetEquippedOutfit(): Promise<OutfitDto | undefined> {
		this.Log("GetEquippedOutfit");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/equipped/self`));
		if (res.success) {
			return json.decode<{ outfit: OutfitDto | undefined }>(res.data).outfit;
		} else {
			CoreLogger.Error("failed to load user equipped outfit: " + (res.error ?? "Empty Data"));
		}
	}

	public async GetUserEquippedOutfit(userId: string): Promise<OutfitDto | undefined> {
		const res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/uid/${userId}/equipped`));
		if (res.success) {
			this.Log("LOADED OUTFIT: " + res.data);
			return json.decode<{ outfit: OutfitDto | undefined }>(res.data).outfit;
		} else {
			CoreLogger.Error("failed to load users equipped outfit: " + (res.error ?? "Empty Data"));
		}
	}

	public async GetAvatarOutfit(outfitId: string): Promise<OutfitDto | undefined> {
		this.Log("GetAvatarOutfit");
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}`));
		if (res.success) {
			this.Log("LOADED OUTFIT: " + res.data);
			return json.decode<{ outfit: OutfitDto | undefined }>(res.data).outfit;
		} else {
			CoreLogger.Error("failed to load user outfit: " + (res.error ?? "Empty Data"));
		}
	}

	public async CreateAvatarOutfit(outfit: OutfitCreateDto) {
		this.Log("CreateAvatarOutfit: " + this.GetHttpUrl(`outfits`) + " data: " + json.encode(outfit));
		let res = InternalHttpManager.PostAsync(this.GetHttpUrl(`outfits`), json.encode(outfit));
		if (res.success) {
			this.Log("CREATED OUTFIT: " + res.data);
			return json.decode<{ outfit: OutfitDto }>(res.data).outfit;
		} else {
			CoreLogger.Error("Error creating outfit: " + res.error);
		}
	}

	public async EquipAvatarOutfit(outfitId: string) {
		this.Log("EquipAvatarOutfit");
		let res = InternalHttpManager.PostAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}/equip`));
		if (res.success) {
			this.Log("EQUIPPED OUTFIT: " + res.data);
		} else {
			CoreLogger.Error("Failed to equip outfit: " + res.error);
		}
	}

	public async GetAccessories() {
		let res = InternalHttpManager.GetAsync(this.GetHttpUrl(`accessories/self`));
		if (res.success) {
			//this.Log("Got acc: " + res.data);
			return json.decode<ClothingInstanceDto[]>(res.data);
		} else {
			CoreLogger.Error("Unable to load avatar items for user");
		}
	}

	public async CreateDefaultAvatarOutfit(equipped: boolean, outfitId: string, name: string, skinColor: Color) {
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
			accessories: accessorUUIDs,
			equipped: equipped,
			owner: ownerId,
			skinColor: ColorUtil.ColorToHex(skinColor),
		};
		return this.CreateAvatarOutfit(outfit);
	}

	public async RenameOutfit(outfitId: string, newName: string) {
		this.Log("RenameOutfitAccessories");
		return this.UpdateOutfit(outfitId, {
			name: newName,
		});
	}

	public async SaveOutfitAccessories(outfitId: string, skinColor: string, instanceIds: string[]) {
		this.Log("SaveOutfitAccessories");
		return this.UpdateOutfit(outfitId, {
			accessories: instanceIds,
			skinColor: skinColor,
		});
	}

	private UpdateOutfit(outfitId: string, update: Partial<OutfitPatch>) {
		let res = InternalHttpManager.PatchAsync(this.GetHttpUrl(`outfits/outfit-id/${outfitId}`), json.encode(update));
		if (res.success) {
			return json.decode<{ outfit: OutfitDto }>(res.data).outfit;
		} else {
			CoreLogger.Error("Error Updating Outfit: " + res.data);
		}
	}

	public async LoadImage(fileId: string) {
		let res = InternalHttpManager.GetAsync(this.GetImageUrl(fileId));
		if (res.success) {
			return json.decode<ClothingInstanceDto[]>(res.data);
		} else {
			CoreLogger.Error("Error loading image: " + res.error);
		}
	}

	public async UploadItemImage(classId: string, resourceId: string, filePath: string, fileSize: number) {
		const imageId = await this.UploadImage(resourceId, filePath, fileSize);
		if (imageId === "" || imageId === undefined) {
			return;
		}
		this.Log("Updating item with new image");
		let res = InternalHttpManager.PatchAsync(
			this.GetHttpUrl(`accessories/class-id/${classId}`),
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

	public async UploadImage(resourceId: string, filePath: string, fileSize: number): Promise<string> {
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
