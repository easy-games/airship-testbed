/// <reference types="compiler-types" />
export default class Navbar extends AirshipBehaviour {
    leftContent: RectTransform;
    rightContent: RectTransform;
    rightLayoutGroup: HorizontalLayoutGroup;
    runningGameBtn: RectTransform;
    myGamesBtn: RectTransform;
    homeBtn: RectTransform;
    avatarBtn: RectTransform;
    settingsBtn: RectTransform;
    scrollRect: ScrollRect;
    creditsWrapper: GameObject;
    left: RectTransform;
    private bin;
    OnEnable(): void;
    OnDisable(): void;
}
