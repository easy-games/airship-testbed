import { Airship } from "../Airship";
import { OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { Singleton } from "../Flamework";
import { ColorUtil } from "../Util/ColorUtil";
import { AvatarCollectionManager } from "./AvatarCollectionManager";
import { AvatarPlatformAPI } from "./AvatarPlatformAPI";

/**
 * Access using {@link Airship.Avatar}. Avatar singleton provides utilities for working with visual elements of a character
 *
 * Can be used to load outfits from the server
 */
@Singleton()
export class AirshipAvatarSingleton {
	constructor() {
		Airship.Avatar = this;
		new AvatarCollectionManager();
	}

	/**
	 * Gets the equipped outfit for your local logged in character
	 * @param builder accessory builder for character
	 * @param options optional params
	 */
	public LoadEquippedUserOutfit(
		builder: AccessoryBuilder,
		options: {
			removeOldClothingAccessories?: boolean;
			combineMeshes?: boolean;
		} = {},
	) {
		AvatarPlatformAPI.GetEquippedOutfit().then((outfitDto) => {
			if (!outfitDto) {
				// warn("Unable to load users default outfit. Equipping baked default outfit");
				this.LoadDefaultOutfit(builder);
				return;
			}
			this.LoadUserOutfit(outfitDto, builder, options);
		});
	}

	/**
	 * Load a default outfit onto the character so they aren't nakey
	 * @param builder accessory builder for character
	 */
	public LoadDefaultOutfit(builder: AccessoryBuilder) {
		if (AvatarCollectionManager.instance.defaultOutfit) {
			builder.EquipAccessoryOutfit(AvatarCollectionManager.instance.defaultOutfit, true);
		}
	}

	/**
	 * Load the equipped outfit of a user into the accessory builder
	 * @param userId target userId
	 * @param builder accessory builder for character
	 * @param options optional params
	 */
	public LoadUsersEquippedOutfit(
		userId: string,
		builder: AccessoryBuilder,
		options: { removeOldClothingAccessories?: boolean } = {},
	) {
		AvatarPlatformAPI.GetUserEquippedOutfit(userId).then((outfit) => {
			if (outfit) {
				this.LoadUserOutfit(outfit, builder, options);
			}
		});
	}

	/**
	 * Load an outfit into the accessory builder
	 * @param outfit  outfit from server
	 * @param builder accessory builder for character
	 * @param options optional params
	 */
	public LoadUserOutfit(
		outfit: OutfitDto,
		builder: AccessoryBuilder,
		options: { removeOldClothingAccessories?: boolean } = {},
	) {
		if (options.removeOldClothingAccessories) {
			builder.RemoveClothingAccessories(false);
		}
		outfit.accessories.forEach((acc) => {
			const accComponentTemplate = AvatarCollectionManager.instance.GetAccessoryFromClassId(acc.class.classId);
			if (accComponentTemplate) {
				let accComponent = builder.AddSingleAccessory(accComponentTemplate, false);
				if (accComponent?.AccessoryComponent) {
					accComponent.AccessoryComponent.SetInstanceId(acc.instanceId);
				} else {
					warn("Unable to find accessory with class ID: " + acc.class.classId);
				}
			} else {
				const face = AvatarCollectionManager.instance.GetAccessoryFaceFromClassId(acc.class.classId);
				if (face?.decalTexture) {
					builder.SetFaceTexture(face.decalTexture);
				} else {
					warn("Unable to find accessory with class ID: " + acc.class.classId);
				}
			}
		});
		builder.SetSkinColor(ColorUtil.HexToColor(outfit.skinColor), false);
		builder.TryCombineMeshes();
	}
}
