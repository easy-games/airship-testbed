import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { MainMenuController } from "../MainMenuController";

export default class AvatarMenuProfileComponent extends AirshipBehaviour {
	private readonly tweenDuration = 0.2;
	public group!: CanvasGroup;
	public renderItemsBtn!: Button;
	public closeBtn!: Button;

	private previousGroup!: CanvasGroup;

	public Init(mainMenu: MainMenuController) {
		// CanvasAPI.OnClickEvent(this.renderItemsBtn.gameObject, () => {
		// 	mainMenu.avatarView?.avatarRenderComponent?.RenderAllItems();
		// });
		// CanvasAPI.OnClickEvent(this.closeBtn.gameObject, () => {
		// 	this.ClosePage();
		// });
	}

	public OpenPage(previousGroup: CanvasGroup) {
		// this.previousGroup = previousGroup;
		// this.previousGroup.interactable = false;
		// this.group.interactable = true;
		// this.previousGroup.TweenCanvasGroupAlpha(0, this.tweenDuration);
		// this.group.TweenCanvasGroupAlpha(1, this.tweenDuration);
	}

	public ClosePage() {
		// this.previousGroup.TweenCanvasGroupAlpha(1, this.tweenDuration);
		// this.group.TweenCanvasGroupAlpha(0, this.tweenDuration);
		// this.group.interactable = false;
		// this.previousGroup.interactable = true;
	}
}
