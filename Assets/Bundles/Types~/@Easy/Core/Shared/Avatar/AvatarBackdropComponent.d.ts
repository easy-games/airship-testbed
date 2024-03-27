/// <reference types="compiler-types" />
export declare enum AvatarBackdropType {
    NONE = 0,
    WHITE_FLAT = 1,
    LIGHT_3D = 2,
    DARK_3D = 3
}
export default class AvatarBackdropComponent extends AirshipBehaviour {
    solidColor: MaterialColor;
    SetBackgdrop(backdrop: AvatarBackdropType): void;
    SetSolidColorBackdrop(color: Color): void;
}
