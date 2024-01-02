/// <reference types="@easy-games/compiler-types" />
import { GameDto } from "../API/GamesAPI";
export default class HomePageGameComponent extends AirshipBehaviour {
    TitleText: TMP_Text;
    PlayerCountText: TMP_Text;
    ButtonGo: GameObject;
    private bin;
    OnStart(): void;
    OnDestroy(): void;
    OnDisabled(): void;
    Init(gameDto: GameDto): void;
}
