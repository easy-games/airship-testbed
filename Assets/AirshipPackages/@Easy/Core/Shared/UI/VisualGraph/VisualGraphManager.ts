import VisualGraphView from "./VisualGraphComponent";

export default class VisualGraphManager extends AirshipBehaviour {
	@Header("Templates")
	public graphTemplate: GameObject;

	@Header("References")
	public graphHolder: Transform;

	private currentGraphics: VisualGraphView[] = [];

	public static ManagerAddGraph(title: string, color: Color){
		return VisualGraphSingelton.GetInstance()?.AddGraph(title, color);
	}
	public static ManagerRemoveGraph(graph: VisualGraphView){
		return VisualGraphSingelton.GetInstance()?.RemoveGraph(graph);
	}
	
	public AddGraph(title: string, color: Color){
		let newGraph = Instantiate(this.graphTemplate, this.graphHolder).GetAirshipComponent<VisualGraphView>();
		if(!newGraph){
			error("Graph template must have a VisualGraphView Airship component on it");
		}
		newGraph.SetTitle(title);
		newGraph.SetLineColor(color);
		this.currentGraphics.push(newGraph);
		return newGraph;
	}

	public RemoveGraph(graph: VisualGraphView){
		for(let i=0; i<this.currentGraphics.size(); i++){
			if(this.currentGraphics[i] === graph){
				this.currentGraphics.remove(i);
				return true;
			}
		}
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
			warn("Something is trying to use the VisualGraph but the canvas manager is not in the scene");
			return undefined;
		}
		let currentManager = currentManagerHolder.GetAirshipComponent<VisualGraphManager>();
		if(!currentManager){
			error("Visual Graph is missing manager component");
		}
		VisualGraphSingelton.instance = currentManager;
	}
}
