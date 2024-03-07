/// <reference types="@easy-games/compiler-types" />
import { MainMenuController } from "../MainMenuController";
export default class AvatarMenuProfileComponent extends AirshipBehaviour {
    private readonly tweenDuration;
    group: CanvasGroup;
    renderItemsBtn: Button;
    closeBtn: Button;
    private previousGroup;
    Init(mainMenu: MainMenuController): void;
    OpenPage(previousGroup: CanvasGroup): void;
    ClosePage(): void;
}
