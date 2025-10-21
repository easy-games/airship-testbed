import { Bin } from "@Easy/Core/Shared/Util/Bin";
import AvatarCustomizationOption_Color from "./AvatarCustomizationOption_Color";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import AvatarMenuComponent from "../AvatarMenuComponent";

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

	public Open(gear: PlatformGear) {
		this.gear = gear;
		if (
			(!this.gear || this.gear.customizationVariantNames.size() < 2) &&
			(!gear?.customizationColors || gear.customizationColors.size() <= 0)
		) {
			//No customization options
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
		for (const color of gear.customizationColors) {
			this.SpawnColorOptions(i, color);
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

		// Process Color Swapping
		this.openBin.Add(
			options.onSelectColor.Connect((colorStr) => {
				//make accessory the color
				print("Heard new color: " + colorStr);
				const newColor = ColorUtil.HexToColor(colorStr);
				for (const template of this.gear.accessoryPrefabs) {
					if (template) {
						this.accessoryBuilder.SetCustomColor(template.accessorySlot, colorIndex, colorStr);
					}
				}
				this.gear.customizationColors[colorIndex].value = newColor;
				this.menu.Dirty();
			}),
		);
	}

	public Close() {
		this.openBin.Clean();
		NativeTween.AnchoredPositionY(this.transform, -200, 0.5).SetEaseExpoIn();
		this.OnToggle.Fire(false);
	}
}
