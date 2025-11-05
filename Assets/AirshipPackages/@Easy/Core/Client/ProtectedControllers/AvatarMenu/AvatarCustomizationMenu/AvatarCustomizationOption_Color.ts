import AvatarCustomizationBtn from "./AvatarCustomizationBtn";
import { Protected } from "@Easy/Core/Shared/Protected";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export default class AvatarCustomizationOption_Color extends AirshipBehaviour {
	@Header("Templates")
	public colorBtnTemplate: GameObject;

	@Header("References")
	public labelTxt: TextMeshProUGUI;
	public palletHolder: Transform;
	public currentColorBtn: AvatarCustomizationBtn;
	public openColorPickerBtn: Button;

	public onSelectColor = new Signal<string>();
	public onClickActiveColor = new Signal<AvatarCustomizationOption_Color>();

	private colorPalletId: number = 0;
	private palletBtns: AvatarCustomizationBtn[] = [];
	private palletColors: string[];
	private bin = new Bin();

	public Init(label: string, currentColorStr: string, colorPalletId: number): void {
		this.bin.Clean();
		this.colorPalletId = colorPalletId;

		this.labelTxt.text = label;

		// Set the active color
		this.SetActiveColorHex(currentColorStr);

		// Create the grid of color options
		this.CreatePallet(Protected.Avatar.colorSets[colorPalletId]);

		this.bin.Add(
			this.openColorPickerBtn.onClick.Connect(() => {
				this.onClickActiveColor.Fire(this);
			}),
		);
	}

	protected OnDestroy(): void {
		this.bin.Clean();
	}

	private CreatePallet(colors: string[]) {
		// Destroy old options
		for (const childT of this.palletHolder) {
			Destroy(childT.gameObject);
		}
		this.palletBtns.clear();

		// Create new options
		this.palletColors = colors;
		for (const colorStr of colors) {
			this.palletBtns.push(this.CreatePalletBtn(ColorUtil.HexToColor(colorStr, 1)));
		}
	}

	private CreatePalletBtn(color: Color) {
		let swatch = Instantiate(
			this.colorBtnTemplate,
			this.palletHolder,
		).gameObject.GetAirshipComponent<AvatarCustomizationBtn>();
		if (!swatch) {
			error("Color Btn Template must have an AvatarCustomizationBtn component on it");
		}
		swatch.image.color = color;
		const btnIndex = this.palletBtns.size();
		this.bin.Add(
			swatch.btn.onClick.Connect(() => {
				this.onSelectColor.Fire(this.palletColors[btnIndex]);
			}),
		);
		return swatch;
	}

	public SetActiveColorHex(currentColorStr: string) {
		this.SetActiveColor(ColorUtil.HexToColor(currentColorStr, 1));
	}

	public SetActiveColor(color: Color) {
		this.currentColorBtn.image.color = color;
	}

	public GetActiveColor() {
		return this.currentColorBtn.image.color;
	}
}
