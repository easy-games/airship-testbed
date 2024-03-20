/// <reference types="compiler-types" />
export default class MainMenuContent extends AirshipBehaviour {
    canvasRect: RectTransform;
    canvasScalar: CanvasScaler;
    contentWrapper: RectTransform;
    socialMenu: RectTransform;
    friendsPage: RectTransform;
    navbar: RectTransform;
    navbarContentWrapper: RectTransform;
    pages: RectTransform;
    searchFocused: RectTransform;
    mobileNav: RectTransform;
    private mainMenu;
    private bin;
    Start(): void;
    Update(dt: number): void;
    CalcLayout(): void;
    OnDestroy(): void;
}
