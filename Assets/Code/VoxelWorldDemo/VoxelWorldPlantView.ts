import { PlantData } from "./VoxelWorldPlantManager";

export default class VoxelWorldPlantView extends AirshipBehaviour {
	@Header("Templates")
	public heightChangeVFX: GameObject;

	public heightHolder: Transform;
	public berryHolder: GameObject;
	public weedHolder: GameObject;
	public leavesHolder: GameObject;
	public grids: EasyGridAlign[] = [];
	public colors: MaterialColorURP[] = [];
	public plantColor: MaterialColorURP;
	public data: PlantData;

	public Init(data: PlantData) {
		this.data = data;
		this.UpdateData(data);
	}

	public UpdateData(newData: Partial<PlantData>) {
		if (newData.height !== undefined) {
			// Play height change vfx
			Instantiate(this.heightChangeVFX, this.transform.position, this.transform.rotation);
		}
		this.data = { ...this.data, ...newData };

		// Place the grid elements around the new height
		for (let grid of this.grids) {
			grid.localGridElementSize = grid.localGridElementSize.WithY(this.data.height / 5.0);
			grid.Rebuild();
		}

		// Color elements
		this.plantColor.SetColorOnAll(this.data.weed ? Color.gray : this.data.color);
		for (let color of this.colors) {
			color.SetColorOnAll(this.data.color);
		}

		this.heightHolder.localScale = new Vector3(1, this.data.height, 1);

		this.berryHolder.SetActive(this.data.fruited && !this.data.weed);
		this.weedHolder.SetActive(this.data.weed);
		this.leavesHolder.SetActive(!this.data.weed);
	}
}
