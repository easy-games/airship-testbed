import { AssetCache } from "@Easy/Core/Shared/AssetCache/AssetCache";
import { Game } from "@Easy/Core/Shared/Game";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Theme } from "@Easy/Core/Shared/Util/Theme";
import { Controller, OnStart } from "Shared/Flamework";
import { CoreUI } from "Shared/UI/CoreUI";
import { Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI, HoverState } from "Shared/Util/CanvasAPI";
import { RightClickMenuButton } from "./RightClickMenuButton";

@Controller({})
export class RightClickMenuController implements OnStart {
	private opened = false;
	private currentBin = new Bin();
	private openedTime = 0;

	constructor() {}

	OnStart(): void {}

	public OpenRightClickMenu(canvas: Canvas, position: Vector2, buttons: RightClickMenuButton[]): () => void {
		if (this.opened) {
			this.currentBin.Clean();
			return () => {};
		}
		this.opened = true;
		this.currentBin.Add(() => {
			this.opened = false;
		});
		this.openedTime = Time.time;

		const parentGo = Object.Instantiate(
			AssetCache.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/RightClickMenu/RightClickMenu.prefab"),
			canvas.transform,
		);
		const bgGo = parentGo.transform.GetChild(0).gameObject;
		const menuGo = parentGo.transform.GetChild(1).gameObject;
		menuGo.ClearChildren();

		this.currentBin.AddEngineEventConnection(
			CanvasAPI.OnClickEvent(bgGo, () => {
				this.currentBin.Clean();
			}),
		);

		const canvasRect = canvas.GetComponent<RectTransform>();
		const menuRect = menuGo.GetComponent<RectTransform>();

		let mousePosInCanvas = Bridge.ScreenPointToLocalPointInRectangle(
			canvasRect,
			new Vector2(position.x, position.y),
		);

		if (mousePosInCanvas.x + menuRect.sizeDelta.x > canvasRect.sizeDelta.x / 2) {
			menuRect.anchorMin = Vector2.one;
			menuRect.anchorMax = Vector2.one;
			menuRect.pivot = Vector2.one;
		}
		if (mousePosInCanvas.y - menuRect.sizeDelta.y < -canvasRect.sizeDelta.y / 2) {
			menuRect.anchorMin = new Vector2(menuRect.anchorMin.x, 0);
			menuRect.anchorMax = new Vector2(menuRect.anchorMax.x, 0);
			menuRect.pivot = new Vector2(menuRect.pivot.x, 0);
		}
		menuRect.transform.position = new Vector3(position.x, position.y, 0);

		const buttonPrefab = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Shared/Resources/Prefabs/UI/RightClickMenu/RightClickButton.prefab",
		) as GameObject;

		for (const button of buttons) {
			const buttonGo = Object.Instantiate(buttonPrefab, menuGo.transform);
			const btnImage = buttonGo.GetComponent<Image>();
			const refs = buttonGo.GetComponent<GameObjectReferences>();
			const text = refs.GetValue("UI", "Text") as TMP_Text;
			text.text = button.text;

			CoreUI.SetupButton(buttonGo, { noHoverSound: true });
			this.currentBin.AddEngineEventConnection(
				CanvasAPI.OnClickEvent(buttonGo, () => {
					button.onClick();
					this.currentBin.Clean();
				}),
			);
			if (!Game.IsMobile()) {
				this.currentBin.AddEngineEventConnection(
					CanvasAPI.OnHoverEvent(buttonGo, (hoverState) => {
						btnImage.color = hoverState === HoverState.ENTER ? Theme.primary : new Color(0, 0, 0, 0);
						text.color = hoverState === HoverState.ENTER ? Theme.white : ColorUtil.HexToColor("#B2B2B2");
					}),
				);
			}
		}

		const mouse = new Mouse();
		this.currentBin.Add(
			mouse.leftDown.Connect(() => {
				if (!CanvasAPI.IsPointerOverTarget(menuGo)) {
					this.currentBin.Clean();
				}
			}),
		);
		this.currentBin.Add(
			mouse.rightDown.Connect(() => {
				if (Time.time !== this.openedTime) {
					this.currentBin.Clean();
				}
			}),
		);

		this.currentBin.Add(() => {
			Object.Destroy(parentGo);
		});

		// animate
		menuRect.localScale = new Vector3(0, 0, 0);
		menuRect.TweenLocalScale(new Vector3(1, 1, 1), 0.1);

		let cleaned = false;
		return () => {
			if (cleaned) return;
			cleaned = true;
			this.currentBin.Clean();
		};
	}
}
