import { Service, OnStart } from "Shared/Flamework";
import { Platform } from "Shared/Airship";
import { ItemQueryParameters } from "Shared/Airship/Types/Inputs/PlatformInventory";
import {
	AccessoryInstance,
	EquippedProfilePicture,
	ItemInstance,
	Outfit,
	ProfilePictureInstance,
	Transaction,
} from "Shared/Airship/Types/Outputs/PlatformInventory";
import { Result } from "Shared/Types/Result";
import { RunUtil } from "Shared/Util/RunUtil";
import { DecodeJSON, EncodeJSON } from "Shared/json";

@Service({})
export class PlatformInventoryService implements OnStart {
	constructor() {
		if (RunUtil.IsServer()) Platform.server.inventory = this;
	}

	OnStart(): void {}

	/**
	 * Grants a user the provided item.
	 */
	public async GrantItem(userId: string, classId: string): Promise<Result<ItemInstance, undefined>> {
		const res = await AirshipInventoryServiceBackend.GrantItem(userId, classId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Grants a user the provided accessory.
	 */
	public async GrantAccessory(userId: string, classId: string): Promise<Result<AccessoryInstance, undefined>> {
		const res = await AirshipInventoryServiceBackend.GrantAccessory(userId, classId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Grants a user the provided profile picture.
	 */
	public async GrantProfilePicture(
		userId: string,
		classId: string,
	): Promise<Result<ProfilePictureInstance, undefined>> {
		const res = await AirshipInventoryServiceBackend.GrantProfilePicture(userId, classId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Deletes the given item instance from the users inventory.
	 */
	public async DeleteItem(instanceId: string): Promise<Result<ItemInstance, undefined>> {
		const res = await AirshipInventoryServiceBackend.DeleteItem(instanceId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Deletes the given accessory instance from the users inventory.
	 */
	public async DeleteAccessory(instanceId: string): Promise<Result<AccessoryInstance, undefined>> {
		const res = await AirshipInventoryServiceBackend.DeleteAccessory(instanceId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Deletes a the given profile picture instance from the users inventory.
	 */
	public async DeleteProfilePicture(instanceId: string): Promise<Result<ProfilePictureInstance, undefined>> {
		const res = await AirshipInventoryServiceBackend.DeleteProfilePicture(instanceId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Gets all items in a users inventory.
	 */
	public async GetItems(userId: string, query?: ItemQueryParameters): Promise<Result<ItemInstance[], undefined>> {
		const res = await AirshipInventoryServiceBackend.GetItems(userId, this.BuildItemQueryString(query));

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Gets all accessories in a users inventory.
	 */
	public async GetAccessories(
		userId: string,
		query?: ItemQueryParameters,
	): Promise<Result<AccessoryInstance[], undefined>> {
		const res = await AirshipInventoryServiceBackend.GetAccessories(userId, this.BuildItemQueryString(query));

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Gets all profile pictures in a users inventory.
	 */
	public async GetProfilePictures(
		userId: string,
		query?: ItemQueryParameters,
	): Promise<Result<ProfilePictureInstance, undefined>> {
		const res = await AirshipInventoryServiceBackend.GetProfilePictures(userId, this.BuildItemQueryString(query));

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Gets the users currently equipped outfit.
	 */
	public async GetEquippedOutfitByUserId(userId: string): Promise<Result<Outfit, undefined>> {
		const res = await AirshipInventoryServiceBackend.GetEquippedOutfitByUserId(userId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	/**
	 * Gets the users equipped profile picture.
	 * @param userId The userId
	 */
	public async GetEquippedProfilePictureByUserId(userId: string): Promise<Result<EquippedProfilePicture, undefined>> {
		const res = await AirshipInventoryServiceBackend.GetEquippedProfilePictureByUserId(userId);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
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
	): Promise<Result<Transaction, undefined>> {
		const res = await AirshipInventoryServiceBackend.PerformTrade(
			EncodeJSON({
				leftTradeHalf: user1,
				rightTradeHalf: user2,
			}),
		);

		if (!res.success || res.statusCode > 299) {
			warn(`Unable to complete request. Status Code:  ${res.statusCode}.\n`, res.data);
			return {
				success: false,
				data: undefined,
			};
		}

		return {
			success: true,
			data: DecodeJSON(res.data),
		};
	}

	private BuildItemQueryString(query?: ItemQueryParameters): string {
		if (!query) return "";

		let queryString = `queryType=${query.queryType}`;

		if (query.resourceIds && query.resourceIds.size() > 0) {
			queryString += `&resourceIds[]=${query.resourceIds.join("&resourceIds[]=")}`;
		}

		let ids = [];
		if (query.queryType === "tag") {
			ids = query.tags;
		} else {
			ids = query.classIds;
		}

		if (ids.size() > 0) {
			queryString += `&query[]=${ids.join("&query[]=")}`;
		}

		return queryString;
	}
}
