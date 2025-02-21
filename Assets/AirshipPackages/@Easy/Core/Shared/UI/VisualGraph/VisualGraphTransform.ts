import { Bin } from "../../Util/Bin";
import VisualGraphManager from "./VisualGraphManager";
import VisualGraphView from "./VisualGraphView";

export default class VisualGraphTransform extends AirshipBehaviour {
	public graphName = "";
	public useMovementTransform = false;
	private graph?: VisualGraphView = undefined;
	private bin = new Bin();

	protected OnEnable(): void {
		if (!this.graph) {
			this.graph = VisualGraphManager.ManagerAddGraph(this.graphName ?? this.gameObject.name + "_T");
		}
		if (this.useMovementTransform) {
			let movement = this.gameObject.GetComponent<BasicCharacterMovement>();
			if (movement) {
				this.bin.AddEngineEventConnection(
					movement.OnEndMove(() => {
						this.Tick(Time.fixedDeltaTime);
					}),
				);
			}
		}
	}

	protected OnDisable(): void {
		if (this.graph) {
			VisualGraphManager.ManagerRemoveGraph(this.graph);
			this.graph = undefined;
		}
	}

	protected LateUpdate(dt: number): void {
		if (this.useMovementTransform) {
			return;
		}
		this.Tick(dt);
	}

	private Tick(dt: number) {
		this.graph?.AddValues(this.transform.position);
	}
}
