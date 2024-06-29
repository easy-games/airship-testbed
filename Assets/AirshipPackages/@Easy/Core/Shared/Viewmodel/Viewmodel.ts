import { Airship } from "../Airship";
import { CoreRefs } from "../CoreRefs";
import AirshipCharacterViewmodel from "./AirshipCharacterViewmodel";

export class Viewmodel {
	public viewmodelGo!: GameObject;
	public viewmodelTransform!: Transform;
	public anim!: Animator;
	public accessoryBuilder!: AccessoryBuilder;
	public rig!: CharacterRig;

	constructor() {
		this.SetViewmodelGameObject(
			Object.Instantiate(Airship.characters.GetDefaultViewmodelPrefab(), CoreRefs.rootTransform),
		);
	}

	public SetViewmodelGameObject(go: GameObject): void {
		if (this.viewmodelGo) {
			Object.Destroy(this.viewmodelGo);
		}

		this.viewmodelGo = go;
		this.viewmodelTransform = this.viewmodelGo.transform;
		this.viewmodelTransform.position = new Vector3(10_000, 0, 10_000);

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
