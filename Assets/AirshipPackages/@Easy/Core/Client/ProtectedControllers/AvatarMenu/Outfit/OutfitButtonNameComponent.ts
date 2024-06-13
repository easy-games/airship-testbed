import { CanvasAPI } from "../../../../Shared/Util/CanvasAPI";
import AvatarMenuComponent from "../AvatarMenuComponent";
import OutfitButton from "./OutfitButtonComponent";

export default class OutfitButtonNameComponent extends AirshipBehaviour {
    public outfitButtonGo!: GameObject;
    public avatarMenuGo!: GameObject;
    private outfitButtonIndex: number | undefined;
    private avatarMenuComp: AvatarMenuComponent | undefined;
    private inputField = this.transform.GetComponent<TMP_InputField>();

    public StartRename() {
        if (this.inputField.isFocused) return; // Already renaming

        this.inputField.ActivateInputField();
        this.inputField.Select();
        this.inputField.readOnly = false;

        CanvasAPI.OnInputFieldSubmit(this.gameObject, (name) => {
            this.inputField.readOnly = true;

            if (this.outfitButtonIndex === undefined) {
                this.outfitButtonIndex = this.outfitButtonGo.GetAirshipComponent<OutfitButton>()?.outfitIdx ?? -1;
            }
            // -1 means couldn't find outfit index
            if (this.outfitButtonIndex === -1) return;
            if (this.avatarMenuComp === undefined) this.avatarMenuComp = this.avatarMenuGo.GetAirshipComponent<AvatarMenuComponent>();

            this.avatarMenuComp?.RenameOutfit(this.outfitButtonIndex, name);
        });
    }

    public UpdateDisplayName(newName: string) {
        this.inputField.text = newName;
    }
}