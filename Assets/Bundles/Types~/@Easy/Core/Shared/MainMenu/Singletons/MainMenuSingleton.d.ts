import { OnStart } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { Modifier } from "../../Util/Modifier";
import { Signal } from "../../Util/Signal";
import { ScreenSizeType } from "./ScreenSizeType";
export declare class MainMenuSingleton implements OnStart {
    sizeType: ScreenSizeType;
    onSizeTypeChanged: Signal<ScreenSizeType>;
    screenSize: Vector2;
    navbarModifier: Modifier<{
        hidden: boolean;
    }>;
    constructor();
    OnStart(): void;
    ObserveScreenSizeType(observer: (size: ScreenSizeType) => (() => void) | void): Bin;
}
