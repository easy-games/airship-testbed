import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { CoreNetwork } from "Shared/CoreNetwork";
import { EffectsManager } from "Shared/Effects/EffectsManager";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { ProgressBarGraphics } from "Shared/UI/ProgressBarGraphics";
import {
	BundleGroupNames,
	Bundle_Blocks,
	Bundle_Blocks_UI,
	Bundle_Blocks_VFX,
} from "Shared/Util/ReferenceManagerResources";
import { Theme } from "Shared/Util/Theme";
import { SetInterval } from "Shared/Util/Timer";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { EntityController } from "../Entity/EntityController";
import { InventoryController } from "../Inventory/InventoryController";
import { BlockSelectController } from "./BlockSelectController";
import { Entity } from "Shared/Entity/Entity";

interface HealthBarEntry {
	gameObject: GameObject;
	progressBar: ProgressBarGraphics;
	lastHitTime: number;
	maxHealth: number;
}

@Controller({})
export class BlockHealthController implements OnStart {
	private blockHealthBars = new Map<Vector3, HealthBarEntry>();
	HEALTHBAR_EXPIRE_TIME = 1.25;

	constructor(
		private readonly invController: InventoryController,
		private readonly blockSelectController: BlockSelectController,
		private readonly entityController: EntityController,
	) {}

	OnStart(): void {
		CoreNetwork.ServerToClient.BlockHit.Client.OnServerEvent((blockPos, blockId, entityId) => {
			if (Game.LocalPlayer.Character && entityId === Game.LocalPlayer.Character.id) return;

			const entity = this.entityController.GetEntityById(entityId);
			if (entity) {
				this.OnBlockHit(entity, blockPos, blockId, true);
			}
		});

		CoreNetwork.ServerToClient.BlockGroupHit.Client.OnServerEvent((blockPositions, blockIds, entityId) => {
			if (Game.LocalPlayer.Character && entityId === Game.LocalPlayer.Character.id) return;

			const entity = this.entityController.GetEntityById(entityId);
			if (entity) {
				blockPositions.forEach((position, index) => {
					this.OnBlockHit(entity, position, blockIds[index], true);
				});
			}
		});

		CoreNetwork.ServerToClient.BlockDestroyed.Client.OnServerEvent((blockPos, blockId) => {
			this.VisualizeBlockBreak(blockPos, blockId);
		});

		CoreNetwork.ServerToClient.BlockGroupDestroyed.Client.OnServerEvent((blockPositions, blockIds) => {
			blockPositions.forEach((position, index) => {
				this.VisualizeBlockBreak(position, blockIds[index], false);
			});
		});

		// OnLateUpdate.Connect((dt) => {
		// 	this.blockHealthBars.forEach((healthbarEntry, block) => {
		// 		healthbarEntry.gameObject.transform.rotation =
		// 			CameraReferences.Instance().mainCamera.transform.rotation;
		// 	});
		// });

		//Cleanup health bars after no changes are made
		SetInterval(0.1, () => {
			const toRemove = new Map<Vector3, HealthBarEntry>();
			this.blockHealthBars.forEach((entry, pos) => {
				if (Time.time >= entry.lastHitTime + this.HEALTHBAR_EXPIRE_TIME) {
					toRemove.set(pos, entry);
				}
			});
			toRemove.forEach((entry, pos) => {
				this.DeleteHealthBar(entry, pos);
			});
		});
	}

	private OnBlockHit(entity: Entity, blockPos: Vector3, blockId: number, isGroupEvent: boolean) {
		CoreClientSignals.AfterBlockHit.Fire({
			blockPos: blockPos,
			blockId,
			entity,
			isGroupEvent,
		});
		this.VisualizeBlockHealth(blockPos, !isGroupEvent);
	}

