import { Airship } from "@Easy/Core/Shared/Airship";
import AvatarBackdropComponent, { AvatarBackdropType } from "@Easy/Core/Shared/Avatar/AvatarBackdropComponent";
import { AvatarPlatformAPI } from "@Easy/Core/Shared/Avatar/AvatarPlatformAPI";

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
	EARS,
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
	public itemSkinColor = Color.black;
	public faceSkinColor = Color.white;
	public cameraDistanceBase = 2;
	public cameraDistanceMod = 1;
	public uploadThumbnails = false;

	public RenderCharacter() {
		this.Init();
		this.renderTexture = new RenderTexture(
			this.profileRenderSize.x,
			this.profileRenderSize.y,
			24,
			RenderTextureFormat.ARGB32,
		);
		this.backdrops.SetBackgdrop(AvatarBackdropType.LIGHT_3D);
		this.captureCamera.targetTexture = this.renderTexture;
		this.captureCamera.enabled = false;

		this.SetCameraTransform(0);
		this.Render("ProfilePics/ProfilePicture");
	}

	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	public CreateItemCamera() {
		this.Init();
		this.renderTexture = new RenderTexture(
			this.itemRenderSize.x,
			this.itemRenderSize.y,
			24,
			RenderTextureFormat.ARGB32,
		);
		//this.builder.rig.bodyMesh?.gameObject.SetActive(false);
		//this.builder.rig.faceMesh?.gameObject.SetActive(false);
		//this.builder.rig.head?.gameObject.SetActive(false);

		this.backdrops.SetBackgdrop(AvatarBackdropType.WHITE_FLAT);

		this.captureCamera.targetTexture = this.renderTexture;
		this.captureCamera.enabled = false;
	}

	private Init() {
		if (this.backdrops) {
			return;
		}
		this.backdrops = this.backdropHolder.GetAirshipComponent<AvatarBackdropComponent>()!;
	}

	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	public RenderAllItems() {
		this.CreateItemCamera();
		this.SetupForRenders(false);

		let allItems = Airship.Avatar.GetAllPossibleAvatarItems();

		let i = 0;
		const maxI = 9999;
		for (const [key, value] of allItems) {
			if (i < maxI) {
				this.RenderItem(value);
			} else {
				return;
			}
			i++;
		}
	}

	public SetupForRenders(renderingFaces: boolean) {
		this.builder.SetSkinColor(renderingFaces ? this.faceSkinColor : this.itemSkinColor, true);
	}

	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	public RenderItem(accessoryTemplate: AccessoryComponent) {
		print("Rending item: " + accessoryTemplate.name);
		//Clear the outfit
		this.builder.RemoveAllAccessories(false);
		this.builder.rig.faceMesh.gameObject.SetActive(false);
		//Load the accessory onto the avatar
		let acc = this.builder.AddSingleAccessory(accessoryTemplate, true);
		this.RenderClass(accessoryTemplate.name, accessoryTemplate.serverClassId, accessoryTemplate.accessorySlot);
	}
	/**
	 * Internal use only`.
	 *
	 * @internal
	 */
	public RenderFace(face: AccessoryFace) {
		print("Rending Face: " + face.name);
		//Clear the outfit
		this.builder.RemoveAllAccessories(true);
		//Load the accessory onto the avatar
		this.builder.rig.faceMesh.gameObject.SetActive(true);
		this.builder.SetFaceTexture(face.decalTexture);
		this.RenderClass(face.name, face.serverClassId, AccessorySlot.Face);
	}

	private RenderClass(name: string, serverClassId: string, slot: AccessorySlot) {
		task.wait();
		//Align camera
		//this.AlignCamera(acc.renderers);
		this.SetCameraAccessory(slot);
		//Render
		let renderData = this.Render("AccessoryThumbnails/AccThumbnail_" + name);
		//Upload
		if (this.uploadThumbnails) {
			let classData = Airship.Avatar.GetClass(serverClassId);
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
		const recorder = this.captureCamera.gameObject.GetComponent<CameraScreenshotRecorder>()!;
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
			case AccessorySlot.Nose:
				renderSlot = AvatarRenderSlot.HEAD;
				break;

			case AccessorySlot.Ears:
				renderSlot = AvatarRenderSlot.EARS;
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

		let showBody = renderSlot !== AvatarRenderSlot.EARS;
		this.builder.rig.headMesh?.gameObject.SetActive(showBody);
		this.builder.rig.bodyMesh?.gameObject.SetActive(showBody);
		this.builder.rig.armsMesh?.gameObject.SetActive(showBody);
	}
}
