import { Bin } from "@Easy/Core/Shared/Util/Bin";
import AvatarCustomizationOption_Color from "./AvatarCustomizationOption_Color";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import AvatarMenuComponent from "../AvatarMenuComponent";
import ColorPicker from "@Easy/Core/Client/Components/ColorPicker/ColorPicker";
import { ContentServiceGear } from "@Easy/Core/Shared/TypePackages/content-service-types";

export default class AvatarCustomizationPanel extends AirshipBehaviour {
	@Header("Templates")
	public colorOptionTemplate: GameObject;
	@Header("References")
	public menu: AvatarMenuComponent;
	public optionsHolder: Transform;
	public colorPicker: ColorPicker;
	public iconImage: Image;
	public labelTxt: TextMeshProUGUI;
	public dateTxt: TextMeshProUGUI;

	@Header("Variables")
	public heightOffset = 200;

	@HideInInspector()
	public accessoryBuilder: AccessoryBuilder;
	public OnToggle = new Signal<boolean>();

	private openBin = new Bin();
	private gear: PlatformGear;
	private modifiedGear = new Map<string, PlatformGear>();
	private colorPickerBin = new Bin();

	public Clear() {
		this.modifiedGear.clear();
	}

	public Open(
		gear: PlatformGear,
		customization: OutfitCustomizationSlot | undefined,
		label?: string,
		date?: string,
		icon?: Sprite,
	) {
		this.gear = gear;
		if (!gear) {
			// No Gear
			return;
		}

		if (
			this.gear.customizationVariantNames.size() < 2 &&
			(!gear.customizationColors || gear.customizationColors.size() <= 0)
		) {
			// No customization options
			this.Close();
			return;
		}

		this.openBin.Clean();
		this.modifiedGear.set(gear.classId, gear);
		NativeTween.AnchoredPositionY(this.transform, 0, 0.5).SetEaseExpoOut();

		if (this.labelTxt && label) {
			this.labelTxt.text = label;
		}
		if (this.dateTxt && date) {
			const localDate = DateTime.fromISO(date).ToLocalTime();
			this.dateTxt.text = localDate.Month + "/" + localDate.Day + "/" + localDate.Year;
		}
		if (this.iconImage && icon) {
			this.iconImage.sprite = icon;
		}

		//Clean previous options
		for (const t of this.optionsHolder) {
			Destroy(t.gameObject);
		}

		//Process customization options
		let i = 0;
		for (const defaultColor of gear.customizationColors) {
			if (customization) {
				for (const selectedColor of customization.colors) {
					if (selectedColor.key === defaultColor.key) {
						defaultColor.value = ColorUtil.HexToColor(selectedColor.colorHex);
					}
				}
			}
			this.SpawnColorOptions(i, defaultColor);
			i++;
		}

		this.OnToggle.Fire(true);
	}

	protected OnDisable(): void {
		this.openBin.Clean();
	}

	private SpawnColorOptions(index: number, color: PlatformGearColor) {
		// Create the color option sub panel
		const options = Instantiate(
			this.colorOptionTemplate,
			this.optionsHolder,
		).GetAirshipComponent<AvatarCustomizationOption_Color>()!;

		options.Init(color.key, ColorUtil.ColorToHex(color.value), color.scheme);
		const colorIndex = index;
		const colorKey = color.key;

		// Process Color Swapping
		this.openBin.Add(
			options.onSelectColor.Connect((colorStr) => {
				this.SelectColorOption(options, ColorUtil.HexToColor(colorStr), colorStr, colorKey, colorIndex);
				this.menu.Dirty();
			}),
		);

		this.openBin.Add(
			options.onClickActiveColor.Connect((option) => {
				this.colorPickerBin.Clean();
				this.colorPickerBin.Add(
					this.colorPicker.OnNewColor.Connect((newColor, newHex) => {
						this.SelectColorOption(option, newColor, newHex, colorKey, colorIndex);
					}),
				);
				this.colorPickerBin.Add(
					this.colorPicker.OnClose.Connect(() => {
						this.menu.Dirty();
					}),
				);
				this.colorPicker.Open(option.GetActiveColor(), colorKey);
			}),
		);
	}

	private SelectColorOption(
		option: AvatarCustomizationOption_Color,
		newColor: Color,
		newColorHex: string,
		colorKey: string,
		index: number,
	) {
		//make accessory the color
		for (const template of this.gear.accessoryPrefabs) {
			if (template) {
				this.accessoryBuilder.SetCustomColor(template.accessorySlot, colorKey, newColorHex);
			}
		}
		this.gear.customizationColors[index].value = newColor;
		option.SetActiveColor(newColor);
	}

	public Close() {
		this.openBin.Clean();
		NativeTween.AnchoredPositionY(this.transform, -this.heightOffset, 0.5).SetEaseExpoIn();
		this.OnToggle.Fire(false);
	}
}
