import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AudioManager } from "Shared/Audio/AudioManager";
import { DamageUtils } from "Shared/Damage/DamageUtils";
import { Bin } from "Shared/Util/Bin";
import { SetTimeout } from "Shared/Util/Timer";

@Controller({})
export class DamageIndicatorController implements OnStart {
	private damageIndicatorObject: Object | undefined;
	public hitMarkerImage: Image;
	private hitMarkerBin = new Bin();
	public hitMarkerAudioClip: AudioClip | undefined;

	constructor() {
		const combatEffectsUI = Object.Instantiate<GameObject>(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/CombatEffectsUI.prefab"),
		);
		this.hitMarkerImage = combatEffectsUI.transform.GetChild(0).GetComponent<Image>();
		this.hitMarkerImage.enabled = false;
	}

	OnStart(): void {
		// this.damageIndicatorObject = AssetBridge.Instance.LoadAsset("Client/Resources/Prefabs/DamageIndicator.prefab");
		this.hitMarkerAudioClip = AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Sound/Hit_Health.ogg");

		CoreClientSignals.EntityDamage.Connect((event) => {
			const entityGO = event.entity.networkObject.gameObject;

			//Hitstun
			const hitstunDuration = DamageUtils.AddHitstun(event.entity, event.amount, () => {});

			//Entity Damage Animation
			event.entity.animator?.PlayTakeDamage(
				hitstunDuration,
				event.damageType,
				entityGO.transform.position,
				entityGO,
			);

			// Damage taken sound
			AudioManager.PlayAtPosition(
				"@Easy/Core/Shared/Resources/Sound/Damage_Taken.wav",
				entityGO.transform.position,
			);

			if (event.fromEntity?.IsLocalCharacter()) {
				this.hitMarkerBin.Clean();
				this.hitMarkerImage.enabled = true;
				this.hitMarkerBin.Add(
					SetTimeout(0.08, () => {
						this.hitMarkerImage.enabled = false;
					}),
				);

				AudioManager.PlayClipGlobal(this.hitMarkerAudioClip!);
			}

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

		CoreClientSignals.EntityDeath.Connect((event) => {
			event.entity.animator?.PlayDeath(event.damageType);

			// PvP Kill
			if (event.killer?.IsLocalCharacter() && event.killer !== event.entity) {
				AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/Player_Kill", { volumeScale: 0.12 });
			}

			// Local death
			if (event.entity.IsLocalCharacter()) {
				AudioManager.PlayGlobal("@Easy/Core/Shared/Resources/Sound/Death", {
					volumeScale: 0.3,
				});
			}
		});
	}
}
