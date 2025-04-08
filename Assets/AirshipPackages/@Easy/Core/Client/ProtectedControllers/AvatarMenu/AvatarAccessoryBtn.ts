import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, HoverState } from "@Easy/Core/Shared/Util/CanvasAPI";
import OutfitButtonNameComponent from "./Outfit/OutfitButtonNameComponent";

export default class AvatarAccessoryBtn extends AirshipBehaviour {
	@Header("References")
	public iconImage!: Image;
	public button!: Button;
	public labelText!: TextMeshProUGUI;
	public outfitNameGo!: GameObject;
	public bgImage!: Image;
	public equippedBadge!: GameObject;
	public scrollRedirect!: AirshipRedirectScroll;
	public outline: MonoBehaviour;

	@Header("Data")
	public classId = "";
	public instanceId = "";

	public noColorChanges = false;

	private bin = new Bin();
	private selected = false;
	private outfitNameComponent: OutfitButtonNameComponent | undefined;

	override Start(): void {}

	public OnEnable(): void {
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnHoverEvent(this.gameObject, (hoverState) => {
				if (this.noColorChanges) return;
				if (hoverState === HoverState.ENTER && !this.selected) {
					this.outline.enabled = true;
				} else {
					this.outline.enabled = false;
				}
			}),
		);
	}

	public StartRename() {
		if (!this.outfitNameComponent) {
			this.outfitNameComponent = this.outfitNameGo.GetAirshipComponent<OutfitButtonNameComponent>();
		}
		this.outfitNameComponent?.StartRename();
	}

	public SetText(label: string) {
		if (this.labelText) {
			this.labelText.enabled = true;
			this.labelText.text = label ?? "";
		}
	}

	public SetBGColor(newColor: Color) {
		if (this.bgImage) {
			this.bgImage.color = newColor;
		}
	}

	public SetSelected(val: boolean) {
		this.selected = val;
		if (!this.noColorChanges) {
			if (val) {
				this.outline.enabled = false;
			} else {
				// this.bgImage.color = new Color(0.19, 0.2, 0.23, 0.43);
			}
		}
		// if (val) {
		// 	// this.bgImage.color = Theme.primary;
		// 	this.labelText.color = new Color(1, 1, 1, 1);
		// 	this.iconImage.color = new Color(1, 1, 1, 1);
		// } else {
		// 	// this.bgImage.color = new Color(0.19, 0.2, 0.23, 0.43);
		// 	this.labelText.color = new Color(1, 1, 1, 0.8);
		// 	this.iconImage.color = new Color(1, 1, 1, 0.8);
		// }
		this.equippedBadge.SetActive(val);
	}

	public GetSelected() {
		return this.selected;
	}

	public SetEnabled(enabled: boolean) {
		this.button.interactable = enabled;
	}
}
