import { CanvasAPI } from "../../../../Shared/Util/CanvasAPI";
import AvatarMenuComponent from "../AvatarMenuComponent";
import OutfitButton from "./OutfitButtonComponent";

let allOutfitNames = new Set<OutfitButtonNameComponent>();

export default class OutfitButtonNameComponent extends AirshipBehaviour {
    public outfitButtonGo!: GameObject;
    public avatarMenuGo!: GameObject;
    @HideInInspector()
    public inputField!: TMP_InputField;
    private outfitButtonIndex: number | undefined;
    private avatarMenuComp: AvatarMenuComponent | undefined;

    public Awake(): void {
        this.inputField = this.transform.GetComponent<TMP_InputField>();
        allOutfitNames.add(this);
    }

    public Start(): void {
        CanvasAPI.OnInputFieldSubmit(this.gameObject, (name) => {
            if (this.outfitButtonIndex === undefined) {
                this.outfitButtonIndex = this.outfitButtonGo.GetAirshipComponent<OutfitButton>()?.outfitIdx ?? -1;
            }
            // -1 means couldn't find outfit index
            if (this.outfitButtonIndex === -1) return;
            if (this.avatarMenuComp === undefined) this.avatarMenuComp = this.avatarMenuGo.GetAirshipComponent<AvatarMenuComponent>();

            this.avatarMenuComp?.RenameOutfit(this.outfitButtonIndex, name);
        });
    }

    public StartRename() {
        // Check if we're already renaming an outfit name
        for (const outfitNameComp of allOutfitNames) {
            if (!outfitNameComp || !outfitNameComp.gameObject) {
                allOutfitNames.delete(outfitNameComp);
                continue;
            }

            if (outfitNameComp.inputField.isFocused) return;
        }

        this.inputField.ActivateInputField();
        this.inputField.Select();
    }

    public UpdateDisplayName(newName: string) {
        this.inputField.text = newName;
    }
}