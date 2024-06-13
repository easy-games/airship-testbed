import { CanvasAPI, HoverState } from "../../../../Shared/Util/CanvasAPI";
import OutfitButtonNameComponent from "./OutfitButtonNameComponent";

export default class OutfitRenameButtonComponent extends AirshipBehaviour {
    public hoveredColor!: Color;
    public inactiveColor!: Color;
    public outfitButtonNameGo!: GameObject;
    private outfitButtonNameComp: OutfitButtonNameComponent | undefined;

    private image = this.transform.GetComponent<Image>()!;

    public Start(): void {
        CanvasAPI.OnHoverEvent(this.gameObject, (hoverState) => {
            if (hoverState === HoverState.ENTER) {
                this.image.TweenGraphicColor(this.hoveredColor, 0.1);
            } else {
                this.image.TweenGraphicColor(this.inactiveColor, 0.1);
            }
        });

        CanvasAPI.OnClickEvent(this.gameObject, () => {
            this.GetOutfitButtonNameComponent()?.StartRename();
        });
    }

    private GetOutfitButtonNameComponent() {
        if (this.outfitButtonNameComp) return this.outfitButtonNameComp;

        this.outfitButtonNameComp = this.outfitButtonNameGo.GetAirshipComponent<OutfitButtonNameComponent>();
        return this.outfitButtonNameComp;
    }
}