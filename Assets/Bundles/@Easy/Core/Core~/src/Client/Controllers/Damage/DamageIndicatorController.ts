import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { AssetCache } from "Shared/AssetCache/AssetCache";
import { AudioManager } from "Shared/Audio/AudioManager";
import { Bin } from "Shared/Util/Bin";
import { ColorUtil } from "Shared/Util/ColorUtil";
import { RandomUtil } from "Shared/Util/RandomUtil";
import { SetTimeout } from "Shared/Util/Timer";

@Controller({})
export class DamageIndicatorController implements OnStart {
	private combatEffectsCanvas: Canvas;
	public hitMarkerImage: Image;
	private hitMarkerBin = new Bin();
	public hitMarkerAudioClip: AudioClip | undefined;
	public criticalHitAudioClips: AudioClip[] = [];
	private indicatorPrefab: GameObject;
	private indicatorPos: Vector2;
	private damageIndicatorBin = new Bin();

	constructor() {
		const combatEffectsUI = Object.Instantiate<GameObject>(
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Prefabs/UI/Combat/CombatEffectsUI.prefab"),
		);
		this.combatEffectsCanvas = combatEffectsUI.GetComponent<Canvas>();
		Object.Destroy(combatEffectsUI.transform.FindChild("DamageIndicator")!.gameObject);
		this.hitMarkerImage = combatEffectsUI.transform.GetChild(0).GetComponent<Image>();
		this.hitMarkerImage.enabled = false;
		this.indicatorPrefab = AssetCache.LoadAsset(
			"@Easy/Core/Shared/Resources/Prefabs/UI/Combat/DamageIndicator.prefab",
		);
		this.indicatorPos = this.indicatorPrefab.GetComponent<RectTransform>().anchoredPosition;
		PoolManager.PreLoadPool(this.indicatorPrefab, 5);
	}

	OnStart(): void {
		// this.damageIndicatorObject = AssetBridge.Instance.LoadAsset("Client/Resources/Prefabs/DamageIndicator.prefab");
		this.hitMarkerAudioClip = AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Sound/Hit_Health.ogg");
		this.criticalHitAudioClips = [
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Sound/Drone_Damage_01.ogg"),
			AssetBridge.Instance.LoadAsset("@Easy/Core/Shared/Resources/Sound/Drone_Damage_02.ogg"),
		];

		CoreClientSignals.EntityDamage.Connect((event) => {
			const entityGO = event.entity.networkObject.gameObject;

			//Hitstun
			//const hitstunDuration = DamageUtils.AddHitstun(event.entity, event.amount, () => {});

			//Entity Damage Animation
			event.entity.animator?.PlayTakeDamage(0.25, event.damageType, entityGO.transform.position, entityGO);

			// Damage taken sound
			AudioManager.PlayAtPosition(
				"@Easy/Core/Shared/Resources/Sound/Damage_Taken.wav",
				entityGO.transform.position,
				{
					maxDistance: 50,
					rollOffMode: AudioRolloffMode.Linear,
					volumeScale: 0.4,
				},
			);

			if (event.fromEntity?.IsLocalCharacter()) {
				this.hitMarkerBin.Clean();
				this.hitMarkerImage.enabled = true;
				this.hitMarkerBin.Add(
					SetTimeout(0.08, () => {
						this.hitMarkerImage.enabled = false;
					}),
				);

				if (event.criticalHit) {
					if (this.criticalHitAudioClips.size() > 0) {
						const clip = RandomUtil.FromArray(this.criticalHitAudioClips);
						AudioManager.PlayClipGlobal(clip, {
							volumeScale: 0.6,
						});
					}
				} else {
					AudioManager.PlayClipGlobal(this.hitMarkerAudioClip!, {
						volumeScale: 0.6,
					});
				}

				this.CreateDamageIndicator(event.amount, event.criticalHit);
			}
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

	public CreateDamageIndicator(amount: number, criticalHit: boolean): void {
		this.damageIndicatorBin.Clean();

		const go = PoolManager.SpawnObject(this.indicatorPrefab);
		go.transform.SetParent(this.combatEffectsCanvas.transform);
		const rect = go.GetComponent<RectTransform>();
		rect.anchoredPosition = this.indicatorPos;
		const baseScale = new Vector3(1, 1, 1).mul(criticalHit ? 1.6 : 1);
		rect.localScale = baseScale;

		const text = go.GetComponent<TMP_Text>();
		text.text = math.floor(amount) + "";
		text.alpha = 1;

		if (criticalHit) {
			text.color = ColorUtil.HexToColor("#FFF82A");
		} else {
			text.color = ColorUtil.HexToColor("#FF3B57");
		}

		let startedFadeOut = false;

		// pop in
		const popInScale = 2.5;
		rect.TweenLocalScale(baseScale.mul(new Vector3(popInScale, popInScale, popInScale)), 0.11).SetPingPong();

		const DoFadeOut = (bumpUp: boolean) => {
			if (bumpUp) {
				rect.anchoredPosition = rect.anchoredPosition.add(new Vector2(0, 30));
				rect.TweenAnchoredPositionY(this.indicatorPos.y + 40 + (bumpUp ? 30 : 0), 0.68).SetEase(
					EaseType.QuadIn,
				);
			}
			text.TweenGraphicAlpha(0, 0.8).SetEase(EaseType.QuadIn);
			startedFadeOut = true;

			let completed = false;
			SetTimeout(0.8, () => {
				completed = true;
			});
			// this.damageIndicatorBin.Add(() => {
			// 	if (!completed) {
			// 		text.TweenGraphicAlpha(0, 0);
			// 	}
			// });

			SetTimeout(1.5, () => {
				PoolManager.ReleaseObject(go);
			});
		};

		// fade out
		this.damageIndicatorBin.Add(
			SetTimeout(0.8, () => {
				if (!startedFadeOut) {
					DoFadeOut(false);
				}
			}),
		);

		this.damageIndicatorBin.Add(() => {
			if (!startedFadeOut) {
				DoFadeOut(true);
			}
		});
	}
}
