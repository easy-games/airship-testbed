import { Service, OnStart } from "@easy-games/flamework-core";
import { Result } from "Shared/Types/Result";

/**
 * Allows management of platform inventory for a player. These functions manipluate a persistent inventory
 * that the player owns. Items, Accessories, and Profile Pictures are all managed by this inventory and the
 * configurations must be registered on the https://create.airship.gg website.
 *
 * It is **_NOT_** recommended to use this inventory system for things like a game economy or persisting game
 * inventory between servers. This inventory is meant to be used for items, accessories, and profile pictures that
 * may have real money value or that players may wish to trade or sell outside of the game. This inventory is the
 * way that the game can interact with the wider platform economy.
 *
 * Some examples of potential items to include in this inventory:
 * - Weapon skins
 * - Playable characters
 * - Trading cards
 * - Content purchased with real money
 * - Content that players may want to trade or sell to other players
 */
@Service({})
export class PlatformInventoryService implements OnStart {
	OnStart(): void {}

	/**
	 * Grants a user the provided item.
	 */
	public async GrantItem(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.GrantItem("");

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Grants a user the provided accessory.
	 */
	public async GrantAccessory(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.GrantAccessory("");

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Grants a user the provided profile picture.
	 */
	public async GrantProfilePicture(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.GrantProfilePicture("");

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Deletes the given item instance from the users inventory.
	 */
	public async DeleteItem(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.DeleteItem();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Deletes the given accessory instance from the users inventory.
	 */
	public async DeleteAccessory(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.DeleteAccessory();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Deletes a the given profile picture instance from the users inventory.
	 */
	public async DeleteProfilePicture(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.DeleteProfilePicture();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Checks if the user has and instance of the given item class.
	 */
	public async HasItem(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.HasItem();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Checks if the user has an instance of the given accessory class.
	 */
	public async HasAccessory(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.HasAccessory();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Checks if the user has an instance of the given profile picture class.
	 */
	public async HasProfilePicture(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.HasProfilePicture();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Gets all items in a users inventory.
	 */
	public async GetItems(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.GetItems();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Gets all accessories in a users inventory.
	 */
	public async GetAccessories(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.GetAccessories();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Gets all profile pictures in a users inventory.
	 */
	public async GetProfilePictures(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.GetProfilePictures();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Gets the users currently equipped outfit.
	 */
	public async GetEquippedOutfit(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.GetEquippedOutfit();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}

	/**
	 * Performs a trade between two players. Trades are atomic, if the transaction does not succeed, no
	 * items are lost or modified.
	 *
	 * @param user1 The first user and items from their inventory that will be traded to the second user.
	 * @param user2 The second user and items from their inventory that will be traded to the first user.
	 */
	public async PerformTrade(
		user1: { uid: string; itemInstanceIds: string[] },
		user2: { uid: string; itemInstanceIds: string[] },
	): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryServiceBackend.PerformTrade();

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n${res.data}`);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: undefined,
		};
	}
}
