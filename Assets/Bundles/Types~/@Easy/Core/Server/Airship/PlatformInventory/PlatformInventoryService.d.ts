/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { ItemQueryParameters } from "../../../Shared/Airship/Types/Inputs/PlatformInventory";
import { AccessoryInstance, EquippedProfilePicture, ItemInstance, Outfit, ProfilePictureInstance, Transaction } from "../../../Shared/Airship/Types/Outputs/PlatformInventory";
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
    constructor();
    OnStart(): void;
    /**
     * Grants a user the provided item.
     */
    GrantItem(userId: string, classId: string): Promise<Result<ItemInstance, undefined>>;
    /**
     * Grants a user the provided accessory.
     */
    GrantAccessory(userId: string, classId: string): Promise<Result<AccessoryInstance, undefined>>;
    /**
     * Grants a user the provided profile picture.
     */
    GrantProfilePicture(userId: string, classId: string): Promise<Result<ProfilePictureInstance, undefined>>;
    /**
     * Deletes the given item instance from the users inventory.
     */
    DeleteItem(instanceId: string): Promise<Result<ItemInstance, undefined>>;
    /**
     * Deletes the given accessory instance from the users inventory.
     */
    DeleteAccessory(instanceId: string): Promise<Result<AccessoryInstance, undefined>>;
    /**
     * Deletes a the given profile picture instance from the users inventory.
     */
    DeleteProfilePicture(instanceId: string): Promise<Result<ProfilePictureInstance, undefined>>;
    /**
     * Gets all items in a users inventory.
     */
    GetItems(userId: string, query?: ItemQueryParameters): Promise<Result<ItemInstance[], undefined>>;
    /**
     * Gets all accessories in a users inventory.
     */
    GetAccessories(userId: string, query?: ItemQueryParameters): Promise<Result<AccessoryInstance[], undefined>>;
    /**
     * Gets all profile pictures in a users inventory.
     */
    GetProfilePictures(userId: string, query?: ItemQueryParameters): Promise<Result<ProfilePictureInstance, undefined>>;
    /**
     * Gets the users currently equipped outfit.
     */
    GetEquippedOutfitByUserId(userId: string): Promise<Result<Outfit, undefined>>;
    /**
     * Gets the users equipped profile picture.
     * @param userId The userId
     */
    GetEquippedProfilePictureByUserId(userId: string): Promise<Result<EquippedProfilePicture, undefined>>;
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
    }): Promise<Result<Transaction, undefined>>;
    private BuildItemQueryString;
}
