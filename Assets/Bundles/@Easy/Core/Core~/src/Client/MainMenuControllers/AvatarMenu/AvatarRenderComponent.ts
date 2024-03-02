import { AvatarUtil } from "@Easy/Core/Shared/Avatar/AvatarUtil";
import AvatarViewComponent, { AvatarBackdrop } from "@Easy/Core/Shared/Avatar/AvatarViewComponent";
import { Keyboard } from "@Easy/Core/Shared/UserInput";

export default class AvatarRenderComponent extends AirshipBehaviour {
	private readonly itemRenderSize = new Vector2(410, 512);
	private readonly profileRenderSize = new Vector2(512, 512);

	private renderTexture?: RenderTexture;
	private avatarView!: AvatarViewComponent;
	private captureCamera!: Camera;

	public builder!: AccessoryBuilder;
	public rig!: CharacterRig;
	public avatarViewHolder!: GameObject;

	override Start() {
		this.Init();
	}

	public Init() {
		this.avatarView = this.avatarViewHolder.GetAirshipComponent<AvatarViewComponent>()!;
		this.captureCamera = this.gameObject.GetComponent<Camera>();
		let keyboard = new Keyboard();
		keyboard.OnKeyDown(KeyCode.Print, (event) => {
			if (Input.GetKey(KeyCode.LeftShift)) {
				this.RenderCharacter();
				this.RenderAllItems();
			}
		});
	}

	public RenderCharacter() {
		if (!this.renderTexture) {
			this.renderTexture = new RenderTexture(
				this.profileRenderSize.x,
				this.profileRenderSize.y,
				24,
				RenderTextureFormat.ARGB32,
			);
		}
		this.avatarView.SetBackgdrop(AvatarBackdrop.LIGHT_3D);
		this.captureCamera.targetTexture = this.renderTexture;
		this.captureCamera.enabled = false;

		this.RenderSlot(AccessorySlot.Root, "ProfilePics/ProfilePicture");
		this.avatarView.SetBackgdrop(AvatarBackdrop.DARK_3D);
	}

	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	public RenderAllItems() {
		print("RENDERING ALL ITEMS!");
		if (!this.renderTexture) {
			this.renderTexture = new RenderTexture(
				this.itemRenderSize.x,
				this.itemRenderSize.y,
				24,
				RenderTextureFormat.ARGB32,
			);
		}
		this.rig.bodyMesh?.gameObject.SetActive(false);
		this.rig.faceMesh?.gameObject.SetActive(false);
		this.rig.head?.gameObject.SetActive(false);

		this.avatarView.SetBackgdrop(AvatarBackdrop.NONE);

		this.captureCamera.targetTexture = this.renderTexture;
		this.captureCamera.enabled = false;
		let allItems = AvatarUtil.GetAllPossibleAvatarItems();

		let i = 0;
		const maxI = 9999;
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
		this.avatarView.SetBackgdrop(AvatarBackdrop.DARK_3D);
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
		//Render
		let path = this.RenderSlot(
			accessoryTemplate.accessorySlot,
			"AccessoryThumbnails/AccThumbnail_" + accessoryTemplate.name,
		);
		//Upload
		///...
	}

	private RenderSlot(slot: AccessorySlot, fileName: string) {
		//Move the camera into position
		let targetTransform = this.rig.GetSlotTransform(slot);
		if (targetTransform === this.rig.rootMotion) {
			this.captureCamera.transform.localPosition = new Vector3(0, 1, -2);
		} else {
			this.captureCamera.transform.position = targetTransform.position.add(new Vector3(0, 0, -1));
		}

		//Wait a frame so the camera can render
		task.wait();
		//Render Camera
		this.captureCamera.Render();

		//Save the picture locally
		const recorder = this.captureCamera.gameObject.GetComponent<CameraScreenshotRecorder>();
		if (recorder && this.renderTexture) {
			return recorder.SaveRenderTexture(this.renderTexture, fileName, true);
		} else {
			error("Trying to save render with no recorder");
		}
	}
}
