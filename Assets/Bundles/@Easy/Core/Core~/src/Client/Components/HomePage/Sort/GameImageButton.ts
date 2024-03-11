import { MainMenuController } from "@Easy/Core/Client/MainMenuControllers/MainMenuController";
import { RightClickMenuButton } from "@Easy/Core/Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuButton";
import { RightClickMenuController } from "@Easy/Core/Client/MainMenuControllers/UI/RightClickMenu/RightClickMenuController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI, PointerButton, PointerDirection } from "@Easy/Core/Shared/Util/CanvasAPI";
import { EncodeJSON } from "@Easy/Core/Shared/json";
import HomePageGameComponent from "./HomePageGameComponent";

export default class GameImageButton extends AirshipBehaviour {
	public gameComponentGO?: GameObject;
	private bin = new Bin();

	override Start(): void {
		const rect = this.gameObject.GetComponent<RectTransform>();
		let startPos: Vector3 | undefined;

		const gameComponent = this.gameComponentGO?.GetAirshipComponent<HomePageGameComponent>();

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
					let actions: RightClickMenuButton[] = [
						{
							text: "Favorite",
							onClick: () => {},
						},
						{
							text: "Report",
							onClick: () => {},
						},
					];
					if (gameComponent?.HasAdminPermissions()) {
						actions.push({
							text: "Restart Servers",
							onClick: () => {
								task.spawn(() => {
									const res = InternalHttpManager.PostAsync(
										AirshipUrl.DeploymentService + "/game-servers/shutdown",
										EncodeJSON({
											gameId: gameComponent.gameDto.id,
										}),
									);
									if (res.success) {
										print("Successfully restarted servers for game " + gameComponent.gameDto.name);
									} else {
										error("Failed to restart servers: " + res.error);
									}
								});
							},
						});
					}
					Dependency<RightClickMenuController>().OpenRightClickMenu(
						Dependency<MainMenuController>().mainContentCanvas,
						new Mouse().GetLocation(),
						actions,
					);
				}
			}),
		);
	}

	override OnDestroy(): void {
		this.bin.Clean();
	}
}
