import { AuthController } from "@Easy/Core/Client/ProtectedControllers/Auth/AuthController";
import { AccessoryClass, AccessoryInstanceDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { Dependency } from "../Flamework";
import { Game } from "../Game";
import { CoreLogger } from "../Logger/CoreLogger";
import { RandomUtil } from "../Util/RandomUtil";
import { AvatarPlatformAPI } from "./AvatarPlatformAPI";

export class AvatarCollectionManager {
	private readonly allAvatarAccessories = new Map<string, AccessoryComponent>();
	private readonly allAvatarFaces = new Map<string, AccessoryFace>();
	private readonly allAvatarClasses = new Map<string, AccessoryClass>();
	private readonly ownedAvatarAccessories = new Map<
		AccessorySlot,
		{ instanceId: string; item: AccessoryComponent }[]
	>();
	private readonly ownedAvatarFaces: AccessoryFace[] = [];
	private readonly avatarSkinAccessories: AccessorySkin[] = [];

	public defaultOutfit: AccessoryOutfit | undefined;

	public readonly skinColors: Color[] = [];

	public static instance: AvatarCollectionManager;

	constructor() {
		if (AvatarCollectionManager.instance) {
			warn("Trying to initialize a second collection manager");
			return;
		}
		AvatarCollectionManager.instance = this;

		//Load avatar accessories
		let avatarCollection = AssetBridge.Instance.LoadAsset<AvatarAccessoryCollection>(
			"AirshipPackages/@Easy/Core/Prefabs/Accessories/AvatarItems/EntireAvatarCollection.asset",
		);

		// print("Found avatar collection: " + avatarCollection);
		for (let i = 0; i < avatarCollection.accessories.Length; i++) {
			const element = avatarCollection.accessories.GetValue(i);
			if (!element) {
				CoreLogger.Warn("Empty element in avatar generalAccessories collection: " + i);
				continue;
			}
			const classId = element.GetServerClassId();
			if (!classId) continue;
			//print("Found avatar item: " + element.ToString());
			this.allAvatarAccessories.set(element.GetServerClassId(), element);
		}

		if (this.allAvatarFaces.size() === 0) {
			for (let i = 0; i < avatarCollection.faces.Length; i++) {
				const element = avatarCollection.faces.GetValue(i);
				if (!element) {
					CoreLogger.Warn("Empty element in avatar generalAccessories collection: " + i);
					continue;
				}
				const classId = element.GetServerClassId();
				if (!classId) continue;
				//print("Found avatar item: " + element.ToString());
				this.allAvatarFaces.set(element.GetServerClassId(), element);
			}
		}

		for (let i = 0; i < avatarCollection.skinColors.Length; i++) {
			const element = avatarCollection.skinColors.GetValue(i);
			this.skinColors.push(element);
		}

		//Print all of the mapped accessories
		// for (const [key, value] of this.avatarAccessories) {
		// 	print("Loaded Avatar ACC: " + tostring(key) + ", " + value.size());
		// 	for (let i = 0; i < value.size(); i++) {
		// 		print("Acc " + i + ": " + value[i].ToString());
		// 	}
		// }
	}

	private AddAvailableAvatarItem(itemDto: AccessoryInstanceDto, item: AccessoryComponent) {
		//print("Adding item: " + itemDto.class.name + " test: " + item.name);
		const slotNumber: number = item.GetSlotNumber();
		let items = this.ownedAvatarAccessories.get(slotNumber);
		if (!items) {
			//print("making new items for slot: " + slotNumber);
			items = [];
		}
		items.push({ instanceId: itemDto.instanceId, item: item });

		if (itemDto.class.name === "Tanktop") {
			AvatarPlatformAPI.defaultShirt = itemDto;
		} else if (itemDto.class.name === "Jeans Shorts_legs") {
			AvatarPlatformAPI.defaultPants = itemDto;
		} else if (itemDto.class.name === "Cool Sneaks") {
			AvatarPlatformAPI.defaultShoes = itemDto;
		}
		//print("setting item slot " + slotNumber + " to: " + item.ToString());
		this.ownedAvatarAccessories.set(slotNumber, items);
	}

	private AddAvailableFaceItem(itemDto: AccessoryInstanceDto, item: AccessoryFace) {
		//print("Adding face: " + itemDto.class.name + " test: " + item.name);
		if (itemDto.class.name === "Face Simple 01" || itemDto.class.name === "FaceDecalSimple01") {
			AvatarPlatformAPI.defaultFace = itemDto;
		}
		this.ownedAvatarFaces.push(item);
	}

	/**
	 * @internal
	 */
	public async DownloadAllAccessories() {
		await Dependency<AuthController>().WaitForAuthed();

		//Get all owned accessories and map them to usable values
		CoreLogger.Log("Downloading owned accessories");
		let acc = await AvatarPlatformAPI.GetAccessories();
		if (acc) {
			acc.forEach((itemData) => {
				this.allAvatarClasses.set(itemData.class.classId, itemData.class);
				//print("Possible item " + itemData.class.name + ": " + itemData.class.classId);
				let item = this.allAvatarAccessories.get(itemData.class.classId);
				let foundMatchingItem = false;
				if (item) {
					this.AddAvailableAvatarItem(itemData, item);
					foundMatchingItem = true;
				} else {
					let faceItem = this.allAvatarFaces.get(itemData.class.classId);
					if (faceItem) {
						faceItem.serverInstanceId = itemData.instanceId;
						this.AddAvailableFaceItem(itemData, faceItem);
						foundMatchingItem = true;
					}
				}

				if (!foundMatchingItem) {
					// CoreLogger.Log("Unpaired Server Item " + itemData.class.name + ": " + itemData.class.classId);
				}
			});
		}

		//Load the outfits
		let outfits = await AvatarPlatformAPI.GetAllOutfits();
		const maxNumberOfOutfits = 5;
		const numberOfOutfits = outfits ? outfits.size() : 0;
		let name = "";
		let equippedOutfitId = "";
		let firstOutfit = true;
		//Create missing outfits up to 5
		for (let i = numberOfOutfits; i < maxNumberOfOutfits; i++) {
			name = "Default" + i;
			print("Creating missing outfit: " + name);
			let outfit = await AvatarPlatformAPI.CreateDefaultAvatarOutfit(
				firstOutfit,
				name,
				name,
				RandomUtil.FromArray(this.skinColors),
			);
			if (!outfit) {
				error("Unable to make a new outfit :(");
			}else if(firstOutfit){
				firstOutfit = false;
				equippedOutfitId = outfit.outfitId;
			}
		}
		//Make sure an outfit is equipped
		if (equippedOutfitId !== "" && (await AvatarPlatformAPI.GetEquippedOutfit()) === undefined) {
			print("Setting equipped outfit: " + equippedOutfitId);
			await AvatarPlatformAPI.EquipAvatarOutfit(equippedOutfitId);
		}
	}

	/**
	 * @internal
	 */
	public GetClass(classId: string) {
		return this.allAvatarClasses.get(classId);
	}

	/**
	 * @internal
	 */
	public GetClassThumbnailUrl(classId: string) {
		const classData = this.GetClass(classId);
		if (classData) {
			return AvatarPlatformAPI.GetImageUrl(classData.imageId);
		}
		return "";
	}

	/**
	 * @internal
	 */
	public GetAllAvatarItems(slotType: AccessorySlot) {
		//print("Getting slot " + tostring(slotType) + " size: " + this.avatarAccessories.get(slotType)?.size());
		return this.ownedAvatarAccessories.get(slotType);
	}

	/**
	 * @internal
	 */
	public GetAllAvatarFaceItems() {
		return this.ownedAvatarFaces;
	}

	/**
	 * @internal
	 */
	public GetAllAvatarSkins() {
		return this.avatarSkinAccessories;
	}

	/**
	 * @internal
	 */
	public GetAllPossibleAvatarItems() {
		return this.allAvatarAccessories;
	}

	/**
	 * @internal
	 */
	public GetAccessoryFromClassId(classId: string) {
		return this.allAvatarAccessories.get(classId);
	}

	/**
	 * @internal
	 */
	public GetAccessoryFaceFromClassId(classId: string) {
		return this.allAvatarFaces.get(classId);
	}
}
