import { AvatarUtil } from "@Easy/Core/Shared/Avatar/AvatarUtil";
import AvatarViewComponent from "@Easy/Core/Shared/Avatar/AvatarViewComponent";
import { Keyboard } from "@Easy/Core/Shared/UserInput";

export default class AvatarRenderComponent extends AirshipBehaviour {
	private readonly renderSize = new Vector2(410, 512);

	private renderTexture?: RenderTexture;
	private avatarView!: AvatarViewComponent;

	public builder!: AccessoryBuilder;
	public captureCamera!: Camera;

	override Start() {
		this.Init();
	}

	public Init() {
		let keyboard = new Keyboard();
		keyboard.OnKeyDown(KeyCode.Print, (event) => {
			if (Input.GetKey(KeyCode.LeftShift)) {
				this.RenderAllItems();
			}
		});
	}

	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	public RenderAllItems() {
		if (!this.renderTexture) {
			this.renderTexture = new RenderTexture(
				this.renderSize.x,
				this.renderSize.y,
				24,
				RenderTextureFormat.ARGB32,
			);
		}
		this.captureCamera.targetTexture = this.renderTexture;
		this.captureCamera.enabled = true;
		let allItems = AvatarUtil.GetAllPossibleAvatarItems();

		let i = 0;
		const maxI = 5;
		for (const [key, value] of allItems) {
			//Clear the outfit
			this.builder.RemoveClothingAccessories();
			if (i < maxI) {
				this.RenderItem(value);
			} else {
				return;
			}
			i++;
		}
	}

	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	public RenderItem(accessoryTemplate: AccessoryComponent) {
		print("Rending item: " + accessoryTemplate.name);
		//Load the accessory onto the avatar
		this.builder.AddSingleAccessory(accessoryTemplate, true);

		//Move the camera into position
		let targetTransform = this.avatarView.GetFocusTransform(accessoryTemplate.accessorySlot);
		if (targetTransform) {
			this.captureCamera.transform.position = targetTransform.position;
			this.captureCamera.transform.rotation = targetTransform.rotation;
		}

		//Wait a frame so the camera renders
		task.wait();

		//Save the picture locally
		const recorder = this.captureCamera.gameObject.GetComponent<CameraScreenshotRecorder>();
		if (recorder && this.renderTexture) {
			recorder.SaveRenderTexture(this.renderTexture, "AccThumbnail_" + accessoryTemplate.name, true);
		} else {
			error("Trying to save render with no recorder");
		}

		//Upload the picture to this accessory
	}
}
