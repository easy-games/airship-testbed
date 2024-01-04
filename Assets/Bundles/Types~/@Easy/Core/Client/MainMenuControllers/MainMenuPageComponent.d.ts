/// <reference types="@easy-games/compiler-types" />
import { MainMenuController } from "./MainMenuController";
import { MainMenuPageType } from "./MainMenuPageName";
export default class MainMenuPageComponent extends AirshipBehaviour {
    private animateOutDuration;
    private animateInDuration;
    pageType: MainMenuPageType;
    protected refs?: GameObjectReferences;
    private activePage;
    protected mainMenu?: MainMenuController;
    Init(mainMenu: MainMenuController, pageType: MainMenuPageType): void;
    OpenPage(): void;
    ClosePage(instant?: boolean): void;
}
