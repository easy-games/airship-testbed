/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Result } from "../../../Shared/Types/Result";
/**
 * This controller allows access to the current players platform inventory. Platform inventory
 * is managed by game servers and configured on the https://create.airship.gg website.
 */
export declare class PlatformInventoryController implements OnStart {
    OnStart(): void;
    /**
     * Checks if the player has the specified item.
     */
    HasItem(): Promise<Result<undefined, undefined>>;
    /**
     * Checks if the player has the specified accessory.
     */
    HasAccessory(): Promise<Result<undefined, undefined>>;
    /**
     * Checks if the player has the specified profile picture.
     */
    HasProfilePicture(): Promise<Result<undefined, undefined>>;
    /**
     * Gets all items that the player owns.
     */
    GetItems(): Promise<Result<undefined, undefined>>;
    /**
     * Gets all accessories that the player owns.
     */
    GetAccessories(): Promise<Result<undefined, undefined>>;
    /**
     * Gets all profile pictures that the player owns.
     */
    GetProfilePictures(): Promise<Result<undefined, undefined>>;
    /**
     * Gets the players equipped outfit.
     */
    GetEquippedOutfit(): Promise<Result<undefined, undefined>>;
}
