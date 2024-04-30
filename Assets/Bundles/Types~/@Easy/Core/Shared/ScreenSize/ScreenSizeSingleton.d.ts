import { OnStart } from "../Flamework";
import { ScreenSizeType } from "../MainMenu/Singletons/ScreenSizeType";
import { Bin } from "../Util/Bin";
import { Signal } from "../Util/Signal";
export declare class ScreenSizeSingleton implements OnStart {
    sizeType: ScreenSizeType;
    onSizeChanged: Signal<[sizeType: ScreenSizeType, size: Vector2]>;
    screenSize: Vector2;
    private firstRun;
    constructor();
    OnStart(): void;
    ObserveScreenSize(observer: (sizeType: ScreenSizeType, size: Vector2) => (() => void) | void): Bin;
}
