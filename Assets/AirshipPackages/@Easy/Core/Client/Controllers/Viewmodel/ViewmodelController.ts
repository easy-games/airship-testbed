import { CoreRefs } from "@Easy/Core/Shared/CoreRefs";
import { Controller, OnStart } from "@Easy/Core/Shared/Flamework";

@Controller({})
export class ViewmodelController implements OnStart {
	public readonly viewmodelGo: GameObject;
	public readonly viewmodelTransform: Transform;
	public readonly animancer: AnimancerComponent;
	public readonly accessoryBuilder: AccessoryBuilder;
	public readonly rig!: CharacterRig;

	// private rootLayer: AnimancerLayer;
	// private layer1: AnimancerLayer;
	// private layer2: AnimancerLayer;
	// private layer3: AnimancerLayer;
	// private layer4: AnimancerLayer;

	constructor() {
		this.viewmodelGo = Object.Instantiate(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Character/CharacterViewmodel.prefab"),
			CoreRefs.rootTransform,
		);
		this.viewmodelTransform = this.viewmodelGo.transform;
		this.viewmodelTransform.position = new Vector3(10_000, 0, 10_000);

		const refs = this.viewmodelGo.GetComponent<GameObjectReferences>()!;
		const rig = refs.GetValue("Refs", "Rig");
		this.animancer = rig.GetComponent<AnimancerComponent>()!;

		const mask = AssetBridge.Instance.LoadAsset<AvatarMask>(
			"@Easy/Core/Shared/Resources/Character/Animations/AvatarMask_Viewmodel.mask",
		);
		for (let i = 0; i <= 4; i++) {
			this.animancer.Layers.SetMask(i, mask);
		}

		this.rig = rig.GetComponent<CharacterRig>()!;

		const content = this.viewmodelTransform.GetChild(0).gameObject;
		this.accessoryBuilder = content.GetComponent<AccessoryBuilder>()!;

		// this.rootLayer = this.animancer.Layers.GetLayer(0);
		// this.rootLayer.SetDebugName("Root");

		// this.layer1 = this.animancer.Layers.GetLayer(1);
		// this.layer2 = this.animancer.Layers.GetLayer(2);
		// this.layer3 = this.animancer.Layers.GetLayer(3);
		// this.layer4 = this.animancer.Layers.GetLayer(4);
	}

	OnStart(): void {}
}
