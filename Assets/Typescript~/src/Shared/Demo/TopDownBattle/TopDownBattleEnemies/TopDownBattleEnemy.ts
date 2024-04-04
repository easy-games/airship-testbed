import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { Layer } from "@Easy/Core/Shared/Util/Layer";
import { LayerUtil } from "@Easy/Core/Shared/Util/LayerUtil";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";

export default class TopDownBattleEnemy extends AirshipBehaviour {
	@Header("References")
	public graphicsHolder!: Transform;
	public anim!: Animator;
	public rigid!: Rigidbody;

	@Header("Variables")
	public moveForce = 10;
	public minMoveTime = 3;
	public maxMoveTime = 10;
	public damageAmount = 1;

	private targetMoveTime = 0;
	private targetCharacter?: Character;

	override OnEnable(): void {
		print("SPAWNED ENEMY " + this.gameObject.GetInstanceID() + " AT: " + this.graphicsHolder.position);
		this.PickNextMove();
	}

	override Update(dt: number): void {
		print("UPDATED ENEMY " + this.gameObject.GetInstanceID() + " AT: " + this.graphicsHolder.position);

		//Only update the enemy on the server
		if (!Game.IsServer()) {
			return;
		}

		//Look towards our target if we have one
		if (this.targetCharacter) {
			this.transform.LookAt(this.targetCharacter.transform.position);
		}

		//Move after set intervals
		if (Time.time > this.targetMoveTime) {
			this.Move();
		}
	}

	private Move() {
		this.PickNextMove();

		//Find the closest target
		this.targetCharacter = this.GetClosestCharacter();
		if (this.targetCharacter) {
			//Move towards the target
			let force = this.targetCharacter.transform.position
				.sub(this.transform.position)
				.normalized.mul(this.moveForce);
			this.rigid.AddForce(force, ForceMode.Impulse);

			//Trigger the animation
			this.anim.SetTrigger("Move");
		}
	}

	private PickNextMove() {
		//Pick next move target
		this.targetMoveTime = Time.time + MathUtil.Lerp(this.minMoveTime, this.maxMoveTime, math.random());
	}

	private GetClosestCharacter(): Character | undefined {
		let closestCharacter: Character | undefined;
		let closestDistance = 9999;
		for (let character of Airship.characters.GetCharacters()) {
			let distance = Vector3.Distance(character.transform.position, this.transform.position);
			if (distance < closestDistance) {
				closestCharacter = character;
				closestDistance = distance;
			}
		}
		return closestCharacter;
	}

	override OnCollisionEnter(collision: Collision): void {
		//Early out if we didn't hit a character
		if (collision.gameObject.layer !== Layer.CHARACTER) {
			return;
		}

		print("Hit something: " + collision.gameObject.name);

		//Try to grab the character
		let character = collision.gameObject.GetAirshipComponent<Character>();
		if (character) {
			print("HIT CHARACTER!");
			Airship.damage.InflictDamage(character.gameObject, this.damageAmount, this.gameObject);
		}
	}
}
