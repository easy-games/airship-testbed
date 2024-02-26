import { MainMenuController } from "@Easy/Core/Client/MainMenuControllers/MainMenuController";
import { RightClickMenuController } from "@Easy/Core/Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerButton, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class GameImageButton extends AirshipBehaviour {
	private bin = new Bin();

	override Start(): void {
		const rect = this.gameObject.GetComponent<RectTransform>();
		let startPos: Vector3 | undefined;
		this.bin.AddEngineEventConnection(
			CanvasAPI.OnPointerEvent(this.gameObject, (dir, btn) => {
				if (btn === PointerButton.LEFT) {
					if (dir === PointerDirection.DOWN) {
						startPos = rect.localPosition;
						rect.TweenLocalPosition(startPos.sub(new Vector3(0, 2, 0)), 0.05);
					} else if (startPos) {
						rect.localPosition = startPos;
						startPos = undefined;
					}
				} else if (btn === PointerButton.RIGHT && dir === PointerDirection.UP) {
					Dependency<RightClickMenuController>().OpenRightClickMenu(
						Dependency<MainMenuController>().mainContentCanvas,
						new Mouse().GetLocation(),
						[
							{
								text: "Favorite",
								onClick: () => {},
							},
							{
								text: "Report",
								onClick: () => {},
							},
						],
					);
				}
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
