import { OnStart } from "../../../node_modules/@easy-games/flamework-core";
import { Signal } from "../../Shared/Util/Signal";
import AvatarViewComponent from "../../Shared/Avatar/AvatarViewComponent";
import MainMenuPageComponent from "./MainMenuPageComponent";
import { MainMenuPageType } from "./MainMenuPageName";
export declare class MainMenuController implements OnStart {
    private readonly socialTweenDuration;
    mainMenuGo: GameObject;
    refs: GameObjectReferences;
    currentPage?: MainMenuPageComponent;
    avatarView?: AvatarViewComponent;
    onCurrentPageChanged: Signal<[page: MainMenuPageType, oldPage: MainMenuPageType | undefined]>;
    private pageMap;
    private wrapperRect;
    mainContentCanvas: Canvas;
    mainContentGroup: CanvasGroup;
    socialMenuGroup: CanvasGroup;
    private rootCanvasGroup;
    private toggleSocialButton;
    private open;
    private socialIsVisible;
    constructor();
    OpenFromGame(): void;
    CloseFromGame(): void;
    IsOpen(): boolean;
    OnStart(): void;
    RouteToPage(pageType: MainMenuPageType, force?: boolean, noTween?: boolean): void;
    private ToggleSocialView;
}
