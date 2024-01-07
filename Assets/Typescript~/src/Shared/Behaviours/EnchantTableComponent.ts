import { ProximityPrompt } from "@Easy/Core/Client/Controllers/ProximityPrompt/ProximityPrompt";
import { ProximityPromptController } from "@Easy/Core/Client/Controllers/ProximityPrompt/ProximityPromptController";
import { Game } from "@Easy/Core/Shared/Game";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { OnUpdate } from "@Easy/Core/Shared/Util/Timer";
import { Dependency } from "@easy-games/flamework-core";
import { Network } from "Shared/Network";
import { GetStatusEffectMeta } from "Shared/StatusEffect/StatusEffectDefinitions";
import { StatusEffectType } from "Shared/StatusEffect/StatusEffectType";

export default class EnchantTableComponent extends AirshipBehaviour {
	/** The team that **this** enchant table belongs to. */
	public teamId?: string;
	/** The table's network object id. */
	private nob = 0;
	/** References to specific table meshes. */
	private tableRefs?: GameObjectReferences;
	/** Whether or not **this** enchant table is currently unlocked. */
	private unlocked = false;
	/** The prompt that corresponds to **this** enchant table. */
	private prompt: ProximityPrompt | undefined;
	/** The prompt clean up bin. Destroys prompt and disconnects current activation signal. */
	private promptBin = new Bin();

	public override Start(): void {
		this.nob = this.gameObject.GetComponent<NetworkObject>().ObjectId;
		this.tableRefs = this.gameObject.GetComponent<GameObjectReferences>();
		if (RunCore.IsClient()) {
			const tableData = Network.ClientToServer.EnchantTable.EnchantTableStateRequest.client.FireServer(this.nob);
			this.teamId = tableData.teamId;
			this.unlocked = tableData.unlocked;
			this.SetupTable();
		}
	}

	public override OnDestroy(): void {}

	private SetupTable(): void {
		if (!this.unlocked) {
			this.CreateRepairPrompt();
		} else {
			this.CreatePurchasePrompt();
			this.PlayTableRepairEffects();
		}
		Network.ServerToClient.EnchantTable.EnchantTableUnlocked.client.OnServerEvent((tableNob) => {
			if (tableNob !== this.nob) return;
			// On repair, replace repair prompt with purchase prompt.
			// TODO: Clean up prompt destruction.
			this.unlocked = true;
			this.CreatePurchasePrompt();
			this.PlayTableRepairEffects();
		});
	}

	/**
	 * Creates repair proximity prompt. On prompt activation, repair request is sent to server.
	 */
	private CreateRepairPrompt(): void {
		this.promptBin.Clean();
		this.prompt = new ProximityPrompt({
			promptPosition: this.gameObject.transform.position.add(new Vector3(0, 2, 0)),
			activationKey: KeyCode.F,
			activationKeyString: "F",
			activationRange: 3,
			bottomText: "Repair",
			topText: "8 Diamonds",
		});
		this.promptBin.Add(() => {
			if (this.prompt?.promptGameObject) {
				GameObjectUtil.Destroy(this.prompt.promptGameObject);
				Dependency<ProximityPromptController>().RemovePrompt(this.prompt);
			}
		});
		this.promptBin.Add(
			this.prompt.onActivated.Connect(() => {
				Network.ClientToServer.EnchantTable.EnchantTableRepairRequest.client.FireServer(this.nob);
			}),
		);
	}

	/**
	 * Creates purchase proximity prompt. On activation, purchase request is sent to server.
	 */
	private CreatePurchasePrompt(): void {
		this.promptBin.Clean();
		this.prompt = new ProximityPrompt({
			promptPosition: this.gameObject.transform.position.add(new Vector3(0, 2, 0)),
			activationKey: KeyCode.F,
			activationKeyString: "F",
			activationRange: 3,
			bottomText: "Buy Enchant",
			topText: "2 Emeralds",
		});
		this.promptBin.Add(() => {
			if (this.prompt?.promptGameObject) {
				GameObjectUtil.Destroy(this.prompt.promptGameObject);
				Dependency<ProximityPromptController>().RemovePrompt(this.prompt);
			}
		});
		this.promptBin.Add(
			this.prompt.onActivated.Connect(() => {
				const result = Network.ClientToServer.EnchantTable.EnchantPurchaseRequest.client.FireServer(this.nob);
				if (result.success && result.enchantType !== undefined) {
					this.PlayTablePurchaseEffects(result.enchantType);
				}
			}),
		);
	}

