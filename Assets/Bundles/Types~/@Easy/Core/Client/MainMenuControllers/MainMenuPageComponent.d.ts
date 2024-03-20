/// <reference types="compiler-types" />
import { MainMenuController } from "./MainMenuController";
import { MainMenuPageType } from "./MainMenuPageName";
export default class MainMenuPageComponent extends AirshipBehaviour {
    private animateOutDuration;
    private animateInDuration;
    pageType: MainMenuPageType;
    protected refs?: GameObjectReferences;
    private activePage;
    protected mainMenu?: MainMenuController;
    /**
     * **DO NOT YIELD INSIDE THIS METHOD.**
     * @param mainMenu
     * @param pageType
     */
    Init(mainMenu: MainMenuController, pageType: MainMenuPageType): void;
    /**
     * **DO NOT YIELD INSIDE THIS METHOD**
     * @returns
     */
    OpenPage(): void;
    ClosePage(instant?: boolean): void;
}
