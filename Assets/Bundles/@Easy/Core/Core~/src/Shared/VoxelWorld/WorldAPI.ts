import { Entity } from "Shared/Entity/Entity";
import { BreakBlockMeta } from "Shared/Item/ItemMeta";
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

	public static CalculateBlockHitDamageFromBreakBlockMeta(
		entity: Entity | undefined,
		block: Block,
		blockPos: Vector3,
		breakBlockMeta: BreakBlockMeta,
	): number {
		let signal = new BlockHitDamageSignal(breakBlockMeta.damage, entity, block, blockPos, breakBlockMeta);
		this.OnBlockHitDamageCalc.Fire(signal);
		return signal.damage;
	}

	public static CalculateBlockHitDamage(
		entity: Entity | undefined,
		block: Block,
		blockPos: Vector3,
		damage: number,
	): number {
		let signal = new BlockHitDamageSignal(damage, entity, block, blockPos, undefined);
		this.OnBlockHitDamageCalc.Fire(signal);
		return signal.damage;
	}
}
