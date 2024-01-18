/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { Result } from "../../../Shared/Types/Result";
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
export declare class PlatformInventoryService implements OnStart {
    OnStart(): void;
    /**
     * Grants a user the provided item.
     */
    GrantItem(): Promise<Result<undefined, undefined>>;
    /**
     * Grants a user the provided accessory.
     */
    GrantAccessory(): Promise<Result<undefined, undefined>>;
    /**
     * Grants a user the provided profile picture.
     */
    GrantProfilePicture(): Promise<Result<undefined, undefined>>;
    /**
     * Deletes the given item instance from the users inventory.
     */
    DeleteItem(): Promise<Result<undefined, undefined>>;
    /**
     * Deletes the given accessory instance from the users inventory.
     */
    DeleteAccessory(): Promise<Result<undefined, undefined>>;
    /**
     * Deletes a the given profile picture instance from the users inventory.
     */
    DeleteProfilePicture(): Promise<Result<undefined, undefined>>;
    /**
     * Checks if the user has and instance of the given item class.
     */
    HasItem(): Promise<Result<undefined, undefined>>;
    /**
     * Checks if the user has an instance of the given accessory class.
     */
    HasAccessory(): Promise<Result<undefined, undefined>>;
    /**
     * Checks if the user has an instance of the given profile picture class.
     */
    HasProfilePicture(): Promise<Result<undefined, undefined>>;
    /**
     * Gets all items in a users inventory.
     */
    GetItems(): Promise<Result<undefined, undefined>>;
    /**
     * Gets all accessories in a users inventory.
     */
    GetAccessories(): Promise<Result<undefined, undefined>>;
    /**
     * Gets all profile pictures in a users inventory.
     */
    GetProfilePictures(): Promise<Result<undefined, undefined>>;
    /**
     * Gets the users currently equipped outfit.
     */
    GetEquippedOutfit(): Promise<Result<undefined, undefined>>;
    /**
     * Performs a trade between two players. Trades are atomic, if the transaction does not succeed, no
     * items are lost or modified.
     *
     * @param user1 The first user and items from their inventory that will be traded to the second user.
     * @param user2 The second user and items from their inventory that will be traded to the first user.
     */
    PerformTrade(user1: {
        uid: string;
        itemInstanceIds: string[];
    }, user2: {
        uid: string;
        itemInstanceIds: string[];
    }): Promise<Result<undefined, undefined>>;
}
