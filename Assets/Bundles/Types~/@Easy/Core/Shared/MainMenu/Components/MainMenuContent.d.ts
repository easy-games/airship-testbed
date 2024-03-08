/// <reference types="@easy-games/compiler-types" />
export default class MainMenuContent extends AirshipBehaviour {
    canvasRect: RectTransform;
    canvasScalar: CanvasScaler;
    contentWrapper: RectTransform;
    socialMenu: RectTransform;
    navbar: RectTransform;
    navbarBottom: RectTransform;
    navbarControls: RectTransform;
    pages: RectTransform;
    searchFocused: RectTransform;
    mobileNav: RectTransform;
    private mainMenu;
    Awake(): void;
    Start(): void;
    Update(dt: number): void;
    CalcLayout(): void;
    OnDestroy(): void;
}
