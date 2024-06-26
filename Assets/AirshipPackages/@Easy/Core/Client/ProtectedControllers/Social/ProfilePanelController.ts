import { AssetCache } from "@Easy/Core/Shared/AssetCache/AssetCache";
import { Controller } from "@Easy/Core/Shared/Flamework";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

@Controller({})
export class ProfilePanelController {
    private open = false;
    private openMenuBin = new Bin();

    protected OnStart(): void {
        
    }

    public OpenProfilePanel(canvas: Canvas, position: Vector2) {
        if (this.open) {
            this.openMenuBin.Clean();
        }
        this.open = true;

        const asset = AssetCache.LoadAsset("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/PlayerProfilePanel/PlayerProfilePanel.prefab");
        const menuGo = Object.Instantiate(asset, canvas.transform);

        const canvasRect = canvas.GetComponent<RectTransform>()!;
		const menuRect = menuGo.GetComponent<RectTransform>()!;

        // Clamp so it doesn't go underneath screen
        const bottomY = position.y - menuRect.rect.height;
        const frameY = canvasRect.rect.yMin + 10; // +10 to make it not touch the very bottom of screen
        const amountBelowScreen = frameY - bottomY;
        if (amountBelowScreen > 0) {
            position = position.add(new Vector2(0, amountBelowScreen));
        }

        let mousePosInCanvas = position;
        menuRect.localPosition = new Vector3(mousePosInCanvas.x, mousePosInCanvas.y, 0);


        const mouse = new Mouse();
		this.openMenuBin.Add(
			mouse.leftDown.Connect(() => {
				if (!CanvasAPI.IsPointerOverTarget(menuGo)) {
					this.openMenuBin.Clean();
				}
			}),
		);
		this.openMenuBin.Add(
			mouse.rightDown.Connect(() => {
				if (!CanvasAPI.IsPointerOverTarget(menuGo)) {
					this.openMenuBin.Clean();
				}
			}),
		);

		this.openMenuBin.Add(() => {
			Object.Destroy(menuGo);
		});

		// animate
        const originalPosition = menuRect.localPosition;
        menuRect.localPosition = menuRect.localPosition.add(new Vector3(10, 0, 0));
        menuRect.TweenLocalPosition(originalPosition, 0.1);


		menuRect.localScale = new Vector3(0.95, 0.95, 0.95);
		menuRect.TweenLocalScale(new Vector3(1, 1, 1), 0.1);

		let cleaned = false;
		return () => {
			if (cleaned) return;
			cleaned = true;
			this.openMenuBin.Clean();
		};

    }
}
