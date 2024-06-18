import { Airship } from "../Airship";
import { CoreRefs } from "../CoreRefs";

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
		this.viewmodelGo = go;
		this.viewmodelTransform = this.viewmodelGo.transform;
		this.viewmodelTransform.position = new Vector3(10_000, 0, 10_000);

		const refs = this.viewmodelGo.GetComponent<GameObjectReferences>()!;
		const rig = refs.GetValue("Refs", "Rig");
		this.anim = rig.GetComponent<Animator>()!;

		this.rig = rig.GetComponent<CharacterRig>()!;

		const content = this.viewmodelTransform.GetChild(0).gameObject;
		this.accessoryBuilder = content.GetComponent<AccessoryBuilder>()!;
	}

	public Destroy(): void {
		Object.Destroy(this.viewmodelGo);
	}
}
