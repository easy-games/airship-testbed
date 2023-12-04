/// <reference types="@easy-games/compiler-types" />
import { MainMenuPageType } from "./MainMenuPageName";
export default class MainMenuPageComponent extends AirshipBehaviour {
    private animateOutDuration;
    private animateInDuration;
    pageType: MainMenuPageType;
    private refs?;
    private activePage;
    OnStart(): void;
    OpenPage(): void;
    ClosePage(): void;
}
