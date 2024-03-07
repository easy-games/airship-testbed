/// <reference types="@easy-games/compiler-types" />
export declare enum AvatarBackdrop {
    NONE = 0,
    WHITE_FLAT = 1,
    LIGHT_3D = 2,
    DARK_3D = 3
}
export default class AvatarBackdropComponent extends AirshipBehaviour {
    SetBackgdrop(backdrop: AvatarBackdrop): void;
}
