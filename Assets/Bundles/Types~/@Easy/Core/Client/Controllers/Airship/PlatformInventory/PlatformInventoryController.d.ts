/// <reference types="compiler-types" />
import { OutfitDto } from "../../../../Shared/Airship/Types/Outputs/PlatformInventory";
import { OnStart } from "../../../../Shared/Flamework";
import { Result } from "../../../../Shared/Types/Result";
export declare class PlatformInventoryController implements OnStart {
    constructor();
    OnStart(): void;
    /**
     * Gets the users currently equipped outfit.
     */
    GetEquippedOutfitByUserId(userId: string): Promise<Result<OutfitDto | undefined, undefined>>;
}
