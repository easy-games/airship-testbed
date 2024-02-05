import { Controller, OnStart } from "Shared/Flamework";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { CoreUI } from "Shared/UI/CoreUI";
import { Mouse } from "Shared/UserInput";
import { Bin } from "Shared/Util/Bin";
import { CanvasAPI } from "Shared/Util/CanvasAPI";
import { RightClickMenuButton } from "./RightClickMenuButton";

@Controller({})
export class RightClickMenuController implements OnStart {
	private opened = false;
	private currentBin = new Bin();
	private openedTime = 0;

	constructor() {}

	OnStart(): void {}

	public OpenRightClickMenu(canvas: Canvas, position: Vector3, buttons: RightClickMenuButton[]): () => void {
		if (this.opened) {
			this.currentBin.Clean();
			return () => {};
		}
		this.opened = true;
		this.currentBin.Add(() => {
			this.opened = false;
		});
		this.openedTime = Time.time;

		const menuGo = GameObjectUtil.InstantiateIn(
			AssetBridge.Instance.LoadAsset(
				"@Easy/Core/Shared/Resources/Prefabs/UI/RightClickMenu/RightClickMenu.prefab",
			),
			canvas.transform,
		);
		menuGo.gameObject.ClearChildren();

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
		menuRect.transform.position = position;

		const buttonPrefab = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Shared/Resources/Prefabs/UI/RightClickMenu/RightClickButton.prefab",
		) as GameObject;

		for (const button of buttons) {
			const buttonGo = GameObjectUtil.InstantiateIn(buttonPrefab, menuGo.transform);
			const refs = buttonGo.GetComponent<GameObjectReferences>();
			const text = refs.GetValue("UI", "Text") as TMP_Text;
			text.text = button.text;

			CoreUI.SetupButton(buttonGo, { noHoverSound: true });
			CanvasAPI.OnClickEvent(buttonGo, () => {
				button.onClick();
				this.currentBin.Clean();
			});
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
			GameObjectUtil.Destroy(menuGo);
		});

		let cleaned = false;
		return () => {
			if (cleaned) return;
			cleaned = true;
			this.currentBin.Clean();
		};
	}
}
