/// <reference types="@easy-games/compiler-types" />
import { AccessoryInstanceDto, OutfitDto } from "../Airship/Types/Outputs/PlatformInventory";
export declare class AvatarPlatformAPI {
    private static Log;
    static GetHttpUrl(path: string): string;
    static GetImageUrl(imageId: string): string;
    static GetAllOutfits(): OutfitDto[] | undefined;
    static GetEquippedOutfit(): OutfitDto | undefined;
    static GetAvatarOutfit(outfitId: string): OutfitDto | undefined;
    static CreateAvatarOutfit(outfit: OutfitDto): void;
    static EquipAvatarOutfit(outfitId: string): void;
    static GetAccessories(): AccessoryInstanceDto[] | undefined;
    static CreateDefaultAvatarOutfit(entityId: string, outfitId: string, name: string, skinColor: Color): OutfitDto;
    static SaveOutfitAccessories(outfitId: string, skinColor: string, instanceIds: string[]): OutfitDto;
    static SaveAvatarOutfit(outfit: OutfitDto): void;
    static LoadImage(fileId: string): AccessoryInstanceDto[];
    static UploadItemImage(classId: string, resourceId: string, filePath: string, fileSize: number): Promise<void>;
    static UploadImage(resourceId: string, filePath: string, fileSize: number): Promise<string>;
}
