import { Airship } from "@Easy/Core/Shared/Airship";
import Character from "@Easy/Core/Shared/Character/Character";
import { Game } from "@Easy/Core/Shared/Game";
import { RemoteEvent } from "@Easy/Core/Shared/Network/RemoteEvent";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Layer } from "@Easy/Core/Shared/Util/Layer";
import { MathUtil } from "@Easy/Core/Shared/Util/MathUtil";
import { SharedTime } from "@Easy/Core/Shared/Util/TimeUtil";

export default class TopDownBattleEnemy extends AirshipBehaviour {
	@Header("References")
	public graphicsHolder!: Transform;
	public nob!: NetworkObject;
	public anim!: Animator;
	public rigid!: Rigidbody;

	@Header("Variables")
	public moveForce = 10;
	public minMoveTime = 3;
	public maxMoveTime = 10;
	public damageAmount = 1;
	public knockbackForce = 10;

	private targetMoveTime = -1;
	private targetCharacter?: Character;

	//Events
	private bin: Bin = new Bin();
	private onMoveEvent = new RemoteEvent<[nobId: number, targetTime: number]>();
	private enabled = false;

	override OnEnable(): void {
		this.enabled = true;
		if (Game.IsServer()) {
			this.PickNextMove();
		}

		//Add to bin so we can remove the listener when the enemy is disabled
		this.bin.Add(
			//Listen to the server to know when the enemy is moving
			this.onMoveEvent.client.OnServerEvent((id, targetTime) => {
				if (this.nob.ObjectId === id) {
					this.targetMoveTime = targetTime;
				}
			}),
		);
	}

	override OnDisable(): void {
		this.enabled = false;
		//Event Cleanup
		this.bin.Clean();
	}

	public SetEnabled(enabled: boolean) {
		this.enabled = enabled;
	}

	override Update(dt: number): void {
		if (!this.enabled) {
			return;
		}

		if (Game.IsServer()) {
			//Look towards our target if we have one
			if (this.targetCharacter) {
				//Look at the character along a flat plane
				this.transform.LookAt(
					new Vector3(
						this.targetCharacter.transform.position.x,
						this.transform.position.y,
						this.targetCharacter.transform.position.z,
					),
				);
			}
		}

		//Move after set intervals
		if (this.targetMoveTime > 0 && SharedTime() > this.targetMoveTime) {
			this.targetMoveTime = -1;

			//Update visuals on client
			if (Game.IsClient()) {
				this.MoveClient();
			}

			//Only update the enemy movement on the server
			if (Game.IsServer()) {
				this.MoveServer();
			}
		}
	}

	private MoveServer() {
		this.PickNextMove();

		//Find the closest target
		this.targetCharacter = this.GetClosestCharacter();
		if (this.targetCharacter) {
			//Move towards the target
			let force = this.targetCharacter.transform.position
				.sub(this.transform.position)
				.normalized.mul(this.moveForce);
			this.rigid.AddForce(force, ForceMode.Impulse);
		}
	}

	private MoveClient() {
		//Only update the enemy visuals on the client
		this.anim.SetTrigger("Move");
	}

	private PickNextMove() {
		//Pick next move target
		this.targetMoveTime = SharedTime() + MathUtil.Lerp(this.minMoveTime, this.maxMoveTime, math.random());

		//Notify the clients when this character will move
		this.onMoveEvent.server.FireAllClients(this.nob.ObjectId, this.targetMoveTime);
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
		if (!this.enabled) {
			return;
		}

		//Only handle collisions on the server
		if (!Game.IsServer()) {
			return;
		}

		//Early out if we didn't hit a character
		if (collision.gameObject.layer !== Layer.CHARACTER) {
			return;
		}

		//print("Hit something: " + collision.gameObject.name);

		//Try to grab the character
		let character = collision.gameObject.GetAirshipComponent<Character>();
		if (character) {
			//print("HIT CHARACTER!");
			//Deal Damage
			Airship.damage.InflictDamage(character.gameObject, this.damageAmount, this.gameObject);
			//Knockback
			let dir = character.transform.position.sub(this.transform.position).normalized;
			character.movement.ApplyImpulse(new Vector3(dir.x, dir.y + 0.5, dir.z).mul(this.knockbackForce), false);
		}
	}
}
