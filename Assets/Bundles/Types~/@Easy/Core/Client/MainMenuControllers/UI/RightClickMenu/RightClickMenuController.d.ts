import { OnStart } from "../../../../Shared/Flamework";
import { RightClickMenuButton } from "./RightClickMenuButton";
export declare class RightClickMenuController implements OnStart {
    private opened;
    private currentBin;
    private openedTime;
    constructor();
    OnStart(): void;
    OpenRightClickMenu(canvas: Canvas, position: Vector3, buttons: RightClickMenuButton[]): () => void;
}
