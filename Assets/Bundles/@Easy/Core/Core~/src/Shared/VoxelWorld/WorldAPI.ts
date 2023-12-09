import { Entity } from "Shared/Entity/Entity";
import { BlockArchetype, BlockDamageType, BreakBlockDef } from "Shared/Item/ItemDefinitionTypes";
import { MathUtil } from "Shared/Util/MathUtil";
import { Signal } from "Shared/Util/Signal";
import { Block } from "./Block";
import { BlockHitDamageSignal } from "./Signal/BlockHitDamageSignal";
import { World } from "./World";

export class WorldAPI {
	private static world: World | undefined;
	public static DefaultVoxelHealth = 10;
	public static ChildVoxelId = 22;
	public static OnBlockHitDamageCalc = new Signal<BlockHitDamageSignal>();

	public static GetMainWorld(): World | undefined {
		if (this.world) {
			return this.world;
		}

		const voxelWorld = GameObject.Find("VoxelWorld")?.GetComponent<VoxelWorld>() as VoxelWorld | undefined;
		if (voxelWorld) {
			this.world = new World(voxelWorld);
		}

		return this.world;
	}

	public static GetVoxelPosition(worldPosition: Vector3) {
		return MathUtil.FloorVec(worldPosition);
	}

	public static CalculateBlockHitDamage(
		entity: Entity | undefined,
		block: Block,
		blockPos: Vector3,
		breakBlockMeta: BreakBlockDef,
	): number {
		let signal = new BlockHitDamageSignal(breakBlockMeta.damage, entity, block, blockPos, breakBlockMeta);
		this.OnBlockHitDamageCalc.Fire(signal);

		//Global Hit Damage Calcs
		//Block Types
		const archetype = signal.block.itemDef?.block?.blockArchetype ?? BlockArchetype.NONE;

		//Bonuse damage from item type
		if (archetype !== BlockArchetype.NONE) {
			signal.damage *=
				signal.breakBlockMeta?.extraDamageBlockArchetype === archetype
					? signal.breakBlockMeta.extraDamage ?? 1
					: 1;
		}

		const damageType = breakBlockMeta.damageType ?? BlockDamageType.NORMAL;
		//Blast Damage
		if (damageType === BlockDamageType.BLAST) {
			//Reduced damage from block type
			switch (archetype) {
				case BlockArchetype.STONE:
					signal.damage *= 0.5;
					break;
				case BlockArchetype.HARD_STONE:
					signal.damage *= 0.2;
					break;
				case BlockArchetype.BLAST_PROOF:
				case BlockArchetype.PROP:
					signal.damage = 0;
					break;
			}
		}

		return signal.damage;
	}
}
