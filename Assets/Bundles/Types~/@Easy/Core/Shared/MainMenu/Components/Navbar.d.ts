/// <reference types="compiler-types" />
export default class Navbar extends AirshipBehaviour {
    leftContent: RectTransform;
    rightContent: RectTransform;
    rightLayoutGroup: HorizontalLayoutGroup;
    runningGameBtn: RectTransform;
    myGamesBtn: RectTransform;
    homeBtn: RectTransform;
    settingsBtn: RectTransform;
    scrollRect: ScrollRect;
    creditsWrapper: GameObject;
    private bin;
    OnEnable(): void;
    OnDisable(): void;
}
