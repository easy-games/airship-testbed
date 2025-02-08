import { Airship } from "../Airship";
import { Bin } from "../Util/Bin";
import { Layer } from "../Util/Layer";
import Character from "./Character";

export default class CharacterRendering extends AirshipBehaviour {
	@Header("References")
	public stencilMaterial?: Material;

	@Header("Variables")
	@SerializeField()
	private renderBehindWalls = false;
	@SerializeField()
	private renderBehindWallsForLocalPlayer = true;
	@SerializeField()
	private renderTransparentWhenCloseForLocalPlayer = true;
	public useDithering = true;
	public transparentDistance = 0.5;
	public transparentMargin = 0.5;

	private bin = new Bin();
	private cameraBin = new Bin();
	private character: Character;
	private renderers: Renderer[] = [];
	private propertyBlock: MaterialPropertyBlock;

	protected Awake(): void {
		this.character = this.gameObject.GetAirshipComponent<Character>()!;
		if (this.character?.accessoryBuilder) {
			this.character.accessoryBuilder.SetCreateOverlayMeshOnCombine(true);
		}
	}

	protected OnEnable(): void {
		this.Refresh();
	}

	protected OnDisable(): void {
		this.bin.Clean();
		this.cameraBin.Clean();
	}

	public SetRenderMode(
		renderBehindWalls: boolean,
		renderBehindWallsForLocalPlayer: boolean,
		renderTransparentWhenCloseForLocalPlayer: boolean,
	) {
		this.renderBehindWalls = renderBehindWalls;
		this.renderBehindWallsForLocalPlayer = renderBehindWallsForLocalPlayer;
		this.renderTransparentWhenCloseForLocalPlayer = renderTransparentWhenCloseForLocalPlayer;
		this.Refresh();
	}

	private Refresh() {
		if (!this.character) {
			this.character = this.gameObject.GetAirshipComponent<Character>()!;
			if (!this.character) {
				//error("CharacterRendering component must be on the same game object as the Character component");
				return;
			}
		}

		//Wait for init so we can check things on character
		this.character.WaitForInit();
		if (this.character.IsDestroyed()) {
			//Character was destroyed before full init
			return;
		}

		this.bin.Clean();
		this.cameraBin.Clean();

		this.propertyBlock = new MaterialPropertyBlock();

		//Mesh Combine Event
		this.bin.Add(
			this.character.accessoryBuilder.OnMeshCombined.Connect((usedCombine, skinnedMesh, staticMesh) => {
				if (
					this.stencilMaterial &&
					(this.renderBehindWalls ||
						(this.renderBehindWallsForLocalPlayer && this.character.IsLocalCharacter()))
				) {
					//Setup materials to render behind walls
					this.renderers = this.character.accessoryBuilder.GetAllAccessoryMeshes();
					for (let i = 0; i < this.renderers.size(); i++) {
						const ren = this.renderers[i];
						ren.gameObject.layer = Layer.CHARACTER;
						ren.SetMaterial(ren.materials.size(), this.stencilMaterial);
						ren.gameObject.layer = Layer.STENCIL_MASK;
					}
				}
			}),
		);

		if (this.character.IsLocalCharacter() && this.renderTransparentWhenCloseForLocalPlayer) {
			//Camera
			this.bin.Add(
				Airship.Camera.onCameraModeChanged.Connect((mode) => {
					this.cameraBin.Clean();
					this.cameraBin.Add(
						mode.onTargetDistance.Connect((distance, flatDistance) => {
							this.EvaluateCameraDistance(flatDistance);
						}),
					);
				}),
			);
			if (Airship.Camera.activeCameraMode) {
				this.cameraBin.Add(
					Airship.Camera.activeCameraMode?.onTargetDistance.Connect((distance, flatDistance) => {
						this.EvaluateCameraDistance(flatDistance);
					}),
				);
			}
		}
	}

	protected EvaluateCameraDistance(distance: number) {
		if (this.useDithering && this.stencilMaterial) {
			let alpha = math.max(0, distance - this.transparentDistance) / this.transparentMargin;
			this.propertyBlock.SetFloat("_Transparency", alpha);
			for (let i = 0; i < this.renderers.size(); i++) {
				this.renderers[i].SetPropertyBlock(this.propertyBlock);
			}
		} else {
			this.character.rig?.gameObject?.SetActive(distance > this.transparentDistance);
		}
	}
}
