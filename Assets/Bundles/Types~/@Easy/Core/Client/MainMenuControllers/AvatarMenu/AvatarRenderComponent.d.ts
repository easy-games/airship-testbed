/// <reference types="@easy-games/compiler-types" />
export default class AvatarRenderComponent extends AirshipBehaviour {
    private readonly tweenDuration;
    group: CanvasGroup;
    renderItemsBtn: Button;
    closeBtn: Button;
    private previousGroup;
    Awake(): void;
    OpenPage(previousGroup: CanvasGroup): void;
    ClosePage(): void;
    RenderAllItems(): void;
    RenderItem(accesoryTemplate: AccessoryComponent): void;
}
