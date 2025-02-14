import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class CharacterOverlayMaterial extends AirshipBehaviour {
	@Header("Templates")
	public defaultOverlayMaterialTemplate: Material;

	@Header("References")
	public accessoryBuilder: AccessoryBuilder;

	private bin = new Bin();
	private currentSkinnedRenderers: SkinnedMeshRenderer[] = [];
	private currentStaticRenderers: MeshRenderer[] = [];
	private currentRenderers: Renderer[] = [];
	private currentMaterial?: Material;

	override Start(): void {
		//print("Overlay start");
		this.accessoryBuilder.SetCreateOverlayMeshOnCombine(true);
		this.bin.Add(
			this.accessoryBuilder.OnMeshCombined.Connect((usedMeshCombiner, skinnedMesh, staticMesh) => {
				//print("ON MESH COMBINE OVERLAY");
				this.currentSkinnedRenderers.clear();
				this.currentStaticRenderers.clear();
				this.currentRenderers.clear();
				if (usedMeshCombiner) {
					this.currentSkinnedRenderers = [skinnedMesh];
					this.currentStaticRenderers = [staticMesh];
					this.currentRenderers = [skinnedMesh, staticMesh];
				} else {
					//Individual accessories
					let allMeshes = this.accessoryBuilder.GetAllAccessoryRenderers();
					for (const mesh of allMeshes) {
						this.currentRenderers.push(mesh);
						if (mesh instanceof SkinnedMeshRenderer) {
							this.currentSkinnedRenderers.push(mesh as SkinnedMeshRenderer);
						} else if (mesh instanceof MeshRenderer) {
							this.currentStaticRenderers.push(mesh as MeshRenderer);
						}
					}
				}
				this.currentMaterial = undefined;
				this.SetOverlayMaterial(this.defaultOverlayMaterialTemplate);
			}),
		);
	}

	public SetOverlayMaterial(newMaterial: Material) {
		if (newMaterial === this.currentMaterial) {
			return;
		}
		this.currentMaterial = newMaterial;
		//print("Setting overlay to mat: " + (newMaterial?.name ?? ""));
		for (let ren of this.currentSkinnedRenderers) {
			if (!ren?.sharedMesh) {
				continue;
			}
			ren.SetMaterial(ren.sharedMesh.subMeshCount - 1, newMaterial);
		}
		for (let ren of this.currentStaticRenderers) {
			if (!ren) {
				continue;
			}
			const filter = ren.gameObject.GetComponent<MeshFilter>();
			if (filter?.mesh) {
				ren.SetMaterial(filter.mesh.subMeshCount - 1, newMaterial);
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
			Bridge.ClearMaterial(ren, ren.sharedMesh.subMeshCount - 1);
		}
		for (let ren of this.currentStaticRenderers) {
			if (!ren) {
				continue;
			}
			const filter = ren.gameObject.GetComponent<MeshFilter>();
			if (filter?.mesh) {
				Bridge.ClearMaterial(ren, filter.sharedMesh.subMeshCount - 1);
			}
		}
	}

	public GetAllRenderers() {
		return this.currentRenderers;
	}
}
