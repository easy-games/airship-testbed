import VisualGraphView from "./VisualGraphComponent";
import VisualGraphManager from "./VisualGraphManager";

export default class VisualGraphTransform extends AirshipBehaviour {
	public color = Color.red;

	private graph?: VisualGraphView = undefined;

	protected OnEnable(): void {
		if(!this.graph){
			this.graph = VisualGraphManager.ManagerAddGraph(this.gameObject.name + "_T", this.color);
		}
	}

	protected OnDisable(): void {
		if(this.graph){
			VisualGraphManager.ManagerRemoveGraph(this.graph);
			this.graph = undefined;
		}
	}

	protected LateUpdate(dt: number): void {
		this.graph?.AddValue(this.transform.position.y);
	}
}
