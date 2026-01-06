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
        
        // Place the grid elements around the new height
        for(let grid of this.grids) {
            grid.localGridElementSize = grid.localGridElementSize.WithY(data.height / 5.0);
            grid.Rebuild();
        }

        // Color elements
        this.plantColor.SetColorOnAll(data.weed ? Color.gray : data.color);
        for(let color of this.colors) {
            color.SetColorOnAll(data.color);
        }

        this.heightHolder.localScale = new Vector3(1,data.height,1);

        this.berryHolder.SetActive(data.fruited && !data.weed);
        this.weedHolder.SetActive(data.weed);
        this.leavesHolder.SetActive(!data.weed);
    }

    public UpdateData(newData: PlantData) {
        if(newData.height !== this.data.height) {
            // Play height change vfx
            Instantiate(this.heightChangeVFX, this.transform.position, this.transform.rotation);
        }
        this.data = newData;
    }
}
