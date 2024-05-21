/// <reference types="compiler-types" />
import { ItemQueryParameters } from "../../../../Shared/Airship/Types/Inputs/PlatformInventory";
import { ItemInstanceDto, OutfitDto, Transaction } from "../../../../Shared/Airship/Types/Outputs/PlatformInventory";
import { OnStart } from "../../../../Shared/Flamework";
import { Result } from "../../../../Shared/Types/Result";
export declare class PlatformInventoryService implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Grants a user the provided item.
     */
    GrantItem(userId: string, classId: string): Promise<Result<ItemInstanceDto, undefined>>;
    /**
     * Deletes the given item instance from the users inventory.
     */
    DeleteItem(instanceId: string): Promise<Result<ItemInstanceDto, undefined>>;
    /**
     * Gets all items in a users inventory.
     */
    GetItems(userId: string, query?: ItemQueryParameters): Promise<Result<ItemInstanceDto[], undefined>>;
    /**
     * Gets the users currently equipped outfit.
     */
    GetEquippedOutfitByUserId(userId: string): Promise<Result<OutfitDto, undefined>>;
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
