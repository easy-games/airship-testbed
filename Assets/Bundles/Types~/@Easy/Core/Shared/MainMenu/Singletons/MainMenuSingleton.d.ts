import { OnStart } from "../../Flamework";
import { Bin } from "../../Util/Bin";
import { Signal } from "../../Util/Signal";
import { ScreenSizeType } from "./ScreenSizeType";
export declare class MainMenuSingleton implements OnStart {
    sizeType: ScreenSizeType;
    onSizeTypeChanged: Signal<ScreenSizeType>;
    screenSize: Vector2;
    constructor();
    OnStart(): void;
    ObserveScreenSizeType(observer: (size: ScreenSizeType) => (() => void) | void): Bin;
}
