import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Game } from "../../Game";

export default class CharacterOverlayMaterial extends AirshipBehaviour {
	@Header("Templates")
	public defaultOverlayMaterialTemplate?: Material;

	@Header("References")
	public accessoryBuilder?: AccessoryBuilder;
	public extraMeshRenderers: MeshRenderer[] = [];
	public extraSkinnedMeshRenderers: SkinnedMeshRenderer[] = [];

	@Header("Variables")
	public overlayStaticRenderers = true;
	public skinnedMeshHaveOverlayMesh = true;

	private bin = new Bin();
	private currentSkinnedRenderers: SkinnedMeshRenderer[] = [];
	private currentStaticRenderers: MeshRenderer[] = [];
	private currentRenderers: Renderer[] = [];
	private currentMaterial?: Material;

	protected Awake(): void {
		if (this.defaultOverlayMaterialTemplate)
			this.defaultOverlayMaterialTemplate = new Material(this.defaultOverlayMaterialTemplate);
	}

	override Start(): void {
		//print("Overlay start");
		if (this.accessoryBuilder) {
			this.accessoryBuilder.SetCreateOverlayMeshOnCombine(true);
			this.bin.Add(
				this.accessoryBuilder.OnMeshCombined.Connect((usedMeshCombiner, skinnedMesh, staticMesh) => {
					if (!this.accessoryBuilder) {
						return;
					}
					//print("ON MESH COMBINE OVERLAY");
					this.currentSkinnedRenderers.clear();
					this.currentStaticRenderers.clear();
					this.currentRenderers.clear();

					if (this.overlayStaticRenderers) {
						this.currentStaticRenderers = this.accessoryBuilder.GetAllMeshRenderers();
						this.currentSkinnedRenderers = this.accessoryBuilder.GetAllSkinnedMeshRenderers();
						this.currentRenderers = [...this.currentSkinnedRenderers, ...this.currentStaticRenderers];
					} else if (usedMeshCombiner) {
						this.currentSkinnedRenderers = [skinnedMesh];
						this.currentStaticRenderers = [staticMesh];
						this.currentRenderers = [skinnedMesh, staticMesh];
					} else {
						// Note: below code was disabled because "instanceof" doesn't work on C# classes. So it was doing nothing.
						//Individual accessories
						// let allMeshes = this.accessoryBuilder.GetAllAccessoryRenderers();
						// for (const mesh of allMeshes) {
						// 	this.currentRenderers.push(mesh);
						// 	if (mesh instanceof SkinnedMeshRenderer) {
						// 	} else if (mesh instanceof MeshRenderer) {
						// 		this.currentStaticRenderers.push(mesh as MeshRenderer);
						// 	}
						// }
					}
					this.currentMaterial = undefined;
					this.AddAllExtraRenderers();
					this.SetOverlayMaterial(this.defaultOverlayMaterialTemplate);
				}),
			);
		}
		this.AddAllExtraRenderers();
	}

	private AddAllExtraRenderers() {
		this.AddExtraRenderers(this.currentSkinnedRenderers, this.extraSkinnedMeshRenderers);
		this.AddExtraRenderers(this.currentStaticRenderers, this.extraMeshRenderers);
	}

	private AddExtraRenderers(current: Renderer[], extras: Renderer[]) {
		for (let ren of extras) {
			if (ren) {
				// If in editor make sure we're not duplicating renderers
				if (Game.IsEditor()) {
					if (current.find((el) => el === ren)) {
						Debug.LogError("Unnecessarily including extra skinned renderer: " + ren.name, ren);
					}
				}

				current.push(ren);
				this.currentRenderers.push(ren);
			}
		}
	}

	public SetOverlayMaterial(newMaterial: Material | undefined) {
		if (newMaterial === this.currentMaterial) {
			//print("Ignoring set overlay");
			return;
		}
		this.currentMaterial = newMaterial;
		//print("Setting overlay to mat: " + (newMaterial?.name ?? ""));
		for (let ren of this.currentSkinnedRenderers) {
			if (!ren?.sharedMesh) {
				continue;
			}
			const index = ren.sharedMesh.subMeshCount - (this.skinnedMeshHaveOverlayMesh ? 1 : 0);
			if (newMaterial) {
				ren.SetSharedMaterial(index, newMaterial);
			} else {
				Bridge.RemoveMaterial(ren, index);
			}
		}
		for (let ren of this.currentStaticRenderers) {
			if (!ren) {
				continue;
			}
			const filter = ren.gameObject.GetComponent<MeshFilter>();
			if (filter?.mesh) {
				const index = filter.sharedMesh.subMeshCount;
				if (newMaterial) {
					ren.SetSharedMaterial(index, newMaterial);
				} else {
					Bridge.RemoveMaterial(ren, index);
				}
			}
		}
	}

	public ResetOverlayMaterial() {
		this.SetOverlayMaterial(this.defaultOverlayMaterialTemplate);
	}

	public ClearOverlayMaterial() {
		for (let ren of this.currentSkinnedRenderers) {
			if (!ren?.sharedMesh) {
				continue;
			}
			Bridge.RemoveMaterial(ren, ren.sharedMesh.subMeshCount - (this.skinnedMeshHaveOverlayMesh ? 1 : 0));
		}
		for (let ren of this.currentStaticRenderers) {
			if (!ren) {
				continue;
			}
			const filter = ren.gameObject.GetComponent<MeshFilter>();
			if (filter?.mesh) {
				Bridge.RemoveMaterial(ren, filter.sharedMesh.subMeshCount);
			}
		}
		this.currentMaterial = undefined;
	}

	public GetAllRenderers() {
		return this.currentRenderers;
	}

	public GetCurrentMaterial() {
		return this.currentMaterial;
	}
}
