import { Controller } from "@easy-games/flamework-core";
import { Modifier } from "Shared/Util/Modifier";

@Controller({})
export class CrosshairController {
    private crosshairPrefab: GameObject;
	private crosshairImage: Image;
    private crosshairModifier = new Modifier<{ disabled: boolean }>();
    private crosshairVisible = true;

	constructor() {
		this.crosshairPrefab = Object.Instantiate<GameObject>(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/Crosshair/CrosshairUI.prefab"),
		);
        this.crosshairImage = this.crosshairPrefab.transform.FindChild("Crosshair")!.GetComponent<Image>();

        this.crosshairModifier.Observe((tickets) => {
            let shouldBeDisabled = tickets.some(v => v.disabled);
            this.SetVisible(!shouldBeDisabled);
        })
	}

    private SetVisible(visible: boolean) {
        if (this.crosshairVisible === visible) return;
        this.crosshairVisible = visible;
        this.crosshairImage.enabled = visible
    }

    /**
     * Registers a disabler for the crosshair
     * @returns A cleanup function you can call to remove this disabler
     */
    public AddDisabler(): () => void {
        return this.crosshairModifier.Add({ disabled: true });
    }

    public IsVisible() {
        return this.crosshairVisible;
    }

	
}
