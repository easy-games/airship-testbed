import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { NetworkSignal } from "@Easy/Core/Shared/Network/NetworkSignal";
import VisualGraphManager from "@Easy/Core/Shared/UI/VisualGraph/VisualGraphManager";
import VisualGraphView from "@Easy/Core/Shared/UI/VisualGraph/VisualGraphView";
import { Keyboard } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";

export default class PredictedMovementDebugging extends AirshipBehaviour {
	@Header("References")
	public movement: CharacterMovement;

	@Header("Variables")
	// public showVel = false;
	// public showModel = false;
	// public showRoot = false;
	// public showCamera = false;
	
	// private rigidVelGraph?: VisualGraphView = undefined;
	// private modelPositionGraph?: VisualGraphView = undefined;
	// private rootPositionGraph?: VisualGraphView = undefined;
	// private cameraPositionGraph?: VisualGraphView = undefined;

	// private rigid: Rigidbody;

	// private lastMag = 0;
	private bin = new Bin();

	private DebugSignal = new NetworkSignal<[i: number]>("PredictedDebugSignal");

	 protected OnEnable(): void {
		if(Game.IsClient()){
			this.bin.Add(Keyboard.OnKeyDown(Key.R, (e)=>{
				this.DebugSignal.client.FireServer(0);
			}));
			this.bin.Add(Keyboard.OnKeyDown(Key.F, (e)=>{
				this.DebugSignal.client.FireServer(1);
			}));
		}

		if(Game.IsServer()){
			this.bin.Add(this.DebugSignal.server.OnClientEvent((player, i)=>{
				switch(i){
					case 0:
						player.character?.Teleport(Vector3.zero, Vector3.forward);
						player.character?.movement.SetDebugFlying(false)
						break;
					case 1:
						player.character?.movement.SetDebugFlying(true);
						break;
				}
			}))
		}
	// 	this.rigid = this.gameObject.GetComponent<Rigidbody>()!;
	// 	if(!this.rigidVelGraph){
	// 		this.rigidVelGraph = VisualGraphManager.ManagerAddGraph("Rigid Vel");
	// 	}
	// 	if(!this.modelPositionGraph){
	// 		this.modelPositionGraph = VisualGraphManager.ManagerAddGraph("Model Pos");
	// 	}
	// 	if(!this.rootPositionGraph){
	// 		this.rootPositionGraph = VisualGraphManager.ManagerAddGraph("Root Pos");
	// 	}
	// 	if(!this.cameraPositionGraph){
	// 		this.cameraPositionGraph = VisualGraphManager.ManagerAddGraph("Camera Pos");
	// 	}
	}

	protected OnDisable(): void {
		this.bin.Clean();
	// 	if(this.rigidVelGraph){
	// 		VisualGraphManager.ManagerRemoveGraph(this.rigidVelGraph);
	// 		this.rigidVelGraph = undefined;
	// 	}
	// 	if(this.modelPositionGraph){
	// 		VisualGraphManager.ManagerRemoveGraph(this.modelPositionGraph);
	// 		this.modelPositionGraph = undefined;
	// 	}
	// 	if(this.rootPositionGraph){
	// 		VisualGraphManager.ManagerRemoveGraph(this.rootPositionGraph);
	// 		this.rootPositionGraph = undefined;
	// 	}
	// 	if(this.cameraPositionGraph){
	// 		VisualGraphManager.ManagerRemoveGraph(this.cameraPositionGraph);
	// 		this.cameraPositionGraph = undefined;
	// 	}
	}

	protected FixedUpdate(dt: number): void {
		// if(this.showPosition){
		// 	this.graph?.AddValues(this.rigid.position);
		// }else{
		// 	let mag = this.rigid.velocity.magnitude;
			
		// 	this.graph?.AddValues(new Vector3(
		// 		this.showMagnitude?mag:0, 
		// 		this.showAcceleration?this.lastMag - mag:0, 
		// 		this.showAngularMagnitude?this.rigid.angularVelocity.magnitude:0));
	
		// 	this.lastMag = mag;
		// }
	}
}
