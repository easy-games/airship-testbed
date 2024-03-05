import { AvatarPlatformAPI } from "@Easy/Core/Shared/Avatar/AvatarPlatformAPI";
import { AvatarUtil } from "@Easy/Core/Shared/Avatar/AvatarUtil";
import AvatarViewComponent, { AvatarBackdrop } from "@Easy/Core/Shared/Avatar/AvatarViewComponent";
import { Keyboard } from "@Easy/Core/Shared/UserInput";

export default class AvatarRenderComponent extends AirshipBehaviour {
	private readonly itemRenderSize = new Vector2(410, 512);
	private readonly profileRenderSize = new Vector2(1024, 1024);

	private renderTexture?: RenderTexture;
	private avatarView!: AvatarViewComponent;
	private captureCamera!: Camera;

	@Header("References")
	public builder!: AccessoryBuilder;
	public rig!: CharacterRig;
	public avatarViewHolder!: GameObject;

	@Header("Variables")
	public cameraDistanceMod = 1;

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

		this.ResetCamera();
		this.Render("ProfilePics/ProfilePicture");
		this.avatarView.SetBackgdrop(AvatarBackdrop.DARK_3D);
	}

	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	public RenderAllItems() {
		print("RENDERING ALL ITEMS!");
		this.renderTexture = new RenderTexture(
			this.itemRenderSize.x,
			this.itemRenderSize.y,
			24,
			RenderTextureFormat.ARGB32,
		);
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
		let acc = this.builder.AddSingleAccessory(accessoryTemplate, true);
		//Align camera
		this.AlignCamera(acc.renderers);
		//Render
		let renderData = this.Render("AccessoryThumbnails/AccThumbnail_" + accessoryTemplate.name);
		//Upload
		let classData = AvatarUtil.GetClass(accessoryTemplate.serverClassId);
		if (classData) {
			print("uploading accessory render");
			AvatarPlatformAPI.UploadItemImage(classData.resourceId, renderData.path, renderData.filesize);
		}
	}

	private Render(fileName: string) {
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

	private AlignCamera(meshes: CSArray<Renderer>) {
		let totalBounds: Bounds | undefined = undefined;
		for (let index = 0; index < meshes.Length; index++) {
			const mesh = meshes.GetValue(index);
			if (!totalBounds) {
				totalBounds = mesh.bounds;
			} else {
				totalBounds.Encapsulate(mesh.bounds);
			}
		}
		let focusPoint = Vector3.zero;
		let distance = 1;
		if (totalBounds) {
			focusPoint = totalBounds.center;
			distance = totalBounds.size.x;
		}

		this.captureCamera.transform.position = focusPoint.add(
			new Vector3(0.15, 0.25, 1 + -distance * this.cameraDistanceMod),
		);
		this.captureCamera.transform.LookAt(focusPoint);
	}

	private ResetCamera() {
		if (this.avatarView.cameraWaypointDefault) {
			this.captureCamera.transform.position = this.avatarView.cameraWaypointDefault.position;
			this.captureCamera.transform.rotation = this.avatarView.cameraWaypointDefault.rotation;
		} else {
			this.captureCamera.transform.position = Vector3.zero;
			this.captureCamera.transform.rotation = Quaternion.identity;
		}
	}
}
