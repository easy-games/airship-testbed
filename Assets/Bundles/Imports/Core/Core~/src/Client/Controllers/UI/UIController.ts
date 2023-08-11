import { Controller, OnStart } from "@easy-games/flamework-core";

@Controller({})
export class UIController implements OnStart {
	// public readonly RootVisualElement: VisualElement;

	constructor() {
		// this.RootVisualElement = GameObject.Find("UIRoot").GetComponent<UIDocument>().rootVisualElement;
		// this.RootVisualElement.style.width = UICore.MakeStyleLength(100, LengthUnit.Percent);
		// this.RootVisualElement.style.height = UICore.MakeStyleLength(100, LengthUnit.Percent);
	}

	OnStart(): void {}
}
