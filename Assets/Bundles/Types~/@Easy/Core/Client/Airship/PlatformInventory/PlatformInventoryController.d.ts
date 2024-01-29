/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../../../../node_modules/@easy-games/flamework-core";
import { EquippedProfilePicture, Outfit } from "../../../Shared/Airship/Types/Outputs/PlatformInventory";
import { Result } from "../../../Shared/Types/Result";
/**
 * This controller allows access to the current players platform inventory. Platform inventory
 * is managed by game servers and configured on the https://create.airship.gg website.
 */
export declare class PlatformInventoryController implements OnStart {
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
