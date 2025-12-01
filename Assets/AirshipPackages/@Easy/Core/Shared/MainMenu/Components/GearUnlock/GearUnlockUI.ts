import { Game } from "@Easy/Core/Shared/Game";
import { TweenEasingFunction } from "@Easy/Core/Shared/Tween/EasingFunctions";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

export default class GearUnlockUI extends AirshipBehaviour {
	public camera: Camera;
	public targetGearParent: Transform;
	public accessory: AccessoryComponent;
	@NonSerialized()
	public renderTexture: RenderTexture;
	public rawImage: RawImage;

	public continueBtn: Button;
	public verticalList: VerticalLayoutGroup;
	public titleText: TMP_Text;
	public messageText: TMP_Text;
	public messageLayoutElement: LayoutElement;
	public wrapper: RectTransform;

	@Header("Dummy")
	public dummy: Transform;
	public dummyBodyMesh: SkinnedMeshRenderer;

	private targetGearCenter = Vector3.zero;
	private bin = new Bin();
	private openTime = 0;

	override OnEnable(): void {
		this.openTime = Time.time;
		this.wrapper.localScale = Vector3.one.mul(1.1);
		NativeTween.LocalScale(this.wrapper, Vector3.one, 0.2).SetEaseQuadOut();

		if (this.renderTexture) {
			this.camera.targetTexture = undefined as unknown as RenderTexture;
			this.renderTexture.Release();
			Destroy(this.renderTexture);
		}
		this.rawImage.enabled = false;
		this.renderTexture = new RenderTexture(Screen.width, Screen.height, 24, RenderTextureFormat.ARGB32);
		this.camera.targetTexture = this.renderTexture;
		this.rawImage.texture = this.renderTexture;

		if (Game.deviceType !== AirshipDeviceType.Phone) {
			const rect = this.verticalList.transform as RectTransform;
			rect.anchoredPosition = new Vector2(0, 150);

			this.messageLayoutElement.preferredWidth = 700;
		}
	}

	public Init(gearNotificationId: string): void {
		this.bin.Add(
			this.continueBtn.onClick.Connect(() => {
				task.spawnDetached(async () => {
					await client.userNotifications.deleteNotifications({
						notificationIds: [gearNotificationId],
					});
				});
				this.gameObject.SetActive(false);
			}),
		);
	}

	protected OnDisable(): void {
		this.bin.Clean();
		if (this.renderTexture) {
			this.camera.targetTexture = undefined as unknown as RenderTexture;
			this.renderTexture.Release();
			Destroy(this.renderTexture);
		}
	}

	public SetGear(gear: PlatformGear, title: string, message: string): void {
		this.titleText.text = title;
		this.messageText.text = message;

		this.rawImage.enabled = true;
		this.targetGearParent.gameObject.ClearChildren();
		const acc = Instantiate(gear.accessoryPrefabs[0], this.targetGearParent);
		acc.gameObject.SetLayerRecursive(17);
		acc.transform.localPosition = Vector3.zero;
		acc.transform.localRotation = Quaternion.Euler(-90, 70, 0);
		this.accessory = acc;

		// Starting rotation
		this.targetGearParent.localRotation = Quaternion.Euler(0, 180, 0);
		this.dummy.localRotation = Quaternion.Euler(0, 250, 0);

		const meshRenderers = this.accessory.gameObject.GetComponentsInChildren<MeshRenderer>();
		if (meshRenderers.size() > 0) {
			this.targetGearCenter = meshRenderers[0].bounds.center;

			for (let meshRenderer of meshRenderers) {
				for (let mat of meshRenderer.sharedMaterials) {
					if (!mat.shader.isSupported) {
						mat.shader = Shader.Find("Universal Render Pipeline/Lit");
					}
				}
			}
		}

		const skinnedMeshRenderers = this.accessory.gameObject.GetComponentsInChildren<SkinnedMeshRenderer>();
		if (skinnedMeshRenderers.size() > 0) {
			this.targetGearCenter = skinnedMeshRenderers[0].bounds.center;

			for (let smr of skinnedMeshRenderers) {
				smr.rootBone = this.dummyBodyMesh.rootBone;
				smr.bones = this.dummyBodyMesh.bones;

				for (let mat of smr.sharedMaterials) {
					if (!mat.shader.isSupported) {
						mat.shader = Shader.Find("Universal Render Pipeline/Lit");
					}
				}
			}
		}
	}

	protected Update(dt: number): void {
		const cameraTransform = this.camera.transform;

		let zOffset = 0;
		let timeSinceStart = Time.time - this.openTime;
		if (timeSinceStart <= 1) {
			zOffset = TweenEasingFunction.OutQuad(timeSinceStart, 1, -1, 1);
		}
		cameraTransform.position = this.targetGearCenter.add(new Vector3(0, 0, -3.5 - zOffset));
		cameraTransform.LookAt(this.targetGearCenter);

		// Static Renderers
		this.targetGearParent.RotateAround(this.targetGearCenter, Vector3.up, -35 * dt);

		// Skinned Mesh Renderers
		this.dummy.RotateAround(this.targetGearCenter, Vector3.up, -35 * dt);
	}

	override OnDestroy(): void {}
}
