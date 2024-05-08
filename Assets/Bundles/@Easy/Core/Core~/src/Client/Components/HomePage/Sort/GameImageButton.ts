import { MainMenuController } from "@Easy/Core/Client/ProtectedControllers/MainMenuController";
import { MainMenuBlockSingleton } from "@Easy/Core/Client/ProtectedControllers/Settings/MainMenuBlockSingleton";
import { RightClickMenuButton } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuButton";
import { RightClickMenuController } from "@Easy/Core/Client/ProtectedControllers/UI/RightClickMenu/RightClickMenuController";
import { Dependency } from "@Easy/Core/Shared/Flamework";
import { Game } from "@Easy/Core/Shared/Game";
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
		const rect = this.gameObject.GetComponent<RectTransform>()!;
		let startPos: Vector3 | undefined;

		const gameComponent = this.gameComponentGO?.GetAirshipComponent<HomePageGameComponent>();

		const mouse = new Mouse();
		if (Game.IsMobile()) {
			const longPress = this.gameObject.GetComponent<AirshipLongPress>()!;
			if (longPress) {
				this.bin.AddEngineEventConnection(
					longPress.OnLongPress((pressPos) => {
						Dependency<RightClickMenuController>().OpenRightClickMenu(
							Dependency<MainMenuController>().mainContentCanvas,
							pressPos,
							[
								{
									text: "Report",
									onClick: () => {
										task.spawn(() => {
											Dependency<MainMenuBlockSingleton>().BlockGameAsync(
												gameComponent!.gameDto.id,
												gameComponent!.gameDto.name,
											);
											this.transform.parent!.gameObject.SetActive(false);
										});
									},
								},
							],
						);
					}),
				);
			}
		}

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
							text: "Report",
							onClick: () => {
								task.spawn(() => {
									Dependency<MainMenuBlockSingleton>().BlockGameAsync(
										gameComponent!.gameDto.id,
										gameComponent!.gameDto.name,
									);
									this.transform.parent!.gameObject.SetActive(false);
								});
							},
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
						Mouse.global.GetPosition(),
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
