import { Controller, OnStart } from "@easy-games/flamework-core";
import { ClientSignals } from "Client/ClientSignals";
import { AudioManager } from "Shared/Audio/AudioManager";

@Controller({})
export class DamageIndicatorController implements OnStart {
	private damageIndicatorObject: Object | undefined;

	OnStart(): void {
		// this.damageIndicatorObject = AssetBridge.LoadAsset("Client/Resources/Prefabs/DamageIndicator.prefab");

		ClientSignals.EntityDamage.Connect((event) => {
			const entityGO = event.entity.networkObject.gameObject;

			//Entity Damage Animation
			event.entity.anim?.PlayTakeDamage(event.amount, event.damageType, entityGO.transform.position, entityGO);

			// Damage taken sound
			AudioManager.PlayAtPosition("Damage_Taken.wav", entityGO.transform.position);

			// Indicator
			// const indicatorGO = GameObjectBridge.InstantiateAt(
			// 	this.damageIndicatorObject!,
			// 	entityGO.transform.position.add(new Vector3(math.random(), 1.3, math.random())),
			// 	Quaternion.identity,
			// );

			// const text = indicatorGO.transform.GetChild(0).GetChild(0).GetComponent<TextMeshProUGUI>();
			// text.text = `${math.floor(event.amount)}`;

			// const rb = indicatorGO.transform.GetComponent<Rigidbody2D>();
			// rb.velocity.x = 10 * MathUtil.RandomSign() + math.random() * 0.2;
			// rb.velocity.y = 40;
			// const bin = new Bin();

			// bin.Add(() => {
			// 	GameObjectBridge.Destroy(indicatorGO);
			// });
		});

		ClientSignals.EntityDeath.Connect((event) => {
			// PvP Kill
			if (event.fromEntity?.IsLocalCharacter() && event.fromEntity !== event.entity) {
				AudioManager.PlayGlobal("Player_Kill", { volumeScale: 0.12 });
			}

			// Local death
			if (event.entity.IsLocalCharacter()) {
				AudioManager.PlayGlobal("Death", {
					volumeScale: 0.3,
				});
			}
		});
	}
}
