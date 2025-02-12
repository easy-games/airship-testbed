import { Airship } from "../Airship";
import { Bin } from "../Util/Bin";
import { Layer } from "../Util/Layer";
import Character from "./Character";

export default class CharacterRendering extends AirshipBehaviour {
	@Header("References")
	public stencilMat: Material;
	public transparencyMat?: Material;
	public behindWallsMat?: Material;

	@Header("Variables")
	@SerializeField()
	private renderBehindWalls = false;
	@SerializeField()
	private renderBehindWallsForLocalPlayer = false;
	@SerializeField()
	private renderTransparentWhenCloseForLocalPlayer = true;
	public transparentDistance = 0.5;
	public transparentMargin = 0.5;

	private bin = new Bin();
	private cameraBin = new Bin();
	private character: Character;
	private renderers: Renderer[] = [];
	private propertyBlock: MaterialPropertyBlock;
	private lastSetAlpha = -1;

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

		this.bin.Add(
			this.character.accessoryBuilder.OnAccessoryAdded.Connect((willCombine, accessories) => {
				if (willCombine) {
					return;
				}
				const wallRenders =
					this.behindWallsMat !== undefined &&
					(this.renderBehindWalls ||
						(this.renderBehindWallsForLocalPlayer && this.character.IsLocalCharacter()));
				for (let i = 0; i < accessories.size(); i++) {
					for (let j = 0; j < accessories[i].renderers.size(); j++) {
						// print(
						// 	"ACC ADDED j: " + j + ": " + accessories[i].renderers[j].transform.parent.gameObject.name,
						// );
						this.SetupRenderer(accessories[i].renderers[j], wallRenders);
						this.renderers.push(accessories[i].renderers[j]);
					}
				}
				this.lastSetAlpha = -1;
			}),
		);

		//Mesh Combine Event so we can set materials
		this.bin.Add(
			this.character.accessoryBuilder.OnMeshCombined.Connect((usedCombine, skinnedMesh, staticMesh) => {
				const wallRenders =
					this.behindWallsMat !== undefined &&
					(this.renderBehindWalls ||
						(this.renderBehindWallsForLocalPlayer && this.character.IsLocalCharacter()));
				const useAlpha =
					this.transparencyMat ||
					(this.character.IsLocalCharacter() && this.renderTransparentWhenCloseForLocalPlayer);

				if (wallRenders || useAlpha) {
					//Setup materials to render behind walls
					this.lastSetAlpha = -1;
					this.renderers = this.character.accessoryBuilder.GetAllAccessoryMeshes();
					this.propertyBlock.SetFloat("_Transparency", 1);

					for (let i = 0; i < this.renderers.size(); i++) {
						this.SetupRenderer(this.renderers[i], wallRenders);
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

	private SetupRenderer(ren: Renderer, wallRenders: boolean) {
		//Store depth in stencil
		ren.SetMaterial(ren.materials.size(), this.stencilMat);

		//Transparencyransparency
		if (this.transparencyMat) {
			ren.SetMaterial(ren.materials.size(), this.transparencyMat);
			ren.SetPropertyBlock(this.propertyBlock);
		}

		//Render behind walls
		if (wallRenders && this.behindWallsMat) {
			ren.SetMaterial(ren.materials.size(), this.behindWallsMat);
		}

		ren.gameObject.layer = this.character.IsLocalCharacter() ? Layer.LOCAL_STENCIL_MASK : Layer.STENCIL_MASK;
	}

	protected EvaluateCameraDistance(distance: number) {
		if (this.transparencyMat && this.renderTransparentWhenCloseForLocalPlayer) {
			let alpha = math.max(0, distance - this.transparentDistance) / this.transparentMargin;
			if (this.lastSetAlpha !== alpha) {
				this.lastSetAlpha = alpha;
				this.propertyBlock.SetFloat("_Transparency", alpha);
				for (let i = this.renderers.size() - 1; i >= 0; i--) {
					if (this.renderers[i]) {
						this.renderers[i].SetPropertyBlock(this.propertyBlock);
					} else {
						this.renderers.remove(i);
					}
				}
			}
		} else {
			this.character.rig?.gameObject?.SetActive(distance > this.transparentDistance);
		}
	}
}
