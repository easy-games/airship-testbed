import { Asset } from "../../Asset";
import VisualGraphView from "./VisualGraphView";

export default class VisualGraphManager extends AirshipBehaviour {
	@Header("Templates")
	public graphTemplate: GameObject;

	@Header("References")
	public graphHolder: Transform;

	private currentGraphics: VisualGraphView[] = [];

	public static ManagerAddGraph(title: string){
		return VisualGraphSingelton.GetInstance()?.AddGraph(title);
	}
	public static ManagerRemoveGraph(graph: VisualGraphView){
		return VisualGraphSingelton.GetInstance()?.RemoveGraph(graph);
	}
	
	public AddGraph(title: string){
		let newGraph = Instantiate(this.graphTemplate, this.graphHolder).GetAirshipComponent<VisualGraphView>();
		if(!newGraph){
			error("Graph template must have a VisualGraphView Airship component on it");
		}
		newGraph.SetTitle(title);
		this.currentGraphics.push(newGraph);
		return newGraph;
	}

	public RemoveGraph(graph: VisualGraphView){
		for(let i=0; i<this.currentGraphics.size(); i++){
			if(this.currentGraphics[i] === graph){
				Destroy(this.currentGraphics[i].gameObject);
				this.currentGraphics.remove(i);
				return true;
			}
		}
		warn("Unable to remove graph: " + graph.titleTxt.text);
		return false;
	}
}

export class VisualGraphSingelton {
	private static instance: VisualGraphManager | undefined;
	public static GetInstance(){
		if(VisualGraphSingelton.instance){
			return VisualGraphSingelton.instance;
		}
		let currentManagerHolder = GameObject.Find("VisualGraphCanvas");
		if(!currentManagerHolder){
			let template = Asset.LoadAssetIfExists("Assets/AirshipPackages/@Easy/Core/Prefabs/UI/VisualGraph/VisualGraphCanvas.prefab");
			if(template){
				currentManagerHolder = Instantiate(template);
				currentManagerHolder.name = "VisualGraphCanvas";
			}
			if(!template || ! currentManagerHolder){
				warn("Something is trying to use the VisualGraph but the canvas manager is not in the scene");
				return undefined;
			}
		}
		let currentManager = currentManagerHolder.GetAirshipComponent<VisualGraphManager>();
		if(!currentManager){
			error("Visual Graph is missing manager component");
		}
		VisualGraphSingelton.instance = currentManager;
		return currentManager;
	}
}
