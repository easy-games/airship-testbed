import { Airship } from "../../Airship";
import { Game } from "../../Game";
import { CoreAction } from "../../Input/AirshipCoreAction";
import { Binding } from "../../Input/Binding";

export default class CharacterRagdoll extends AirshipBehaviour {
	public startOn = false;
	public interpolationMode = RigidbodyInterpolation.None;
	public collisionDetectionMode = CollisionDetectionMode.Discrete;
	public toggleOffDuringRagdoll: MonoBehaviour[];
	public testForce = 10;

	private colliders: Collider[] = [];
	private rigids: Rigidbody[] = [];
	private rig: CharacterRig;
	private anim: Animator;
	private ragdollEnabled = false;

	protected Awake(): void {
		this.rig = this.gameObject.GetComponent<CharacterRig>()!;
		if (!this.rig) {
			error("CharacterRagdoll component must be on the same object as the CharacterRig");
		}
		this.anim = this.gameObject.GetComponent<Animator>()!;
		const foundRigids = this.gameObject.GetComponentsInChildren<Rigidbody>();
		for (const rigid of foundRigids) {
			let go = rigid.gameObject;
			this.rigids.push(rigid);
			this.colliders.push(go.GetComponent<Collider>()!);
		}
		this.ragdollEnabled = true;
		this.SetRagdoll(false);

		const TEST = false;
		if (TEST) {
			Airship.Input.CreateAction("TEST", Binding.Key(Key.F));
			Airship.Input.OnDown("TEST").Connect(() => {
				this.AddGlobalForce(
					Game.localPlayer.character?.movement?.GetVelocity().mul(this.testForce) ?? Vector3.zero,
					ForceMode.Impulse,
				);
				this.AddExplosiveForce(
					math.random(10, 20) * this.testForce,
					new Vector3(math.random() - 0.5, math.random() - 0.5, math.random() - 0.5).add(
						Game.localPlayer.character?.transform.position ?? Vector3.zero,
					),
					5,
					1 + math.random() * 2,
					ForceMode.Impulse,
				);
			});

			Airship.Input.OnDown(CoreAction.Jump).Connect(() => {
				this.SetRagdoll(!this.ragdollEnabled);
			});
		}
	}

	protected Start(): void {
		this.ragdollEnabled = !this.startOn;
		this.SetRagdoll(this.startOn);
	}

	public SetRagdoll(ragdollOn: boolean) {
		if (this.ragdollEnabled === ragdollOn) {
			return;
		}

		this.ragdollEnabled = ragdollOn;
		//Toggle animator
		if (this.anim) {
			this.anim.enabled = !ragdollOn;
		}

		//Let prefabs specify specifies that need to toggle
		if (this.toggleOffDuringRagdoll) {
			for (let i = 0; i < this.toggleOffDuringRagdoll.size(); i++) {
				this.toggleOffDuringRagdoll[i].enabled = !ragdollOn;
			}
		}

		//Toggle physics objects
		for (let i = 0; i < this.rigids.size(); i++) {
			//print("Joint " + this.rigids[i].gameObject.name + " vel: " + this.rigids[i].linearVelocity);
			//Have to set collision mode to Discrete with going kinematic otherwise Unity throws an error
			let rigid = this.rigids[i];
			if (!rigid.isKinematic) {
				this.rigids[i].linearVelocity = Vector3.zero;
				this.rigids[i].angularVelocity = Vector3.zero;
			}
			this.rigids[i].collisionDetectionMode = ragdollOn
				? this.collisionDetectionMode
				: CollisionDetectionMode.Discrete;
			this.rigids[i].interpolation = ragdollOn ? this.interpolationMode : RigidbodyInterpolation.None;
			this.rigids[i].isKinematic = !ragdollOn;
			if (!rigid.isKinematic) {
				this.rigids[i].linearVelocity = Vector3.zero;
				this.rigids[i].angularVelocity = Vector3.zero;
			}
			this.colliders[i].enabled = ragdollOn;
		}

		//Make sure skinned meshes still render even when thrown far from origin
		const renderers = this.gameObject.GetComponentsInChildren<SkinnedMeshRenderer>();
		for (const renderer of renderers) {
			renderer.updateWhenOffscreen = ragdollOn;
		}
	}

	public ForceVelocity(newLinearVelocity: Vector3, newAngularVelocity: Vector3) {
		for (let i = 0; i < this.rigids.size(); i++) {
			this.rigids[i].linearVelocity = newLinearVelocity;
			this.rigids[i].angularVelocity = newAngularVelocity;
		}
	}

	public AddGlobalForce(force: Vector3, mode: ForceMode) {
		if (!this.ragdollEnabled) {
			return;
		}

		for (let i = 0; i < this.rigids.size(); i++) {
			this.rigids[i].AddForce(force, mode);
		}
	}

	public AddExplosiveForce(
		explosionForce: number,
		explosionPosition: Vector3,
		explosionRadius: number,
		upwardsModifier: number,
		mode: ForceMode,
	) {
		if (!this.ragdollEnabled) {
			return;
		}

		for (let i = 0; i < this.rigids.size(); i++) {
			this.rigids[i].AddExplosionForce(explosionForce, explosionPosition, explosionRadius, upwardsModifier, mode);
		}
	}
}
