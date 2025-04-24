import { Airship } from "../Airship";
import { Bin } from "../Util/Bin";
import { Layer } from "../Util/Layer";
import Character from "./Character";

export default class CharacterRendering extends AirshipBehaviour {
	@Header("Variables")
	@Tooltip(
		'When on you must set all of your renders to the layer "LocalStencilMask" for them to render with transparency',
	)
	public useTransparentOnCameraClose = true;
	@Tooltip("Will set everything under the rig to be on the StencilMask or LocalStencilMask layer")
	public autoSetStencilLayer = true;
	@Tooltip("How close you can be before the character is fully transparent")
	public transparentDistance = 0.3;
	@Tooltip("When using transparency how much distance between fully opaque and fully transparent")
	public transparentMargin = 0.5;

	private enableIfNotLocalCharacter = false;

	private bin = new Bin();
	private cameraBin = new Bin();
	private character: Character;
	private lastSetAlpha = -1;

	protected OnEnable(): void {
		this.Refresh();
	}

	protected OnDisable(): void {
		this.bin.Clean();
		this.cameraBin.Clean();

		if ((this.character.IsInitialized() && this.character.IsLocalCharacter()) || this.enableIfNotLocalCharacter) {
			this.SetAlpha(1);
		}
	}

	private Init() {
		if (this.character) {
			//Wait for init so we can check things on character
			this.character.WaitForInit();

			if (this.character.IsLocalCharacter() || this.enableIfNotLocalCharacter) {
				if (this.useTransparentOnCameraClose && this.autoSetStencilLayer) {
					this.SetLayerRecursive(this.character.rig.transform, Layer.LOCAL_STENCIL_MASK);
				}
				this.SetAlpha(1);
			} else {
				this.SetLayerRecursive(this.character.rig.transform, Layer.CHARACTER);
			}
		}
	}

	public SetEnabledIfNotLocalCharacter(enabled: boolean): void {
		this.enableIfNotLocalCharacter = enabled;
		this.Init();
		this.Refresh();
	}

	private SetLayerRecursive(transform: Transform, layer: number) {
		//Check if we can change this game objects layer
		if (transform.gameObject.layer !== Layer.TRANSPARENT_FX) {
			transform.gameObject.layer = layer;
		}
		for (let i = 0; i < transform.childCount; i++) {
			const t = transform.GetChild(i);
			this.SetLayerRecursive(t, layer);
		}
	}

	private Refresh() {
		if (!this.character) {
			this.character = this.gameObject.GetAirshipComponent<Character>()!;
			this.Init();
		}

		if (this.character?.IsDestroyed()) {
			//Character was destroyed before full init
			return;
		}

		this.bin.Clean();
		this.cameraBin.Clean();

		if ((this.character.IsInitialized() && this.character?.IsLocalCharacter()) || this.enableIfNotLocalCharacter) {
			const headTransform = this.character.rig.head;
			//Camera
			this.bin.Add(
				Airship.Camera.onCameraModeChanged.Connect((mode) => {
					this.cameraBin.Clean();
					this.cameraBin.Add(
						mode.onTargetDistance.Connect((distance, camPos, targetPos) => {
							this.EvaluateCameraDistance(distance, camPos, headTransform.position);
						}),
					);
				}),
			);
			if (Airship.Camera.activeCameraMode) {
				this.cameraBin.Add(
					Airship.Camera.activeCameraMode?.onTargetDistance.Connect((distance, camPos, targetPos) => {
						this.EvaluateCameraDistance(distance, camPos, headTransform.position);
					}),
				);
			}
		}
	}

	protected EvaluateCameraDistance(distance: number, camPos: Vector3, targetPos: Vector3) {
		let flatDistance = Vector3.Distance(camPos, targetPos);

		if (this.useTransparentOnCameraClose) {
			let alpha = math.max(0, flatDistance - this.transparentDistance) / this.transparentMargin;
			this.SetAlpha(alpha);
		} else {
			this.character.rig?.gameObject?.SetActive(distance > this.transparentDistance);
		}
	}

	public SetAlpha(alpha: number) {
		if (this.lastSetAlpha !== alpha) {
			this.lastSetAlpha = alpha;
			Shader.SetGlobalFloat("_LocalCharacterAlpha", math.clamp01(alpha));
		}
	}
}