	public VisualizeBlockHealth(blockPos: Vector3, showHealthbar = true) {
		let currentHealth = this.GetBlockHealth(blockPos);

		//Get or create health bar
		if (showHealthbar) {
			let healthBarEntry = this.blockHealthBars.get(blockPos);
			if (!healthBarEntry) {
				healthBarEntry = this.AddHealthBar(blockPos);
				if (!healthBarEntry) {
					return;
				}
				healthBarEntry.lastHitTime = Time.time;
				healthBarEntry.progressBar.SetValue(currentHealth / healthBarEntry.maxHealth);
			}
		}

		//Update the health bars value
		if (currentHealth > 0) {
			const effect = EffectsManager.SpawnBundleEffect(
				BundleGroupNames.Blocks,
				Bundle_Blocks.VFX,
				Bundle_Blocks_VFX.OnHit,
				blockPos,
				Vector3.zero,
			);
			if (effect) {
				const block = WorldAPI.GetMainWorld()?.GetBlockAt(blockPos);
				if (block) {
					this.ApplyBlockMaterial(block.blockId, effect);
				}
			}
		}
	}

	public VisualizeBlockBreak(blockPos: Vector3, blockId: number, showHealthbars = true): void {
		//Get or create health bar
		let entry = this.blockHealthBars.get(blockPos);
		if (!entry) {
			if (showHealthbars) {
				entry = this.AddHealthBar(blockPos);
			}
		}

		//Play destruction vfx
		const effect = EffectsManager.SpawnBundleEffect(
			BundleGroupNames.Blocks,
			Bundle_Blocks.VFX,
			Bundle_Blocks_VFX.OnDeath,
			blockPos,
			Vector3.zero,
		);
		if (effect) {
			//const blockColor = WorldAPI.GetMainWorld().GetBlockAverageColor(blockId);
			//if (!blockColor) return;
			this.ApplyBlockMaterial(blockId, effect);
		}

		//Make sure the progress bar is at 0
		entry?.progressBar?.SetValue(0);
	}

	private ApplyBlockMaterial(blockId: number, effect: GameObject) {
		let particles = effect.transform.GetChild(0).GetComponent<ParticleSystemRenderer>();
		const world = WorldAPI.GetMainWorld();
		if (!world) return;
		const blockGO = MeshProcessor.ProduceSingleBlock(blockId, world.voxelWorld);
		if (blockGO) {
			const blockRen = blockGO.GetComponent<Renderer>();
			const blockFilter = blockGO.GetComponent<MeshFilter>();
			particles.mesh = blockFilter.mesh;
			particles.sharedMaterial = blockRen.sharedMaterial;
			GameObjectUtil.Destroy(blockGO);
		}
	}

	private GetBlockHealth(blockPos: Vector3) {
		return BlockDataAPI.GetBlockData<number>(blockPos, "health") ?? WorldAPI.DefaultVoxelHealth;
	}

	private AddHealthBar(blockPos: Vector3): HealthBarEntry | undefined {
		//Spawn the health bar
		const healthBarGo = EffectsManager.SpawnBundleEffect(
			BundleGroupNames.Blocks,
			Bundle_Blocks.UI,
			Bundle_Blocks_UI.HealthBar,
			blockPos.add(new Vector3(0.5, 1.5, 0.5)),
			Vector3.zero,
			-1,
		);
		if (!healthBarGo) {
			error("Missing health bar graphic!");
			return undefined;
		}

		//Get the meta for the hit block
		const itemMeta = WorldAPI.GetMainWorld()?.GetBlockAt(blockPos)?.itemMeta;

		//Create health bar entry
		let maxHealth = itemMeta?.block?.health ?? WorldAPI.DefaultVoxelHealth;
		let healthBarEntry = {
			gameObject: healthBarGo,
			lastHitTime: Time.time,
			progressBar: new ProgressBarGraphics(healthBarGo.transform.GetChild(0), {
				initialPercentDelta: this.GetBlockHealth(blockPos) / maxHealth,
				fillColor: Theme.Green,
			}),
			maxHealth: maxHealth,
		};

		this.blockHealthBars.set(blockPos, healthBarEntry);
		return healthBarEntry;
	}

	private RemoveHealthBar(blockPos: Vector3) {
		const entry = this.blockHealthBars.get(blockPos);
		if (entry) {
			this.DeleteHealthBar(entry, blockPos);
		}
	}

	private DeleteHealthBar(entry: HealthBarEntry, blockPos: Vector3) {
		this.blockHealthBars.delete(blockPos);
		entry.progressBar.OnDelete();
	}
}
