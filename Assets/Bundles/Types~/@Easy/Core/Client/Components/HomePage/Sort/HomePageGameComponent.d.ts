/// <reference types="@easy-games/compiler-types" />
import { GameDto } from "../API/GamesAPI";
export default class HomePageGameComponent extends AirshipBehaviour {
    titleText: TMP_Text;
    playsWrapper: GameObject;
    playsText: TMP_Text;
    playerCountWrapper: GameObject;
    playerCountText: TMP_Text;
    buttonGo: GameObject;
    orgImage: CloudImage;
    authorText: TMP_Text;
    private redirectDrag;
    private bin;
    Start(): void;
    OnDestroy(): void;
    OnDisabled(): void;
    SetDragRedirectTarget(target: ScrollRect): void;
    Init(gameDto: GameDto): void;
}
