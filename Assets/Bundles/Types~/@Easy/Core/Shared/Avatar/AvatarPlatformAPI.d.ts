/// <reference types="compiler-types" />
import { AccessoryInstanceDto, OutfitDto } from "../Airship/Types/Outputs/PlatformInventory";
export declare class AvatarPlatformAPI {
    private static Log;
    static GetHttpUrl(path: string): string;
    static GetImageUrl(imageId: string): string;
    static GetAllOutfits(): OutfitDto[] | undefined;
    static GetEquippedOutfit(): OutfitDto | undefined;
    static GetPlayerEquippedOutfit(playerId: string): Promise<OutfitDto | undefined>;
    static GetAvatarOutfit(outfitId: string): Promise<OutfitDto | undefined>;
    static CreateAvatarOutfit(outfit: OutfitDto): Promise<void>;
    static EquipAvatarOutfit(outfitId: string): Promise<void>;
    static GetAccessories(): Promise<AccessoryInstanceDto[] | undefined>;
    static CreateDefaultAvatarOutfit(entityId: string, outfitId: string, name: string, skinColor: Color): OutfitDto;
    static SaveOutfitAccessories(outfitId: string, skinColor: string, instanceIds: string[]): Promise<OutfitDto | undefined>;
    static LoadImage(fileId: string): Promise<AccessoryInstanceDto[]>;
    static UploadItemImage(classId: string, resourceId: string, filePath: string, fileSize: number): Promise<void>;
    static UploadImage(resourceId: string, filePath: string, fileSize: number): Promise<string>;
}
