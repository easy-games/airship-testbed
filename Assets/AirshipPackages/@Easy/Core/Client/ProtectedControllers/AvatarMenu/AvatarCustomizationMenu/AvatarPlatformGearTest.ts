import AvatarCustomizationPanel from "@Easy/Core/Client/ProtectedControllers/AvatarMenu/AvatarCustomizationMenu/AvatarCustomizationPanel";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";

export default class AvatarPlatformGearTest extends AirshipBehaviour {
	@Header("References")
	public customization: AvatarCustomizationPanel;

	@Header("Debugging")
	public testAssets: AccessoryComponent[] = [];

	private testAsset: PlatformGear;

	protected Start(): void {
		this.testAsset = {
			accessoryPrefabs: this.testAssets,
			classId: "aabbcc",
			face: undefined,
			optionColors: [new Color(1, 1, 1, 1)],
			optionVariants: 3,
		};

		if (!Game.IsEditor()) {
			return;
		}

		Airship.Input.OnDown(CoreAction.Interact).Connect((e) => {
			for (const prefab of this.testAsset.accessoryPrefabs) {
				this.customization.accessoryBuilder.Add(prefab);
			}
			this.customization.Open(this.testAsset);
		});
	}
}
