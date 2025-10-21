import AvatarCustomizationPanel from "@Easy/Core/Client/ProtectedControllers/AvatarMenu/AvatarCustomizationMenu/AvatarCustomizationPanel";
import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";

export default class AvatarPlatformGearTest extends AirshipBehaviour {
	@Header("References")
	public customization: AvatarCustomizationPanel;

	@Header("Debugging")
	public testAsset: AccessoryComponent;

	private testGear: PlatformGear;
	private testing = false;

	protected Start(): void {
		this.testGear = {
			accessoryPrefabs: [this.testAsset],
			classId: "aabbcc",
			face: undefined,
			customizationColors: [
				{ key: "Hair", value: new Color(1, 1, 1, 1), scheme: 1 },
				{ key: "Cubes", value: new Color(0, 1, 1, 1), scheme: 2 },
				{ key: "Main Cube", value: new Color(1, 1, 0, 1), scheme: 2 },
			],

			//, new Color(0, 0, 0, 1), new Color(0, 0, 1, 1)],
			customizationVariantNames: ["Default"],
		};

		if (!Game.IsEditor()) {
			return;
		}

		Airship.Input.OnDown(CoreAction.Interact).Connect((e) => {
			if (this.testing) {
				this.customization.accessoryBuilder.RemoveBySlot(this.testAsset.accessorySlot);
				this.customization.Close();
			} else {
				this.customization.accessoryBuilder.Add(this.testAsset);
				this.customization.Open(this.testGear);
			}
			this.testing = !this.testing;
		});
	}
}
