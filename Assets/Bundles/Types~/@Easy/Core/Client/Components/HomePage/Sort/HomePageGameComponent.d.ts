/// <reference types="@easy-games/compiler-types" />
import { GameDto } from "../API/GamesAPI";
export default class HomePageGameComponent extends AirshipBehaviour {
    titleText: TMP_Text;
    playerCountText: TMP_Text;
    buttonGo: GameObject;
    private bin;
    Start(): void;
    OnDestroy(): void;
    OnDisabled(): void;
    Init(gameDto: GameDto): void;
}
