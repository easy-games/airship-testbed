import MainMenuPageComponent from "../../MainMenuPageComponent";
export default class GameGeneralPage extends MainMenuPageComponent {
    gameTitle: TMP_Text;
    gameDeveloper: TMP_Text;
    gameDescription: TMP_Text;
    gameImage: Image;
    private bin;
    OnEnable(): void;
    GetTargetAnchoredPositionY(): number;
    Start(): void;
    OnDestroy(): void;
}
