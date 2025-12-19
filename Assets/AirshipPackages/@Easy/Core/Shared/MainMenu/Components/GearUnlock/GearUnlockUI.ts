import { Game } from "@Easy/Core/Shared/Game";
import { TweenEasingFunction } from "@Easy/Core/Shared/Tween/EasingFunctions";
import { GameCoordinatorClient } from "@Easy/Core/Shared/TypePackages/game-coordinator-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import GearUnlockCanvas from "./GearUnlockCanvas";

const client = new GameCoordinatorClient(UnityMakeRequest(AirshipUrl.GameCoordinator));

export default class GearUnlockUI extends AirshipBehaviour {
	public camera: Camera;
	public targetGearParent: Transform;
	@NonSerialized() public accessory: AccessoryComponent;
	@NonSerialized() public renderTexture: RenderTexture;

	// public wrapper: RectTransform;

	public portraitCanvas: GearUnlockCanvas;
	public landscapeCanvas: GearUnlockCanvas;
	private activeCanvas: GearUnlockCanvas;

	@Header("Dummy")
	public dummy: Transform;
	public dummyBodyMesh: SkinnedMeshRenderer;
	public dummyAccessoryBuilder: AccessoryBuilder;

	private targetGearCenter = Vector3.zero;
	private bin = new Bin();
	private openTime = 0;

	override OnEnable(): void {
		if (Game.IsMobile() && Game.IsPortrait()) {
			this.activeCanvas = this.portraitCanvas;
		} else {
			this.activeCanvas = this.landscapeCanvas;
		}
		this.landscapeCanvas.gameObject.SetActive(false);
		this.portraitCanvas.gameObject.SetActive(false);

		this.openTime = Time.time;
		// this.wrapper.localScale = Vector3.one.mul(1.1);
		// NativeTween.LocalScale(this.wrapper, Vector3.one, 0.2).SetEaseQuadOut();

		if (this.renderTexture) {
			this.camera.targetTexture = undefined as unknown as RenderTexture;
			this.renderTexture.Release();
			Destroy(this.renderTexture);
		}
		this.renderTexture = new RenderTexture(Screen.width, Screen.height, 24, RenderTextureFormat.ARGB32);
		this.camera.targetTexture = this.renderTexture;
	}

	public Init(gearNotificationId: string): void {
		this.activeCanvas.continueBtn.onClick.Connect(() => {
			task.spawnDetached(async () => {
				await client.userNotifications.deleteNotifications({
					notificationIds: [gearNotificationId],
				});
			});
			this.gameObject.SetActive(false);
		});
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
		this.activeCanvas.gameObject.SetActive(true);
		this.activeCanvas.Init(gear, title, message, this.renderTexture);

		this.targetGearParent.gameObject.ClearChildren();

		const activeAccessory = this.dummyAccessoryBuilder.Add(gear.accessoryPrefabs[0]);
		this.dummyAccessoryBuilder.UpdateCombinedMesh();
		this.accessory = activeAccessory!.AccessoryComponent;

		// Starting rotation
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
		cameraTransform.position = this.targetGearCenter.add(new Vector3(0, 1, -4 - zOffset));
		cameraTransform.LookAt(this.targetGearCenter);

		// Static Renderers
		// this.targetGearParent.RotateAround(this.targetGearCenter, Vector3.up, -35 * dt);

		// Skinned Mesh Renderers
		this.dummy.RotateAround(this.targetGearCenter, Vector3.up, -35 * dt);
	}

	override OnDestroy(): void {}
}
