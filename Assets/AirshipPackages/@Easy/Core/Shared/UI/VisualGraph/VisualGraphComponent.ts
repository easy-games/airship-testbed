export default class VisualGraphView extends AirshipBehaviour {
	public graph: VisualGraphComponent;
	public titleTxt: TextMeshProUGUI;
	public minRangeTxt: TextMeshProUGUI;
	public maxRangeTxt: TextMeshProUGUI;


	public SetLineColor(newColor: Color){
		this.graph.SetLineColor(newColor);
	}

	public SetTitle(newTitle: string){
		if(!this.titleTxt){
			return;
		}
		this.titleTxt.text = newTitle;
	}

	public AddValue(newValue: number){
		this.graph.AddValue(newValue);
		this.minRangeTxt.text = this.graph.minValue + " - ";
		this.maxRangeTxt.text = this.graph.maxValue + " - ";
	}
}
