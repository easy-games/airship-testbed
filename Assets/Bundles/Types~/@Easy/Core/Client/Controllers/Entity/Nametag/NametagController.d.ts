import Character from "../../../../Shared/Character/Character";
import { OnStart } from "../../../../Shared/Flamework";
export declare class NametagController implements OnStart {
    private readonly nameTageId;
    private readonly graphicsBundleName;
    private showSelfNametag;
    OnStart(): void;
    private CreateNametag;
    UpdateNametag(character: Character): void;
}
