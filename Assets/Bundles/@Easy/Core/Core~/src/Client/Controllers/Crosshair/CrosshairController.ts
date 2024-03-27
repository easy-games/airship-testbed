import { CoreRefs } from "Shared/CoreRefs";
import { Controller, OnStart } from "Shared/Flamework";
import { Modifier } from "Shared/Util/Modifier";

@Controller({})
export class CrosshairController implements OnStart {
	private crosshairPrefab?: GameObject;
	private crosshairImage?: Image;
	private crosshairModifier = new Modifier<{ disabled: boolean }>();
	private crosshairVisible = false;
	private enabled = false;

	constructor() {}

	OnStart(): void {
		this.crosshairPrefab = Object.Instantiate<GameObject>(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/Crosshair/CrosshairUI.prefab"),
			CoreRefs.rootTransform,
		);
		this.crosshairImage = this.crosshairPrefab.transform.FindChild("Crosshair")!.GetComponent<Image>();
		this.crosshairImage.enabled = false;

		this.crosshairModifier.Observe((tickets) => {
			let shouldBeDisabled = tickets.some((v) => v.disabled);
			this.SetVisible(!shouldBeDisabled);
		});
	}

	public SetEnabled(enabled: boolean): void {
		this.enabled = enabled;
		this.SetVisible(enabled);
	}

	private SetVisible(visible: boolean) {
		if (this.crosshairVisible === visible) return;
		this.crosshairVisible = visible;
		if (this.crosshairImage) this.crosshairImage.enabled = visible;
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
