import { OnStart } from "../../../../Shared/Flamework";
import Character from "../../../../Shared/Character/Character";
export declare class NametagController implements OnStart {
    private readonly nameTageId;
    private readonly graphicsBundleName;
    private showSelfNametag;
    OnStart(): void;
    private CreateNametag;
    UpdateNametag(character: Character): void;
}
