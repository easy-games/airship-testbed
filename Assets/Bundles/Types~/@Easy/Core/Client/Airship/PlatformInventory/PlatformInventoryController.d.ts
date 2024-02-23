/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../Shared/Flamework";
import { EquippedProfilePicture, Outfit } from "../../../Shared/Airship/Types/Outputs/PlatformInventory";
import { Result } from "../../../Shared/Types/Result";
export declare class PlatformInventoryController implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Gets the users equipped profile picture.
     * @param userId The userId
     */
    GetEquippedProfilePictureByUserId(userId: string): Promise<Result<EquippedProfilePicture, undefined>>;
    /**
     * Gets the users currently equipped outfit.
     */
    GetEquippedOutfitByUserId(userId: string): Promise<Result<Outfit | undefined, undefined>>;
}
