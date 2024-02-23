/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
import { ItemQueryParameters } from "../../../Shared/Airship/Types/Inputs/PlatformInventory";
import { AccessoryInstance, EquippedProfilePicture, ItemInstance, Outfit, ProfilePictureInstance, Transaction } from "../../../Shared/Airship/Types/Outputs/PlatformInventory";
import { Result } from "../../../Shared/Types/Result";
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
