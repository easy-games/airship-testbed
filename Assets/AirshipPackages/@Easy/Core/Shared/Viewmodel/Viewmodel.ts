import { Airship } from "../Airship";
import { CameraReferences } from "../Camera/CameraReferences";
import { CoreRefs } from "../CoreRefs";
import AirshipCharacterViewmodel from "./AirshipCharacterViewmodel";

export class Viewmodel {
	public viewmodelGo!: GameObject;
	public viewmodelTransform!: Transform;
	public anim!: Animator;
	public accessoryBuilder!: AccessoryBuilder;
	public rig!: CharacterRig;

	constructor() {
		this.InstantiateFromPrefab(Airship.Characters.GetDefaultViewmodelPrefab());
	}

	public InstantiateFromPrefab(prefab: GameObject): void {
		let parent = CameraReferences.viewmodelCamera?.transform;
		if (!parent) {
			print("Missing viewmodel camera.");
			parent = Camera.main.transform;
		}
		if (!parent) {
			parent = CoreRefs.rootTransform;
		}
		const go = Object.Instantiate(prefab, parent);
		go.transform.localPosition = new Vector3(3.40097417e-9, -1.541525066, -0.0108257439);
		go.transform.localRotation = Quaternion.identity;
		go.name = "CharacterViewmodel";
		this.SetViewmodelGameObject(go);
	}

	public SetViewmodelGameObject(go: GameObject): void {
		if (this.viewmodelGo) {
			Object.Destroy(this.viewmodelGo);
		}

		this.viewmodelGo = go;
		this.viewmodelTransform = this.viewmodelGo.transform;

		const characterViewmodelComponent = this.viewmodelGo.GetAirshipComponent<AirshipCharacterViewmodel>();
		if (!characterViewmodelComponent) {
			error("Viewmodel is missing an AirshipCharacterViewmodel component.");
		}

		this.rig = characterViewmodelComponent.rig;
		this.anim = characterViewmodelComponent.animator;
		this.accessoryBuilder = characterViewmodelComponent.accessoryBuilder;
	}

	public Destroy(): void {
		Object.Destroy(this.viewmodelGo);
	}
}
