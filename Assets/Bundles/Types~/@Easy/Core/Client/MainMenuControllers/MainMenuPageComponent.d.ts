/// <reference types="@easy-games/compiler-types" />
import { MainMenuPageType } from "./MainMenuPageName";
import { MainMenuController } from "./MainMenuController";
export default class MainMenuPageComponent extends AirshipBehaviour {
    private animateOutDuration;
    private animateInDuration;
    PageType: MainMenuPageType;
    protected refs?: GameObjectReferences;
    private activePage;
    protected mainMenu?: MainMenuController;
    Init(mainMenu: MainMenuController, pageType: MainMenuPageType): void;
    OpenPage(): void;
    ClosePage(instant?: boolean): void;
}
