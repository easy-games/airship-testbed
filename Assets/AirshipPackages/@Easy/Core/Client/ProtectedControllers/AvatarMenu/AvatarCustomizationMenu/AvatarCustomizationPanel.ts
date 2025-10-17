import { Bin } from "@Easy/Core/Shared/Util/Bin";
import AvatarCustomizationOption_Color from "./AvatarCustomizationOption_Color";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Game } from "@Easy/Core/Shared/Game";
import { Airship } from "@Easy/Core/Shared/Airship";
import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";

export default class AvatarCustomizationPanel extends AirshipBehaviour {
	@Header("Templates")
	public colorOptionTemplate: GameObject;
	@Header("References")
	public optionsHolder: Transform;

	@HideInInspector()
	public accessoryBuilder: AccessoryBuilder;

	private openBin = new Bin();
	private gear: PlatformGear;

	public Open(gear: PlatformGear) {
		this.gear = gear;
		if (this.gear.optionVariants < 2 && (gear.optionColors === undefined || gear.optionColors.size() <= 0)) {
			//No customization options
			print("No customization options");
			this.Close();
			return;
		}

		this.openBin.Clean();
		NativeTween.AnchoredPositionY(this.transform, 0, 0.5).SetEaseExpoOut();

		//Clean previous options
		for (const t of this.optionsHolder) {
			Destroy(t.gameObject);
		}

		//Process customization options
		let i = 0;
		for (const {} of gear.optionColors) {
			this.SpawnColorOptions(i);
			i++;
		}
	}

	protected OnDisable(): void {
		this.openBin.Clean();
	}

	private SpawnColorOptions(index: number) {
		// Create the color option sub panel
		const options = Instantiate(
			this.colorOptionTemplate,
			this.optionsHolder,
		).GetAirshipComponent<AvatarCustomizationOption_Color>()!;
		options.Init("000000", 1);
		const colorIndex = index;

		// Process Color Swapping
		this.openBin.Add(
			options.onSelectColor.Connect((colorStr) => {
				//make accessory the color
				print("Heard new color: " + colorStr);
				const newColor = ColorUtil.HexToColor(colorStr);
				for (const template of this.gear.accessoryPrefabs) {
					if (template) {
						const acc = this.accessoryBuilder.GetAccessoryRenderers(template.accessorySlot);
						if (acc) {
							for (const ren of acc) {
								const urp = ren.GetComponent<MaterialColorURP>();
								if (urp) {
									urp.SetColor(colorIndex, newColor);
								}
							}
						}
					}
				}
			}),
		);
	}

	public Close() {
		this.openBin.Clean();
		NativeTween.AnchoredPositionY(this.transform, -200, 0.5).SetEaseExpoIn();
	}
}