	/**
	 * Plays table unlock effects.
	 * TODO: Lots of improvements to be made here, table needs to be separated
	 * out into more meshes.
	 */
	private PlayTableRepairEffects(): void {
		if (!this.tableRefs) return;
		const particle = this.tableRefs.GetValue<ParticleSystem>("TableParts", "Particle");
		const orbA = this.tableRefs.GetValue("TableParts", "OrbA");
		const swirl = this.tableRefs.GetValue("TableParts", "Swirl");
		orbA.transform.TweenLocalScale(new Vector3(1, 1, 1), 1).SetEaseBounceInOut();
		swirl.transform.TweenLocalScale(new Vector3(1, 1, 1), 0.5).SetEaseBounceInOut();
		task.delay(1.2, () => {
			const orbGoalPos = orbA.transform.position.add(new Vector3(0, 0.035, 0));
			const orbGoalRot = 1;
			orbA.transform.TweenPosition(orbGoalPos, 0.5).SetPingPong().SetLoopCount(1000000);
			orbA.transform.TweenRotationZ(orbGoalRot, 10).SetEaseSineIn().SetLoopCount(1000000);
			const swirlGoalPos = swirl.transform.position.add(new Vector3(0, 0.05, 0));
			const swirlGoalRot = 1;
			swirl.transform.TweenPosition(swirlGoalPos, 0.75).SetPingPong().SetLoopCount(1000000);
			swirl.transform.TweenRotationZ(swirlGoalRot, 6).SetEaseSineIn().SetLoopCount(1000000);
			particle.Play();
		});
	}

	/**
	 * Plays table purchase effects on **successful** enchant purchase.
	 * @param enchantType The type of enchant that was purchased.
	 */
	private PlayTablePurchaseEffects(enchantType: StatusEffectType): void {
		if (!this.tableRefs) return;
		const statusMeta = GetStatusEffectMeta(enchantType);
		// Speed up ambient particle effect.
		const ambientParticle = this.tableRefs.GetValue<ParticleSystem>("TableParts", "Particle");
		const originalEmissionRate = 5;
		const originalPlaybackSpeed = 1;
		ambientParticle.emissionRate = 15;
		ambientParticle.playbackSpeed = 1.5;
		task.delay(1, () => {
			ambientParticle.emissionRate = originalEmissionRate;
			ambientParticle.playbackSpeed = originalPlaybackSpeed;
		});
		// Move orb towards local character on a parabolic curve.
		const enchantOrbPrefab = AssetBridge.Instance.LoadAsset<Object>("Client/Resources/Prefabs/EnchantOrb.prefab");
		const enchantOrb = GameObjectUtil.InstantiateAt(
			enchantOrbPrefab,
			this.gameObject.transform.position,
			Quaternion.identity,
		);
		if (statusMeta.color) {
			const orbColor = enchantOrb.GetComponent<MaterialColor>();
			orbColor.SetAllColors(statusMeta.color, true);
		}
		const startPos = enchantOrb.transform.position;
		let orbProgress = 0;
		const orbMover = OnUpdate.Connect((dt) => {
			const targetPos = Game.localPlayer.character?.GetHeadPosition();
			if (orbProgress >= 1 || !targetPos) {
				orbMover();
				GameObjectUtil.Destroy(enchantOrb, 1);
				return;
			}
			const orbSpeed = 3.5;
			const distToTarget = enchantOrb.transform.position.sub(targetPos).magnitude;
			const stepScale = orbSpeed / distToTarget;
			orbProgress = math.min(orbProgress + dt * stepScale, 1);
			const parabola = 1.0 - 4.0 * (orbProgress - 0.5) * (orbProgress - 0.5);
			const arcHeight = 4;
			const nextPos = Vector3.Lerp(startPos, targetPos, orbProgress).add(new Vector3(0, parabola * arcHeight, 0));
			enchantOrb.transform.position = nextPos;
		});
	}
}
