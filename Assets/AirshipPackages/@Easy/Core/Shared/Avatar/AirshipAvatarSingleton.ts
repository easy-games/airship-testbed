import { Airship } from "../Airship";
import { OutfitDto } from "../Airship/Types/Outputs/AirshipPlatformInventory";
import { InternalClothingMeta } from "../Airship/Util/InternalClothingMeta";
import { Singleton } from "../Flamework";
import { ColorUtil } from "../Util/ColorUtil";
import inspect from "../Util/Inspect";
/**
 * Access using {@link Airship.Avatar}. Avatar singleton provides utilities for working with visual elements of a character
 *
 * Can be used to load outfits from the server
 */
@Singleton()
export class AirshipAvatarSingleton {
	constructor() {
		Airship.Avatar = this;
	}

	/**
	 * Load a default outfit onto the character so they aren't naked
	 * @param builder accessory builder for character
	 */
	private LoadDefaultOutfit(builder: AccessoryBuilder) {
		error("//todo: LoadDefaultOutfit");
		// if (AvatarCollectionManager.instance.defaultOutfit) {
		// 	builder.EquipAccessoryOutfit(AvatarCollectionManager.instance.defaultOutfit, true);
		// }
	}

	// /**
	//  * Load the equipped outfit of a user into the accessory builder
	//  * @param userId target userId
	//  * @param builder accessory builder for character
	//  * @param options optional params
	//  */
	// public LoadOutfitByUserId(
	// 	userId: string,
	// 	builder: AccessoryBuilder,
	// 	options: { removeOldClothingAccessories?: boolean; updateViewmodel?: boolean } = {},
	// ) {
	// 	Protected.Avatar.GetUserEquippedOutfit(userId).then((outfit) => {
	// 		if (outfit) {
	// 			this.LoadOutfit(builder, outfit, options);

	// 			if (options.updateViewmodel && Airship.Characters.viewmodel) {
	// 				this.LoadOutfit(Airship.Characters.viewmodel.accessoryBuilder, outfit, options);
	// 			}
	// 		}
	// 	});
	// }

	// /**
	//  * If this character has a Player it will load that players equipped outfit
	//  * @param character character with an accessory builder on it
	//  * @param builder accessory builder for character
	//  * @param options optional params
	//  */
	// public LoadOutfitByPlayer(
	// 	player: Player,
	// 	builder: AccessoryBuilder,
	// 	options: {
	// 		removeOldClothingAccessories?: boolean;
	// 		combineMeshes?: boolean;
	// 	},
	// ) {
	// 	this.LoadOutfitByUserId(player.userId, builder, options);
	// }

	// /**
	//  * If this character has a Player it will load that players equipped outfit
	//  * @param character character with an accessory builder on it
	//  * @param options optional params
	//  */
	// public LoadOutfitByCharacter(
	// 	character: Character,
	// 	options: {
	// 		removeOldClothingAccessories?: boolean;
	// 		combineMeshes?: boolean;
	// 	},
	// ) {
	// 	if (!character.player) {
	// 		return;
	// 	}
	// 	if (!character.accessoryBuilder) {
	// 		warn("Cannot load outfit without Accessory Builder set on Character.");
	// 		return;
	// 	}
	// 	this.LoadOutfitByUserId(character.player.userId, character.accessoryBuilder, options);
	// }

	/**
	 * Gets the equipped outfit for your local logged in character
	 * @param builder accessory builder for character
	 * @param options optional params
	 */
	// public LoadLocalPlayerOutfit(
	// 	builder: AccessoryBuilder,
	// 	options: {
	// 		removeOldClothingAccessories?: boolean;
	// 		combineMeshes?: boolean;
	// 	} = {},
	// ) {
	// 	Protected.Avatar.GetEquippedOutfit().then((outfitDto) => {
	// 		if (!outfitDto) {
	// 			// warn("Unable to load users default outfit. Equipping baked default outfit");
	// 			this.LoadDefaultOutfit(builder);
	// 			if (Airship.Characters.viewmodel) {
	// 				this.LoadDefaultOutfit(Airship.Characters.viewmodel.accessoryBuilder);
	// 			}
	// 			return;
	// 		}
	// 		this.LoadOutfit(builder, outfitDto, options);
	// 		if (Airship.Characters.viewmodel) {
	// 			this.LoadOutfit(Airship.Characters.viewmodel.accessoryBuilder, outfitDto, options);
	// 		}
	// 	});
	// }

	/**
	 * Load an outfit onto an accessory builder.
	 *
	 * **Note: if used on a character, this will not persist across respawns**. If you're using a character, it's recommended to use `character.LoadOutfit()`
	 *
	 * @param builder accessory builder for character
	 * @param outfit  outfit from server
	 * @param options optional params
	 */
	public async LoadOutfit(
		builder: AccessoryBuilder,
		outfit: OutfitDto,
		options: { removeOldClothingAccessories?: boolean } = {},
	) {
		print("Loading outfit: " + inspect(outfit) + " " + debug.traceback());
		if (options.removeOldClothingAccessories) {
			// builder.RemoveClothingAccessories();
		}

		// Download clothing in parallel with Promise.all
		let promises: Promise<void>[] = [];
		for (let clothingDto of outfit.accessories) {
			promises.push(
				new Promise((resolve) => {
					const meta = InternalClothingMeta.get(clothingDto.class.classId);
					if (!meta) return;

					// todo: why are we returning if first person?
					if (builder.firstPerson) return;

					const clothing = Clothing.DownloadYielding(clothingDto.class.classId, meta.airId);
					if (clothing) {
						if (clothing.accessoryPrefabs && clothing.accessoryPrefabs.size() > 0) {
							for (let accessoryPrefab of clothing.accessoryPrefabs) {
								builder.Add(accessoryPrefab);
							}
						}
						if (clothing.face) {
							builder.SetFaceTexture(clothing.face.decalTexture);
						}
					}
					resolve();
				}),
			);
		}
		await Promise.all(promises);

		builder.SetSkinColor(ColorUtil.HexToColor(outfit.skinColor));
		builder.UpdateCombinedMesh();
	}

	public async GetUserEquippedOutfitDto(userId: string): Promise<OutfitDto | undefined> {
		return new Promise((resolve) => {
			const outfit = contextbridge.invoke("Avatar:GetUserEquippedOutfitDto", LuauContext.Protected, userId);
			print("got outfit from contextbridge: " + inspect(outfit));
			resolve(outfit);
		});
	}
}
