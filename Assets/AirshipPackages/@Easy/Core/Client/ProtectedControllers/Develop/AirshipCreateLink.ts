import { CanvasAPI, HoverState, PointerButton } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class AirshipCreateLink extends AirshipBehaviour {
    private tmp = this.transform.GetComponent<TextMeshProUGUI>();
    private originalText = this.tmp.text;

    public Start(): void {
        CanvasAPI.OnPointerEvent(this.gameObject, (dir, button) => {
            if (button !== PointerButton.RIGHT) {
                Application.OpenURL("https://create.airship.gg/");
            }
        });
        CanvasAPI.OnHoverEvent(this.gameObject, (hoverState) => {
            if (hoverState === HoverState.ENTER) {
                this.tmp.text = `<u>${this.originalText}</u>`
            } else {
                this.tmp.text = this.originalText;
            }
        });
    }

    
}
