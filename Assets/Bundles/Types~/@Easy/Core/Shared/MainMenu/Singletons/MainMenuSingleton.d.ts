import { OnStart } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { Modifier } from "../../Util/Modifier";
import { Signal } from "../../Util/Signal";
import { ScreenSizeType } from "./ScreenSizeType";
export declare class MainMenuSingleton implements OnStart {
    sizeType: ScreenSizeType;
    onSizeChanged: Signal<[sizeType: ScreenSizeType, size: Vector2]>;
    screenSize: Vector2;
    private firstRun;
    navbarModifier: Modifier<{
        hidden: boolean;
    }>;
    socialMenuModifier: Modifier<{
        hidden: boolean;
    }>;
    constructor();
    OnStart(): void;
    ObserveScreenSize(observer: (sizeType: ScreenSizeType, size: Vector2) => (() => void) | void): Bin;
}
