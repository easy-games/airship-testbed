import { Controller, OnStart } from "@easy-games/flamework-core";

@Controller({})
export class ViewmodelController implements OnStart {
	public readonly ViewmodelGo: GameObject;
	public readonly ViewmodelTransform: Transform;
	public readonly Animancer: AnimancerComponent;
	public readonly AccessoryBuilder: AccessoryBuilder;
	public readonly BoneTransforms: {
		spineMiddle: Transform;
	};

	// private rootLayer: AnimancerLayer;
	// private layer1: AnimancerLayer;
	// private layer2: AnimancerLayer;
	// private layer3: AnimancerLayer;
	// private layer4: AnimancerLayer;

	constructor() {
		this.ViewmodelGo = Object.Instantiate(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Entity/HumanEntity/HumanViewmodel.prefab"),
		) as GameObject;
		this.ViewmodelTransform = this.ViewmodelGo.transform;

		const content = this.ViewmodelTransform.GetChild(0).gameObject;
		this.Animancer = content.GetComponent<AnimancerComponent>();
		this.AccessoryBuilder = content.GetComponent<AccessoryBuilder>();

		const refs = content.GetComponent<GameObjectReferences>();
		this.BoneTransforms = {
			spineMiddle: refs.GetValue("Bones", "SpineMiddle"),
		};

		// this.rootLayer = this.animancer.Layers.GetLayer(0);
		// this.rootLayer.SetDebugName("Root");

		// this.layer1 = this.animancer.Layers.GetLayer(1);
		// this.layer2 = this.animancer.Layers.GetLayer(2);
		// this.layer3 = this.animancer.Layers.GetLayer(3);
		// this.layer4 = this.animancer.Layers.GetLayer(4);
	}

	OnStart(): void {}
}
