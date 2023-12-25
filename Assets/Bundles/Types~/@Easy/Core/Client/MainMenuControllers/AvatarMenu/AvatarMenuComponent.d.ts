import MainMenuPageComponent from "../MainMenuPageComponent";
import { MainMenuController } from "../MainMenuController";
import { MainMenuPageType } from "../MainMenuPageName";
export default class AvatarMenuComponent extends MainMenuPageComponent {
    private readonly GeneralHookupKey;
    private readonly tweenDuration;
    private subNavBarBtns;
    private mainNavBtns?;
    private subNavBars?;
    private activeMainIndex;
    itemButtonHolder?: Transform;
    itemButtonTemplate?: GameObject;
    private Log;
    Init(mainMenu: MainMenuController, pageType: MainMenuPageType): void;
    OpenPage(): void;
    ClosePage(): void;
    private SelectMainNav;
    private SelectSubNav;
    private DisplayItemsOfType;
    private DisplayItems;
    private itemButtonBin;
    private ClearItembuttons;
    private AddItemButton;
    private SelectItem;
    private OnSelectClear;
    private OnSelectCurrent;
    private OnDragAvatar;
}
