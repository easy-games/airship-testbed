import { Bin } from "@Easy/Core/Shared/Util/Bin";
import AvatarCustomizationOption_Color from "./AvatarCustomizationOption_Color";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import AvatarMenuComponent from "../AvatarMenuComponent";
import { Game } from "@Easy/Core/Shared/Game";
import { Protected } from "@Easy/Core/Shared/Protected";

export default class AvatarCustomizationPanel extends AirshipBehaviour {
	@Header("Templates")
	public colorOptionTemplate: GameObject;
	@Header("References")
	public menu: AvatarMenuComponent;
	public optionsHolder: Transform;

	@HideInInspector()
	public accessoryBuilder: AccessoryBuilder;
	public OnToggle = new Signal<boolean>();

	private openBin = new Bin();
	private gear: PlatformGear;
	private modifiedGear = new Map<string, PlatformGear>();

	public Clear() {
		this.modifiedGear.clear();
	}

	public Open(gear: PlatformGear, customization: OutfitCustomizationSlot | undefined) {
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
				//make accessory the color
				const newColor = ColorUtil.HexToColor(colorStr);
				for (const template of this.gear.accessoryPrefabs) {
					if (template) {
						print("Setting color: " + colorStr + " to slot: " + template.accessorySlot);
						this.accessoryBuilder.SetCustomColor(template.accessorySlot, colorKey, colorStr);
					}
				}
				this.gear.customizationColors[colorIndex].value = newColor;
				this.menu.Dirty();
				options.SetActiveColor(newColor);
			}),
		);
	}

	public Close() {
		this.openBin.Clean();
		NativeTween.AnchoredPositionY(this.transform, -200, 0.5).SetEaseExpoIn();
		this.OnToggle.Fire(false);
	}
}
