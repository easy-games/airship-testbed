import {} from "@easy-games/flamework-core";
import MainMenuPageComponent from "../MenuPageComponent";

export default class AvatarMenuComponent extends MainMenuPageComponent {
	override OpenPage(): void {
		super.OpenPage();
		print("Open AVATAR");
	}
	override ClosePage(): void {
		super.ClosePage();
		print("Close AVATAR");
	}
}
