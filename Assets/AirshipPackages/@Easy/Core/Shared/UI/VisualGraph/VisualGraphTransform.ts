import VisualGraphManager from "./VisualGraphManager";
import VisualGraphView from "./VisualGraphView";

export default class VisualGraphTransform extends AirshipBehaviour {
	public graphName = "";
	private graph?: VisualGraphView = undefined;

	protected OnEnable(): void {
		if(!this.graph){
			this.graph = VisualGraphManager.ManagerAddGraph(this.graphName??this.gameObject.name + "_T");
		}
	}

	protected OnDisable(): void {
		if(this.graph){
			VisualGraphManager.ManagerRemoveGraph(this.graph);
			this.graph = undefined;
		}
	}

	protected LateUpdate(dt: number): void {
		this.graph?.AddValues(this.transform.position);
	}
}
