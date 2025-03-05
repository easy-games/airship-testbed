import { Airship } from "../Airship";
import { Bin } from "../Util/Bin";
import { Layer } from "../Util/Layer";
import Character from "./Character";

export default class CharacterRendering extends AirshipBehaviour {
    @Header("References")
    public sharedTransparencyMat: Material;

	@Header("Variables")
    @Tooltip("When on you must set all of your renders to the layer \"LocalStencilMask\" for them to render with transparency")
    public useTransparentOnCameraClose = true;
    @Tooltip("Will set everything under the rig to be on the StencilMask or LocalStencilMask layer")
    public autoSetStencilLayer = true;
    @Tooltip("How close you can be before the character is fully transparent")
	public transparentDistance = 0.3;
    @Tooltip("When using transparency how much distance between fully opaque and fully transparent")
	public transparentMargin = 0.5;

	private bin = new Bin();
	private cameraBin = new Bin();
	private character: Character;
	private lastSetAlpha = -1;

	protected Start(): void {
		this.Refresh();
	}

	protected OnDisable(): void {
		this.bin.Clean();
		this.cameraBin.Clean();
	}

    private Init() {
        if(this.character){
            //Wait for init so we can check things on character
            this.character.WaitForInit();

            if(this.character.IsLocalCharacter()) {
                if(this.useTransparentOnCameraClose && this.autoSetStencilLayer) {
                    this.character.rig.gameObject.SetLayerRecursive(Layer.LOCAL_STENCIL_MASK);
                }
                this.SetAlpha(1);
            } 
            // else{
            //     if(this.autoSetStencilLayer){
            //         this.character.rig.gameObject.SetLayerRecursive(Layer.STENCIL_MASK);
            //     }
            // }
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

		if (this.character?.IsLocalCharacter()) {
			//Camera
			this.bin.Add(
				Airship.Camera.onCameraModeChanged.Connect((mode) => {
					this.cameraBin.Clean();
					this.cameraBin.Add(
						mode.onTargetDistance.Connect((distance, camPos, targetPos) => {
							this.EvaluateCameraDistance(distance, camPos, targetPos);
						}),
					);
				}),
			);
			if (Airship.Camera.activeCameraMode) {
				this.cameraBin.Add(
					Airship.Camera.activeCameraMode?.onTargetDistance.Connect((distance, camPos, targetPos) => {
						this.EvaluateCameraDistance(distance, camPos, targetPos);
					}),
				);
			}
		}
	}

	protected EvaluateCameraDistance(distance: number, camPos: Vector3, targetPos: Vector3) {
		let flatDistance = Vector3.Distance(camPos.WithY(targetPos.y), targetPos);
		let verticalMod = math.clamp01(camPos.y - targetPos.y);

        if(this.useTransparentOnCameraClose){
			this.SetAlpha( math.lerp(
				math.max(0, flatDistance - this.transparentDistance) / this.transparentMargin,
				1,
				verticalMod,
			));
		} else {
			this.character.rig?.gameObject?.SetActive(distance > this.transparentDistance);
		}
    }

    public SetAlpha(alpha: number){
        if (this.lastSetAlpha !== alpha) {
            this.lastSetAlpha = alpha;
            if(this.sharedTransparencyMat){
                this.sharedTransparencyMat.SetFloat("_Transparency", alpha);
            }
        }
    }
}
