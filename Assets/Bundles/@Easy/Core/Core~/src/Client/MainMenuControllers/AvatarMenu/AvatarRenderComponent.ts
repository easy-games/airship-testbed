import AvatarBackdropComponent, { AvatarBackdrop } from "@Easy/Core/Shared/Avatar/AvatarBackdropComponent";
import { AvatarPlatformAPI } from "@Easy/Core/Shared/Avatar/AvatarPlatformAPI";
import { AvatarUtil } from "@Easy/Core/Shared/Avatar/AvatarUtil";
import Character from "@Easy/Core/Shared/Character/Character";
import { Keyboard } from "@Easy/Core/Shared/UserInput";

export enum AvatarRenderSlot {
	BODY,
	FACE,
	HAIR,
	HEAD,
	TORSO,
	BACK,
	HANDS,
	LEGS,
	FEET,
}

export default class AvatarRenderComponent extends AirshipBehaviour {
	private readonly itemRenderSize = new Vector2(410, 512);
	private readonly profileRenderSize = new Vector2(1024, 1024);

	private renderTexture?: RenderTexture;
	private backdrops!: AvatarBackdropComponent;

	@Header("References")
	public builder!: AccessoryBuilder;
	public backdropHolder!: GameObject;
	public captureCamera!: Camera;
	public cameraTransforms!: Transform[];

	@Header("Variables")
	public cameraDistanceBase = 2;
	public cameraDistanceMod = 1;
	public uploadThumbnails = false;

	override Start() {
		this.Init();
	}

	public Init() {
		this.backdrops = this.backdropHolder.GetAirshipComponent<AvatarBackdropComponent>()!;
		if (this.builder) {
			this.builder.thirdPersonLayer = this.gameObject.layer;
			this.builder.firstPersonLayer = this.gameObject.layer;
		}
		let keyboard = new Keyboard();
		keyboard.OnKeyDown(KeyCode.Print, (event) => {
			if (Input.GetKey(KeyCode.LeftShift)) {
				this.RenderCharacter();
				this.RenderAllItems();
			}
		});
	}

	public RenderCharacter() {
		this.renderTexture = new RenderTexture(
			this.profileRenderSize.x,
			this.profileRenderSize.y,
			24,
			RenderTextureFormat.ARGB32,
		);
		this.backdrops.SetBackgdrop(AvatarBackdrop.LIGHT_3D);
		this.captureCamera.targetTexture = this.renderTexture;
		this.captureCamera.enabled = false;

		this.SetCameraTransform(0);
		this.Render("ProfilePics/ProfilePicture");
		this.backdrops.SetBackgdrop(AvatarBackdrop.NONE);
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
		//this.builder.rig.bodyMesh?.gameObject.SetActive(false);
		//this.builder.rig.faceMesh?.gameObject.SetActive(false);
		//this.builder.rig.head?.gameObject.SetActive(false);

		this.backdrops.SetBackgdrop(AvatarBackdrop.NONE);

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
		//this.AlignCamera(acc.renderers);
		this.SetCameraAccessory(accessoryTemplate.accessorySlot);
		//Render
		let renderData = this.Render("AccessoryThumbnails/AccThumbnail_" + accessoryTemplate.name);
		//Upload
		if (this.uploadThumbnails) {
			let classData = AvatarUtil.GetClass(accessoryTemplate.serverClassId);
			if (classData) {
				print("uploading accessory render");
				AvatarPlatformAPI.UploadItemImage(
					classData.classId,
					classData.resourceId,
					renderData.path,
					renderData.filesize,
				);
			}
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
			new Vector3(0.15, 0.25, -(this.cameraDistanceBase + distance * this.cameraDistanceMod)),
		);
		this.captureCamera.transform.LookAt(focusPoint);
	}

	private SetCameraAccessory(slot: AccessorySlot) {
		let renderSlot = AvatarRenderSlot.BODY;
		switch (slot) {
			case AccessorySlot.Face:
				renderSlot = AvatarRenderSlot.FACE;
				break;
			case AccessorySlot.Hair:
				renderSlot = AvatarRenderSlot.HAIR;
				break;
			case AccessorySlot.Head:
			case AccessorySlot.Neck:
			case AccessorySlot.Ears:
			case AccessorySlot.Nose:
				renderSlot = AvatarRenderSlot.HEAD;
				break;
			case AccessorySlot.Waist:
			case AccessorySlot.TorsoInner:
			case AccessorySlot.TorsoOuter:
			case AccessorySlot.Torso:
				renderSlot = AvatarRenderSlot.TORSO;
				break;
			case AccessorySlot.Backpack:
				renderSlot = AvatarRenderSlot.BACK;
				break;
			case AccessorySlot.Hands:
			case AccessorySlot.LeftHand:
			case AccessorySlot.RightHand:
			case AccessorySlot.HandsOuter:
				renderSlot = AvatarRenderSlot.HANDS;
				break;
			case AccessorySlot.Legs:
			case AccessorySlot.LegsInner:
			case AccessorySlot.LegsOuter:
				renderSlot = AvatarRenderSlot.LEGS;
				break;
			case AccessorySlot.Feet:
			case AccessorySlot.LeftFoot:
			case AccessorySlot.RightFoot:
			case AccessorySlot.FeetInner:
				renderSlot = AvatarRenderSlot.FEET;
				break;
		}
		this.SetCameraTransform(renderSlot);
	}
	private SetCameraTransform(renderSlot: AvatarRenderSlot) {
		const transform = this.cameraTransforms[renderSlot];
		this.captureCamera.transform.position = transform.position;
		this.captureCamera.transform.rotation = transform.rotation;
	}
}
