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
	private currentMaterial: Material | undefined;

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
					let allMeshes = this.accessoryBuilder.GetAllAccessoryMeshes();
					for (let i = 0; i < allMeshes.Length; i++) {
						const mesh = allMeshes.GetValue(i);
						this.currentRenderers.push(mesh);
						if (mesh instanceof SkinnedMeshRenderer) {
							this.currentSkinnedRenderers.push(mesh as SkinnedMeshRenderer);
						} else if (mesh instanceof MeshRenderer) {
							this.currentStaticRenderers.push(mesh as MeshRenderer);
						}
					}
				}
				this.SetOverlayMaterial(this.currentMaterial ?? this.defaultOverlayMaterialTemplate, true);
			}),
		);
	}

	public SetOverlayMaterial(newMaterial: Material | undefined, force = false) {
		if (!force && newMaterial === this.currentMaterial) {
			return;
		}
		this.currentMaterial = newMaterial;

		//print("Setting overlay to mat: " + (newMaterial?.name ?? ""));
		for (let ren of this.currentSkinnedRenderers) {
			ren.SetMaterial(ren.sharedMesh.subMeshCount - 1, newMaterial!);
		}
		for (let ren of this.currentStaticRenderers) {
			const filter = ren.gameObject.GetComponent<MeshFilter>();
			if (filter?.mesh) {
				ren.SetMaterial(filter.mesh.subMeshCount - 1, newMaterial!);
			}
		}
	}

	public GetAllRenderers() {
		return this.currentRenderers;
	}
}
