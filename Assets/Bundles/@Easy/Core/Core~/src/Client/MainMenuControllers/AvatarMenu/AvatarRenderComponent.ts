import { AvatarUtil } from "@Easy/Core/Shared/Avatar/AvatarUtil";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";

export default class AvatarRenderComponent extends AirshipBehaviour {
	private readonly tweenDuration = 0.2;
	public group!: CanvasGroup;
	public renderItemsBtn!: Button;
	public closeBtn!: Button;

	private previousGroup!: CanvasGroup;

	override Awake() {
		CanvasAPI.OnClickEvent(this.renderItemsBtn.gameObject, () => {
			this.RenderAllItems();
		});
		CanvasAPI.OnClickEvent(this.closeBtn.gameObject, () => {
			this.ClosePage();
		});
	}

	public OpenPage(previousGroup: CanvasGroup) {
		this.previousGroup = previousGroup;
		this.previousGroup.interactable = false;
		this.group.interactable = true;
		this.previousGroup.TweenCanvasGroupAlpha(0, this.tweenDuration);
		this.group.TweenCanvasGroupAlpha(1, this.tweenDuration);
	}

	public ClosePage() {
		this.previousGroup.TweenCanvasGroupAlpha(1, this.tweenDuration);
		this.group.TweenCanvasGroupAlpha(0, this.tweenDuration);
		this.group.interactable = false;
		this.previousGroup.interactable = true;
	}

	public RenderAllItems() {
		let allItems = AvatarUtil.GetAllPossibleAvatarItems();
		for (const [key, value] of allItems) {
			this.RenderItem(value);
		}
	}

	public RenderItem(accesoryTemplate: AccessoryComponent) {
		print("Rending item: " + accesoryTemplate.name);
	}
}
