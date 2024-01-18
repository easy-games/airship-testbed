import { Controller, OnStart } from "@easy-games/flamework-core";
import { Result } from "Shared/Types/Result";

/**
 * This controller allows access to the current players platform inventory. Platform inventory
 * is managed by game servers and configured on the https://create.airship.gg website.
 */
@Controller({})
export class PlatformInventoryController implements OnStart {
	OnStart(): void {}

	/**
	 * Checks if the player has the specified item.
	 */
	public async HasItem(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryControllerBackend.HasItem();

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
	 * Checks if the player has the specified accessory.
	 */
	public async HasAccessory(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryControllerBackend.HasAccessory();

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
	 * Checks if the player has the specified profile picture.
	 */
	public async HasProfilePicture(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryControllerBackend.HasProfilePicture();

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
	 * Gets all items that the player owns.
	 */
	public async GetItems(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryControllerBackend.GetItems();

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
	 * Gets all accessories that the player owns.
	 */
	public async GetAccessories(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryControllerBackend.GetAccessories();

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
	 * Gets all profile pictures that the player owns.
	 */
	public async GetProfilePictures(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryControllerBackend.GetProfilePictures();

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
	 * Gets the players equipped outfit.
	 */
	public async GetEquippedOutfit(): Promise<Result<undefined, undefined>> {
		const res = await AirshipInventoryControllerBackend.GetEquippedOutfit();

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
