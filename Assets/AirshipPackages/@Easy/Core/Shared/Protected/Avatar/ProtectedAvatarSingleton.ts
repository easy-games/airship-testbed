import { AuthController } from "@Easy/Core/Client/ProtectedControllers/Auth/AuthController";
import { Dependency, Singleton } from "../../Flamework";
import { Game } from "../../Game";
import { HttpRetryInstance } from "../../Http/HttpRetry";
import { CoreLogger } from "../../Logger/CoreLogger";
import { Protected } from "../../Protected";
import { AirshipUrl } from "../../Util/AirshipUrl";
import { ColorUtil } from "../../Util/ColorUtil";
import { RandomUtil } from "../../Util/RandomUtil";
import { Signal } from "../../Util/Signal";
import { ContentServiceClient, ContentServiceOutfits } from "../../TypePackages/content-service-types";
import { isUnityMakeRequestError, UnityMakeRequest } from "../../TypePackages/UnityMakeRequest";
import { AirshipGearItem, AirshipOutfit, GearClothingSubcategory } from "../../Airship/Types/AirshipPlatformInventory";

const contentServiceClient = new ContentServiceClient(UnityMakeRequest(AirshipUrl.ContentService));

@Singleton()
export class ProtectedAvatarSingleton {
	private isLoadingInventory = false;
	public isInventoryLoaded = false;
	public onInventoryLoaded = new Signal();

	public outfits: AirshipOutfit[] = [];
	public ownedClothing: AirshipGearItem[] = [];
	public equippedOutfit: AirshipOutfit | undefined;

	private readonly httpRetry = HttpRetryInstance();

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

		contextbridge.callback("Avatar:GetUserEquippedOutfitDto", (from, userId: string) => {
			let isSelf = Game.IsClient() && userId === Protected.User.localUser?.uid;
			// Hack for editor
			if (Game.IsEditor() && !Game.IsClone() && userId.size() <= 2) {
				isSelf = true;
			}

			if (isSelf) {
				const outfit = this.GetEquippedOutfit().expect();
				return outfit;
			} else {
				const outfit = this.GetUserEquippedOutfit(userId).expect();
				return outfit;
			}
		});

