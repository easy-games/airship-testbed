export default class VisualGraphView extends AirshipBehaviour {
	public graph: VisualGraphComponent;
	public titleTxt: TextMeshProUGUI;
	public minRangeTxt: TextMeshProUGUI;
	public maxRangeTxt: TextMeshProUGUI;


	public SetLineColor(newColorA: Color){
		this.graph.SetLineColor(newColorA);
	}
	public SetLineColors(newColorA: Color, newColorB: Color, newColorC: Color){
		this.graph.SetLineColors(newColorA, newColorB, newColorC);
	}

	public SetTitle(newTitle: string){
		if(!this.titleTxt){
			return;
		}
		this.titleTxt.text = newTitle;
	}

	public AddValue(newValue: number){
		this.graph.AddValue(newValue);
		this.RefreshRange();
	}

	public AddValues(newValues: Vector3){
		this.graph.AddValues(newValues);
		this.RefreshRange();
	}

	private RefreshRange(){
		this.minRangeTxt.text = math.round(this.graph.minValue) + " - ";
		this.maxRangeTxt.text = math.round(this.graph.maxValue) + " - ";
	}
}
