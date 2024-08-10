import { AuthController } from "@Easy/Core/Client/ProtectedControllers/Auth/AuthController";
import { AccessoryClass } from "../Airship/Types/Outputs/AirshipPlatformInventory";
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

		let i = 0;
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

	private DownloadOwnedAccessories() {
		CoreLogger.Log("Downloading owned accessories");
		AvatarPlatformAPI.GetAccessories().then((acc) => {
			if (acc) {
				acc.forEach((itemData) => {
					this.allAvatarClasses.set(itemData.class.classId, itemData.class);
					//print("Possible item " + itemData.class.name + ": " + itemData.class.classId);
					let item = this.allAvatarAccessories.get(itemData.class.classId);
					let foundMatchingItem = false;
					if (item) {
						this.AddAvailableAvatarItem(itemData.instanceId, item);
						foundMatchingItem = true;
					} else {
						let faceItem = this.allAvatarFaces.get(itemData.class.classId);
						if (faceItem) {
							faceItem.serverInstanceId = itemData.instanceId;
							this.AddAvailableFaceItem(faceItem);
							foundMatchingItem = true;
						}
					}

					if (!foundMatchingItem) {
						// CoreLogger.Log("Unpaired Server Item " + itemData.class.name + ": " + itemData.class.classId);
					}
				});
			}
		});
	}

	private InitUserOutfits(userId: string) {
		AvatarPlatformAPI.GetAllOutfits().then((outfits) => {
			const maxNumberOfOutfits = 5;
			const numberOfOutfits = outfits ? outfits.size() : 0;
			let name = "";
			//Create missing outfits up to 5
			for (let i = numberOfOutfits; i < maxNumberOfOutfits; i++) {
				name = "Default" + i;
				print("Creating missing outfit: " + name);
				let outfit = AvatarPlatformAPI.CreateDefaultAvatarOutfit(
					userId,
					name,
					name,
					RandomUtil.FromArray(this.skinColors),
				);
				if (!outfit) {
					error("Unable to make a new outfit :(");
				}
			}
			//Make sure an outfit is equipped
			if (!outfits || outfits.size() === 0 || AvatarPlatformAPI.GetEquippedOutfit() === undefined) {
				AvatarPlatformAPI.EquipAvatarOutfit(name);
			}
		});
	}

	private AddAvailableAvatarItem(instanceId: string, item: AccessoryComponent) {
		const slotNumber: number = item.GetSlotNumber();
		let items = this.ownedAvatarAccessories.get(slotNumber);
		if (!items) {
			//print("making new items for slot: " + slotNumber);
			items = [];
		}
		items.push({ instanceId: instanceId, item: item });
		//print("setting item slot " + slotNumber + " to: " + item.ToString());
		this.ownedAvatarAccessories.set(slotNumber, items);
	}

	private AddAvailableFaceItem(item: AccessoryFace) {
		this.ownedAvatarFaces.push(item);
	}

	/**
	 * @internal
	 */
	public DownloadAllAccessories(onComplete: () => void) {
		Dependency<AuthController>()
			.WaitForAuthed()
			.then(() => {
				//Get all owned accessories and map them to usable values
				this.DownloadOwnedAccessories();
				this.InitUserOutfits(Game.localPlayer.userId);
				onComplete();
			});
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
