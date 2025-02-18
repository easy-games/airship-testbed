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
	public staticRenderers: Renderer[] = [];
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
	private accRenderers: Renderer[] = [];
	private propertyBlock: MaterialPropertyBlock;
	private lastSetAlpha = -1;

	protected Awake(): void {
		// this.character = this.gameObject.GetAirshipComponent<Character>()!;
		// if (this.character) {
		// 	this.Init();
		// }
	}

	protected OnEnable(): void {
		// this.Refresh();
	}

	protected OnDisable(): void {
		this.bin.Clean();
		this.cameraBin.Clean();
	}

	private Init() {
		if (this.character.accessoryBuilder) {
			this.character.accessoryBuilder.SetCreateOverlayMeshOnCombine(true);
		}

		this.character.WaitForInit();

		this.propertyBlock = new MaterialPropertyBlock();
		this.propertyBlock.SetFloat("_Transparency", 1);

		//Setup manually specified renderers
		const useWallRenders = this.IsUsingWallMat();
		const useAlpha = this.IsUsingAlpha();
		if (useWallRenders || useAlpha) {
			for (let i = 0; i < this.staticRenderers.size(); i++) {
				this.SetupRenderer(this.staticRenderers[i], useWallRenders, useAlpha);
			}
		}
	}

	public SetRenderMode(
		renderBehindWalls: boolean,
		renderBehindWallsForLocalPlayer: boolean,
		renderTransparentWhenCloseForLocalPlayer: boolean,
	) {
		this.renderBehindWalls = renderBehindWalls;
		this.renderBehindWallsForLocalPlayer = renderBehindWallsForLocalPlayer;
		this.renderTransparentWhenCloseForLocalPlayer = renderTransparentWhenCloseForLocalPlayer;
		// this.Refresh();
	}

	private Refresh() {
		if (!this.character) {
			this.character = this.gameObject.GetAirshipComponent<Character>()!;
			if (!this.character) {
				//error("CharacterRendering component must be on the same game object as the Character component");
				return;
			} else {
				//Setup character and wait for character init
				this.Init();
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
				const useWallRenders = this.IsUsingWallMat();
				const useAlpha = this.IsUsingAlpha();
				for (let i = 0; i < accessories.size(); i++) {
					for (let j = 0; j < accessories[i].renderers.size(); j++) {
						// print(
						// 	"ACC ADDED j: " + j + ": " + accessories[i].renderers[j].transform.parent.gameObject.name,
						// );
						if (this.SetupRenderer(accessories[i].renderers[j], useWallRenders, useAlpha)) {
							this.accRenderers.push(accessories[i].renderers[j]);
						}
					}
				}
				this.lastSetAlpha = -1;
			}),
		);

		//Mesh Combine Event so we can set materials
		this.bin.Add(
			this.character.accessoryBuilder.OnMeshCombined.Connect((usedCombine, skinnedMesh, staticMesh) => {
				const useWallRenders = this.IsUsingWallMat();
				const useAlpha = this.IsUsingAlpha();

				if (useWallRenders || useAlpha) {
					//Setup materials to render behind walls
					this.lastSetAlpha = -1;
					this.accRenderers.clear();
					const newRenderers = this.character.accessoryBuilder.GetAllAccessoryRenderers();
					this.propertyBlock.SetFloat("_Transparency", 1);

					for (let i = 0; i < newRenderers.size(); i++) {
						//TODO: Right now Mesh Renderers are not combined in the MeshCombine so
						//if they have multiple submeshes this rendering technique will NOT work.
						//Ignoring them for now
						if (newRenderers[i] instanceof MeshRenderer) {
							continue;
						}
						if (this.SetupRenderer(newRenderers[i], useWallRenders, useAlpha)) {
							this.accRenderers.push(newRenderers[i]);
						}
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

	public IsUsingWallMat() {
		return (
			this.behindWallsMat !== undefined &&
			(this.renderBehindWalls || (this.renderBehindWallsForLocalPlayer && this.character.IsLocalCharacter()))
		);
	}

	public IsUsingAlpha() {
		return (
			this.transparencyMat !== undefined &&
			this.character.IsLocalCharacter() &&
			this.renderTransparentWhenCloseForLocalPlayer
		);
	}

	public AddStaticRenderer(ren: Renderer) {
		if (this.SetupRenderer(ren, this.IsUsingWallMat(), this.IsUsingAlpha())) {
			this.staticRenderers.push(ren);
			return true;
		} else {
			warn("Unabled to manually add static renderer: " + ren.gameObject.name);
			return false;
		}
	}

	private SetupRenderer(ren: Renderer, useWallRenders: boolean, useAlpha: boolean) {
		if (ren === undefined || ren.gameObject.layer === Layer.TRANSPARENT_FX) {
			return false;
		}
		const shaderName = ren.materials[ren.materials.size() - 1].GetTag("LightMode", false, "");
		if (
			shaderName === "CharacterDepth" ||
			shaderName === "CharacterAlpha" ||
			shaderName === "CharacterBehindOpaque"
		) {
			//We already setup this renderer, don't do it again or we will add duplicated render passes
			return false;
		}

		//Store depth in stencil
		ren.SetMaterial(ren.materials.size(), this.stencilMat);

		//Transparency
		if (useAlpha && this.transparencyMat) {
			ren.SetMaterial(ren.materials.size(), this.transparencyMat);
			ren.SetPropertyBlock(this.propertyBlock);
		}

		//Render behind walls
		if (useWallRenders && this.behindWallsMat) {
			ren.SetMaterial(ren.materials.size(), this.behindWallsMat);
		}

		ren.gameObject.layer = this.character.IsLocalCharacter() ? Layer.LOCAL_STENCIL_MASK : Layer.STENCIL_MASK;
		return true;
	}

	protected EvaluateCameraDistance(distance: number, camPos: Vector3, targetPos: Vector3) {
		let flatDistance = Vector3.Distance(camPos.WithY(targetPos.y), targetPos);
		let verticalMod = math.clamp01(camPos.y - targetPos.y);

		if (this.transparencyMat && this.renderTransparentWhenCloseForLocalPlayer) {
			let alpha = math.lerp(
				math.max(0, flatDistance - this.transparentDistance) / this.transparentMargin,
				1,
				verticalMod,
			);
			if (this.lastSetAlpha !== alpha) {
				this.lastSetAlpha = alpha;
				this.propertyBlock.SetFloat("_Transparency", alpha);
				//Dynamically added renderers
				for (let i = this.accRenderers.size() - 1; i >= 0; i--) {
					if (this.accRenderers[i]) {
						this.accRenderers[i].SetPropertyBlock(this.propertyBlock);
					} else {
						this.accRenderers.remove(i);
					}
				}

				//Non changing renderers
				for (let i = 0; i < this.staticRenderers.size(); i++) {
					this.staticRenderers[i].SetPropertyBlock(this.propertyBlock);
				}
			}
		} else {
			this.character.rig?.gameObject?.SetActive(distance > this.transparentDistance);
		}
	}
}
