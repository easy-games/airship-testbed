import VisualGraphManager from "./VisualGraphManager";
import VisualGraphView from "./VisualGraphView";

export default class VisualGraphRigidbody extends AirshipBehaviour {
	public graphName = "";
	public showPosition = false;
	public showMagnitude = true;
	public showAcceleration = false;
	public showAngularMagnitude = false;
	private graph?: VisualGraphView = undefined;
	private rigid: Rigidbody;

	private lastMag = 0;

	protected OnEnable(): void {
		this.rigid = this.gameObject.GetComponent<Rigidbody>()!;
		if(!this.graph){
			this.graph = VisualGraphManager.ManagerAddGraph(this.graphName??this.gameObject.name + "_R");
		}
	}

	protected OnDisable(): void {
		if(this.graph){
			VisualGraphManager.ManagerRemoveGraph(this.graph);
			this.graph = undefined;
		}
	}

	protected FixedUpdate(dt: number): void {
		if(this.showPosition){
			this.graph?.AddValues(this.rigid.position);
		}else{
			let mag = this.rigid.velocity.magnitude;
			
			this.graph?.AddValues(new Vector3(
				this.showMagnitude?mag:0, 
				this.showAcceleration?this.lastMag - mag:0, 
				this.showAngularMagnitude?this.rigid.angularVelocity.magnitude:0));
	
			this.lastMag = mag;
		}
	}
}
