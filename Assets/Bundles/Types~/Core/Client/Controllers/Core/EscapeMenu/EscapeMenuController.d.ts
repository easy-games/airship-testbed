import { OnStart } from "@easy-games/flamework-core";
export declare class EscapeMenuController implements OnStart {
    canvas: Canvas;
    private canvasGroup;
    private wrapperRect;
    private closing;
    refs: GameObjectReferences;
    constructor();
    OnStart(): void;
    Open(): void;
    Disconnect(): void;
}
