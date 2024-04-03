/// <reference types="compiler-types" />
export default class MainMenuContent extends AirshipBehaviour {
    canvasRect: RectTransform;
    canvasScalar: CanvasScaler;
    mobileOverlayCanvasScalar?: CanvasScaler;
    contentWrapper: RectTransform;
    socialMenu: RectTransform;
    friendsPage: RectTransform;
    pages: RectTransform;
    searchFocused: RectTransform;
    mobileNav: RectTransform;
    navbar: RectTransform;
    navbarContentWrapper: RectTransform;
    navbarTabs: RectTransform[];
    navbarLeft: RectTransform;
    navbarRight: RectTransform;
    private mainMenu;
    private bin;
    Start(): void;
    CalcLayout(): void;
    OnDestroy(): void;
}
