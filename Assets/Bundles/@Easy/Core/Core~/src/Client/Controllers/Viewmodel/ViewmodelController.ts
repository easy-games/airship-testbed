import { Controller, OnStart } from "@easy-games/flamework-core";

@Controller({})
export class ViewmodelController implements OnStart {
	private viewmodelGo: GameObject;
	private animancer: AnimancerComponent;
	public readonly accessoryBuilder: AccessoryBuilder;

	private rootLayer: AnimancerLayer;
	private layer1: AnimancerLayer;
	private layer2: AnimancerLayer;
	private layer3: AnimancerLayer;
	private layer4: AnimancerLayer;

	constructor() {
		this.viewmodelGo = Object.Instantiate(
			AssetBridge.Instance.LoadAsset(
				"Assets/Bundles/@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanViewmodel.prefab",
			),
		) as GameObject;
		this.animancer = this.viewmodelGo.GetComponent<AnimancerComponent>();
		this.accessoryBuilder = this.viewmodelGo.GetComponent<AccessoryBuilder>();

		this.rootLayer = this.animancer.Layers.GetLayer(0);
		this.rootLayer.SetDebugName("Root");

		this.layer1 = this.animancer.Layers.GetLayer(1);
		this.layer2 = this.animancer.Layers.GetLayer(2);
		this.layer3 = this.animancer.Layers.GetLayer(3);
		this.layer4 = this.animancer.Layers.GetLayer(4);
	}

	OnStart(): void {}
}
