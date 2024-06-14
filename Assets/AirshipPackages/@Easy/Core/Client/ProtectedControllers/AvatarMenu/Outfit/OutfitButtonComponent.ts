import { Bin } from "../../../../Shared/Util/Bin";
import { CanvasAPI, HoverState } from "../../../../Shared/Util/CanvasAPI";

export default class OutfitButton extends AirshipBehaviour {
    public renameButton!: GameObject;
    @HideInInspector()
    public outfitIdx: number = -1;
    private renameButtonBin = new Bin();
    
    public Start(): void {
        CanvasAPI.OnHoverEvent(this.gameObject, (hoverState) => {
            if (hoverState === HoverState.ENTER) {
                this.renameButton.SetActive(true);

                const renameHoverEvent = CanvasAPI.OnHoverEvent(this.renameButton, (hoverState) => {
                    
                });
                this.renameButtonBin.AddEngineEventConnection(renameHoverEvent);
            } else {
                this.renameButtonBin.Clean();
                this.renameButton.SetActive(false);
            }
        });
    }
}