		task.spawn(() => {
			this.LoadInventory();
		});
	}

	private async LoadInventory(): Promise<void> {
		if (this.isInventoryLoaded) return;
		if (this.isLoadingInventory) {
			Debug.LogWarning("Tried to load inventory when already loading.");
			return;
		}

		await Dependency<AuthController>().WaitForAuthed();
		Protected.User.WaitForLocalUser();

		const promises: Promise<void>[] = [];

		let loadedOutfitFromBackend: AirshipOutfit | undefined;

		// Get all owned clothing and map them to usable values
		promises.push(
			new Promise(async (resolve) => {
				this.Log("Downloading owned clothing...");
				let clothingData = await Protected.Avatar.GetGear();
				this.Log("Owned clothing count: " + (clothingData?.size() ?? 0));
				if (clothingData) {
					// this.Log("Owned clothing sample: " + inspect(clothingData[0]));
					this.ownedClothing = clothingData;

					// for (let c of clothingData) {
					// 	if (c.class.gear.airAssets.size() > 0) {
					// 		print("Found gear with airAssets: " + inspect(c));
					// 	}
					// }
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

				// Create missing outfits up to 5
				for (let i = numberOfOutfits; i < maxNumberOfOutfits; i++) {
					name = "Outfit " + (i + 1);
					// let outfitId = "Outfit" + i;
					print("Creating missing outfit: " + name);

					// Need to wait for owned clothing to populate (promise is running parallel to this)
					while (this.ownedClothing === undefined) {
						task.wait();
					}

					let outfit = await Protected.Avatar.CreateDefaultAvatarOutfit(
						name,
						ColorUtil.HexToColor(RandomUtil.FromArray(this.skinColors)),
					);
					if (!outfit) {
						error("Unable to make a new outfit.");
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

	public GetImageUrl(imageId: string) {
		return `${AirshipUrl.CDN}/images/${imageId}.png`;
	}

	public async GetAllOutfits(): Promise<AirshipOutfit[] | undefined> {
		return await contentServiceClient.outfits.getOutfits();
	}

	public async GetEquippedOutfit(): Promise<AirshipOutfit | undefined> {
		try {
			const result = await contentServiceClient.outfits.getActiveOutfit();
			return result.outfit;
		} catch (err) {
			if (isUnityMakeRequestError(err)) {
				CoreLogger.Error("failed to load user equipped outfit: " + (err.message ?? "Empty Data"));
			}
			throw err;
		}
	}

	public async GetUserEquippedOutfit(userId: string): Promise<AirshipOutfit | undefined> {
		try {
			const result = await contentServiceClient.outfits.getUserActiveOutfit({ uid: userId });
			return result.outfit;
		} catch (err) {
			if (isUnityMakeRequestError(err)) {
				CoreLogger.Error("failed to load users equipped outfit: " + (err.message ?? "Empty Data"));
			}
			throw err;
		}
	}

	public async GetAvatarOutfit(outfitId: string): Promise<AirshipOutfit | undefined> {
		try {
			const result = await contentServiceClient.outfits.getOutfit({ outfitId });
			return result.outfit;
		} catch (err) {
			if (isUnityMakeRequestError(err)) {
				CoreLogger.Error("failed to load user outfit: " + (err.message ?? "Empty Data"));
			}
			throw err;
		}
	}

	public async CreateAvatarOutfit(outfit: ContentServiceOutfits.CreateOutfitDto) {
		try {
			const result = await contentServiceClient.outfits.createOutfit(outfit);
			return result.outfit;
		} catch (err) {
			if (isUnityMakeRequestError(err)) {
				CoreLogger.Error("Error creating outfit: " + err.message);
			}
			throw err;
		}
	}

	public async EquipAvatarOutfit(outfitId: string) {
		try {
			await contentServiceClient.outfits.loadOutfit({ outfitId });
		} catch (err) {
			if (isUnityMakeRequestError(err)) {
				CoreLogger.Error("Failed to equip outfit: " + err.message);
			}
			throw err;
		}
	}

	public async GetGear() {
		return await contentServiceClient.gear.getUserGear();
	}

	public async CreateDefaultAvatarOutfit(name: string, skinColor: Color) {
		let accessoryInstanceIds: string[] = [];

		let defaultAccessoryClassIds = [
			"320fc23c-82fb-40dd-84dc-79cba582d431", // Face
			// "3def9a06-13f2-4abe-b12f-69e468dd05a5", // Skull Hoodie
			// "c7363912-17e6-4713-b4de-113549f9356e", // Jeans Pants
			// "30d05506-7e13-4bb8-b515-dc674d96a159", // Hair
		];

		for (let classId of defaultAccessoryClassIds) {
			const found = this.ownedClothing.find((g) => g.class.classId === classId);
			if (found) {
				accessoryInstanceIds.push(found.instanceId);
			}
		}

		let outfit: ContentServiceOutfits.CreateOutfitDto = {
			name: name,
			gear: accessoryInstanceIds,
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
			gear: instanceIds,
			skinColor: skinColor,
		});
	}

	private UpdateOutfit(outfitId: string, update: ContentServiceOutfits.UpdateOutfitDto) {
		try {
			return contentServiceClient.outfits.updateOutfit({ data: update, params: { outfitId } }).expect().outfit;
		} catch (err) {
			if (isUnityMakeRequestError(err)) {
				CoreLogger.Error("Error Updating Outfit: " + err.message);
			}
			throw err;
		}
	}

	// todo: what?
	// public async LoadImage(fileId: string) {
	// 	let res = await this.httpRetry(() => InternalHttpManager.GetAsync(this.GetImageUrl(fileId)), "loadImage");
	// 	if (res.success) {
	// 		return json.decode<GearInstanceDto[]>(res.data);
	// 	} else {
	// 		CoreLogger.Error("Error loading image: " + res.error);
	// 	}
	// }

	public async UploadItemImage(classId: string, resourceId: string, filePath: string, fileSize: number) {
		const imageId = await this.UploadImage(resourceId, filePath, fileSize);
		if (imageId === "" || imageId === undefined) {
			return;
		}
		try {
			await contentServiceClient.itemClasses.updateClassForResource({
				params: {
					classId,
				},
				data: {
					imageId,
				},
			});
		} catch (err) {
			CoreLogger.Error("Unable to update item " + classId + " with new image: " + imageId);
			throw err;
		}
	}

	public async UploadImage(resourceId: string, filePath: string, fileSize: number): Promise<string> {
		try {
			const { url, imageId } = await contentServiceClient.images.createImage({
				contentType: "image/png",
				contentLength: fileSize,
				resourceId,
				namespace: "items",
			});
			this.Log("Got image url: " + url);
			const uploadRes = await this.httpRetry(
				() => InternalHttpManager.PutImageAsync(url, filePath),
				"uploadImagePut",
			);
			if (uploadRes.success) {
				this.Log("UPLOAD COMPLETE: " + url);
			} else {
				CoreLogger.Error("Error Uploading item image: " + uploadRes.error);
			}

			return imageId;
		} catch (err) {
			if (isUnityMakeRequestError(err)) {
				CoreLogger.Error("Error getting item image resource: " + err.message);
			}
			return "";
		}
	}

	// This is super gross... But I think it's needed. AccessorySlot is a const enum which makes reverse mapping impossible.
	// We don't want to make subcategories use AccessorySlot directly because it might limit either subcategories or accessory slots.
	public GearClothingSubcategoryToSlot(slot: string): AccessorySlot {
		switch (slot) {
			case GearClothingSubcategory.Head:
				return AccessorySlot.Head;
			case GearClothingSubcategory.Hair:
				return AccessorySlot.Hair;
			case GearClothingSubcategory.Face:
				return AccessorySlot.Face;
			case GearClothingSubcategory.Neck:
				return AccessorySlot.Neck;
			case GearClothingSubcategory.Torso:
				return AccessorySlot.Torso;
			case GearClothingSubcategory.Legs:
				return AccessorySlot.Legs;
			case GearClothingSubcategory.Feet:
				return AccessorySlot.Feet;
			case GearClothingSubcategory.Backpack:
				return AccessorySlot.Backpack;
			case GearClothingSubcategory.Waist:
				return AccessorySlot.Waist;
			case GearClothingSubcategory.Hands:
				return AccessorySlot.Hands;
			case GearClothingSubcategory.LeftHand:
				return AccessorySlot.LeftHand;
			case GearClothingSubcategory.RightHand:
				return AccessorySlot.RightHand;
			case GearClothingSubcategory.Ears:
				return AccessorySlot.Ears;
			case GearClothingSubcategory.Nose:
				return AccessorySlot.Nose;
			default:
				warn("unknown GearClothingSubcategory mapping: " + slot);
				return AccessorySlot.Root;
		}
	}

	// This is gross.. for more info read above comment on GearClothingSubcategoryToSlot
	public AccessorySlotToClothingSubcategory(slot: AccessorySlot): GearClothingSubcategory {
		switch (slot) {
			case AccessorySlot.Root:
				return GearClothingSubcategory.Head;
			case AccessorySlot.Hair:
				return GearClothingSubcategory.Hair;
			case AccessorySlot.Head:
				return GearClothingSubcategory.Head;
			case AccessorySlot.Face:
				return GearClothingSubcategory.Face;
			case AccessorySlot.Neck:
				return GearClothingSubcategory.Neck;
			case AccessorySlot.Torso:
				return GearClothingSubcategory.Torso;
			case AccessorySlot.Legs:
				return GearClothingSubcategory.Legs;
			case AccessorySlot.Feet:
				return GearClothingSubcategory.Feet;
			case AccessorySlot.Backpack:
				return GearClothingSubcategory.Backpack;
			case AccessorySlot.Waist:
				return GearClothingSubcategory.Waist;
			case AccessorySlot.Hands:
				return GearClothingSubcategory.Hands;
			case AccessorySlot.LeftHand:
				return GearClothingSubcategory.LeftHand;
			case AccessorySlot.RightHand:
				return GearClothingSubcategory.RightHand;
			case AccessorySlot.Ears:
				return GearClothingSubcategory.Ears;
			case AccessorySlot.Nose:
				return GearClothingSubcategory.Nose;
			default:
				warn("unknown AccessorySlot mapping: " + slot);
				return GearClothingSubcategory.Root;
		}
	}
}
