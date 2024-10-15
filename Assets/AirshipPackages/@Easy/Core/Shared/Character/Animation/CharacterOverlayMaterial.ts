import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class CharacterOverlayMaterial extends AirshipBehaviour {
	@Header("Templates")
	public defaultOverlayMaterialTemplate: Material;

	@Header("References")
	public accessoryBuilder: AccessoryBuilder;

	private bin = new Bin();
	private currentRenderers: Renderer[] = [];

	override Start(): void {
		//print("Overlay start");
		this.accessoryBuilder.SetCreateOverlayMeshOnCombine(true);
		this.bin.Add(
			this.accessoryBuilder.OnMeshCombined.Connect((usedMeshCombiner, skinnedMesh, staticMesh) => {
				//print("ON MESH COMBINE OVERLAY");
				this.currentRenderers.clear();
				if (usedMeshCombiner) {
					this.currentRenderers = [skinnedMesh, staticMesh];
				} else {
					//Individual accessories
					let allMeshes = this.accessoryBuilder.GetAllAccessoryMeshes();
					for (let i = 0; i < allMeshes.Length; i++) {
						this.currentRenderers.push(allMeshes.GetValue(i));
					}
				}
				this.SetOverlayMaterial(this.defaultOverlayMaterialTemplate);
			}),
		);
	}

	public SetOverlayMaterial(newMaterial: Material) {
		//print("Setting overlay to mat: " + (newMaterial?.name ?? ""));
		for (let ren of this.currentRenderers) {
			ren.SetMaterial(ren.materials.Length, newMaterial);
		}
	}

	public GetAllRenderers() {
		return this.currentRenderers;
	}
}
