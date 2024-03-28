/// <reference types="compiler-types" />
import { GameDto } from "../API/GamesAPI";
export default class HomePageGameComponent extends AirshipBehaviour {
    titleText: TMP_Text;
    playsWrapper: GameObject;
    playsText: TMP_Text;
    playerCountWrapper: GameObject;
    playerCountText: TMP_Text;
    buttonGo: GameObject;
    gameImage: CloudImage;
    orgImage: CloudImage;
    authorText: TMP_Text;
    shadow: TrueShadow;
    gameDto: GameDto;
    loadingOverlay: GameObject;
    private redirectDrag;
    private bin;
    Awake(): void;
    Start(): void;
    OnDestroy(): void;
    OnDisabled(): void;
    SetDragRedirectTarget(target: ScrollRect): void;
    Init(gameDto: GameDto): void;
    HasAdminPermissions(): boolean;
}
