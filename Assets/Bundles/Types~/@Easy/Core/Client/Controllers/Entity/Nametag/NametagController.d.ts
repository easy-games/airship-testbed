import Character from "../../../../Shared/Character/Character";
import { OnStart } from "../../../../Shared/Flamework";
export declare class NametagController implements OnStart {
    private readonly nameTagId;
    private readonly graphicsBundleName;
    private showSelfNametag;
    private nametagsEnabled;
    private nametagBins;
    OnStart(): void;
    private HookCharacterNametag;
    private CreateNametag;
    UpdateNametag(character: Character): void;
    DestroyNametag(character: Character): void;
    SetNametagsEnabled(enabled: boolean): void;
}
