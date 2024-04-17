import { CoreItemType } from "@Easy/Core/Shared/Item/CoreItemType";
import Object from "@easy-games/unity-object-utils";
import { CoreNetwork } from "Shared/CoreNetwork";
import { Game } from "Shared/Game";
import { BlockDef } from "Shared/Item/ItemDefinitionTypes";
import { RunUtil } from "Shared/Util/RunUtil";
import { Signal, SignalCallback } from "Shared/Util/Signal";
import { ItemUtil } from "../Item/ItemUtil";
import { Block } from "./Block";
import { BlockDataAPI } from "./BlockData/BlockDataAPI";

export type BlockData = {
	[key: string]: unknown;
};

export interface PlaceBlockConfig {
	placedByEntityId?: number;
	/** True if should update collisions instantly.
	 *
	 * Defaults to true. */
	priority?: boolean;
	blockData?: BlockData;
}

export class World {
	public static skybox = "@Easy/Core/Shared/Resources/Skybox/BrightSky/bright_sky_2.png";

	public onVoxelPlaced = new Signal<[pos: Vector3, voxel: number]>();
	private onFinishedLoading = new Signal<void>();
	public onFinishedReplicatingChunksFromServer = new Signal<void>();
	private finishedLoading = false;
	private finishedReplicatingChunksFromServer = false;

	constructor(public readonly voxelWorld: VoxelWorld) {
		voxelWorld.OnVoxelPlaced((voxel, x, y, z) => {
			const vec = new Vector3(x, y, z);
			// print("VoxelPlaced (" + x + "," + y + "," + z + ")");
			BlockDataAPI.ClearBlockData(vec);
			voxel = VoxelWorld.VoxelDataToBlockId(voxel);
			this.onVoxelPlaced.Fire(vec, voxel);
		});

		if (!voxelWorld.finishedLoading) {
			voxelWorld.OnFinishedLoading(() => {
				this.finishedLoading = true;
				this.onFinishedLoading.Fire();
			});
		} else {
			this.finishedLoading = true;
			this.onFinishedLoading.Fire();
		}

		if (!voxelWorld.finishedReplicatingChunksFromServer) {
			voxelWorld.OnFinishedReplicatingChunksFromServer(() => {
				this.finishedReplicatingChunksFromServer = true;
				this.onFinishedReplicatingChunksFromServer.Fire();
			});
		} else {
			this.finishedReplicatingChunksFromServer = true;
			this.onFinishedReplicatingChunksFromServer.Fire();
		}
	}

	public IsFinishedLoading(): boolean {
		return this.finishedLoading;
	}

	public async WaitForFinishedLoading(): Promise<void> {
		if (this.finishedLoading) return;

		return new Promise<void>((resolve) => {
			this.onFinishedLoading.Wait();
			resolve();
		});
	}

	public IsFinishedReplicatingChunksFromServer(): boolean {
		return this.finishedReplicatingChunksFromServer;
	}

	public async WaitForFinishedReplicatingChunksFromServer(): Promise<void> {
		if (this.finishedReplicatingChunksFromServer) return;

		return new Promise<void>((resolve) => {
			this.onFinishedReplicatingChunksFromServer.Wait();
			resolve();
		});
	}

	public OnFinishedWorldLoading(callback: SignalCallback<void>) {
		if (this.voxelWorld.finishedLoading) {
			callback();
		} else {
			this.onFinishedLoading.Connect(callback);
		}
	}

	/**
	 *
	 * @param pos
	 * @returns Raw voxel data.
	 * @deprecated Use `GetVoxelAt()` instead.
	 */
	public GetRawVoxelDataAt(pos: Vector3): number {
		return this.voxelWorld.ReadVoxelAt(pos);
	}

	/**
	 * A more convenient version of ReadVoxelAt.
	 * @param pos
	 * @returns VoxelBlock at position.
	 */
	public GetBlockAt(pos: Vector3): Block {
		return new Block(this.voxelWorld.ReadVoxelAt(pos), this);
	}

	public GetBlockBelow(pos: Vector3): Block {
		return this.GetBlockAt(pos.add(new Vector3(0, -0.5, 0)));
	}

	public GetBlockAbove(pos: Vector3): Block {
		return this.GetBlockAt(pos.add(new Vector3(0, 0.5, 0)));
	}

	public IsBlockOccupiedAt(pos: Vector3) {
		return this.IsBlockOccupied(this.GetBlockAt(pos));
	}

	public IsBlockOccupied(block: Block | undefined) {
		return block !== undefined && !block.IsAir();
	}

	/**
	 * A way to find block data below a target. Used to know what a character is standing on
	 * @param pos
	 * @returns BlockMeta under the position.
	 */
	public GetBlockBelowMeta(pos: Vector3): BlockDef | undefined {
		return this.GetBlockBelow(pos)?.itemDef?.block;
	}

	public RaycastBlockBelow(startPos: Vector3, maxDistance = 10): BlockDef | undefined {
		const raycastPoint = this.RaycastVoxel(startPos, Vector3.down, maxDistance).HitPosition.sub(
			new Vector3(0, 0.1, 0),
		);
		const block = this.GetBlockAt(raycastPoint);
		return block?.itemDef?.block;
	}

	/**
	 * Translates the string block id to the corresponding voxel block id
	 * @param blockStringId The id of the block, e.g. `@Easy/Survival:STONE`
	 * @returns The voxel block id
	 */
	public GetVoxelIdFromId(blockStringId: string): number {
		return this.voxelWorld.blocks.GetBlockIdFromStringId(blockStringId);
	}

	/**
	 * Translates the int block id to the corresponding string block id
	 * @param voxelId The integer voxel id
	 * @returns The string block id
	 */
	public GetIdFromVoxelId(voxelId: number): string {
		return this.voxelWorld.blocks.GetStringIdFromBlockId(voxelId);
	}

	/**
	 * Places a block at the given position with the given ItemType
	 * @param pos The position
	 * @param itemType The item type
	 * @param config  The configuration for this placed block
	 */
	public PlaceBlockByItemType(pos: Vector3, itemType: CoreItemType, config?: PlaceBlockConfig): void {
		const itemDef = ItemUtil.GetItemDef(itemType);
		if (!itemDef.block) return;

		this.PlaceBlockById(pos, itemDef.block.blockId, config);
	}

	/**
	 * Places a block at the given position, with the given `blockStringId`
	 *
	 * e.g. `@Easy/Core:GRASS` (aka `ItemType.GRASS`) should spawn a grass block at that position
	 * @param pos The position of the block
	 * @param blockStringId The block type id
	 * @param config The configuration for this placed block
	 */
	public PlaceBlockById(pos: Vector3, blockStringId: string, config?: PlaceBlockConfig): void {
		return this.PlaceBlockByVoxelId(pos, this.GetVoxelIdFromId(blockStringId), config);
	}

	/**
	 * Deletes the block at the given position (setting it to air)
	 * @param pos The position of the block to delete
	 */
	public DeleteBlock(pos: Vector3) {
		this.PlaceBlockByVoxelId(pos, 0);
	}

	/**
	 * Places a block at the given position, with the given `blockVoxelId`.
	 *
	 * @param pos The position of the block
	 * @param blockVoxelId The block voxel id
	 * @param config The configuration for this placed block
	 */
	private PlaceBlockByVoxelId(pos: Vector3, blockVoxelId: number, config?: PlaceBlockConfig): void {
		this.voxelWorld.WriteVoxelAt(pos, blockVoxelId, config?.priority ?? true);
		if (config?.blockData) {
			// print("SetBlockData (" + pos.x + "," + pos.y + "," + pos.z + ")");
			for (const key of Object.keys(config.blockData)) {
				BlockDataAPI.SetBlockData(pos, key as string, config.blockData[key]);
			}
		}

		if (RunUtil.IsServer()) {
			CoreNetwork.ServerToClient.BlockPlace.server.FireAllClients(pos, blockVoxelId, config?.placedByEntityId);
		}
		if (RunUtil.IsClient()) {
			if (config?.placedByEntityId === Game.localPlayer.character?.id) {
				// Client predicted block place event
				// const clientSignals = import("Client/CoreClientSignals").expect().CoreClientSignals;
				// const BlockPlaceClientSignal = import("Client/Signals/BlockPlaceClientSignal").expect()
				// 	.BlockPlaceClientSignal;
				// const block = new Block(blockVoxelId, this);
				// clientSignals.BlockPlace.Fire(
				// 	new BlockPlaceClientSignal(pos, block, Game.localPlayer.character, false),
				// );
			}
		}
	}

	/**
	 * Deletes the given block positions
	 * @param positions The list of positions of the blocks to delete
	 */
	public DeleteBlockGroup(positions: Vector3[]) {
		// eslint-disable-next-line @typescript-eslint/no-array-constructor
		return this.PlaceBlockGroupByVoxelId(positions, table.create(positions.size(), 0));
	}

	/**
	 * Places the given block ids at teh given positions, for each item in the position array the corresponding index in the blockIds array will apply to that position
	 *
	 * @param positions The list of positions to place blocks at
	 * @param blockIds A list of block ids to set in relation to the positions list
	 * @param config The place block configuration
	 */
	public PlaceBlockGroupById(positions: Vector3[], blockIds: string[], config?: PlaceBlockConfig): void {
		const blockVoxelIds = blockIds.map((id) => this.GetVoxelIdFromId(id));
		return this.PlaceBlockGroupByVoxelId(positions, blockVoxelIds, config);
	}

	private PlaceBlockGroupByVoxelId(positions: Vector3[], blockIds: number[], config?: PlaceBlockConfig): void {
		let blocks: Block[] = [];
		let binaryData: { pos: Vector3; blockId: number }[] = [];

		let keyMap: Map<string, { position: Vector3[]; data: any[] }> = new Map();
		let isLocalPrediction = Game.IsClient() && config?.placedByEntityId === Game.localPlayer.character?.id;

		positions.forEach((position, i) => {
			if (config?.blockData) {
				for (const key of Object.keys(config.blockData)) {
					let newMapData = keyMap.get(key as string);
					if (!newMapData) {
						newMapData = { position: [], data: [] };
					}
					newMapData.position.push(position);
					newMapData.data.push(config.blockData[key]);
					keyMap.set(key as string, newMapData);
					//BlockDataAPI.SetBlockData(position, key as string, config.blockData[key]);
				}
			}
			blocks[i] = new Block(blockIds[i], this);
			binaryData.push({ pos: position, blockId: blockIds[i] });
			if (isLocalPrediction && RunUtil.IsClient()) {
				// Client predicted block place event
				// const clientSignals = import("Client/CoreClientSignals").expect().CoreClientSignals;
				// const BlockPlaceClientSignal = import("Client/Signals/BlockPlaceClientSignal").expect()
				// 	.BlockPlaceClientSignal;
				// clientSignals.BlockPlace.Fire(
				// 	new BlockPlaceClientSignal(position, blocks[i], Game.localPlayer.character, true),
				// );
			}
		});

		this.voxelWorld.WriteVoxelGroupAtTS(new BinaryBlob(binaryData), config?.priority ?? true);
		//Call block keys in batches based on keytype to avoid calling it per block (it sends a network event)
		keyMap.forEach((value, key) => {
			//print("Sending batch key data: " + key + ", " + value.data.size());
			BlockDataAPI.SetBlockGroupCustomData(value.position, key, value.data);
		});
	}

	public LoadWorldFromSaveFile(binaryFile: WorldSaveFile): void {
		this.voxelWorld.LoadWorldFromSaveFile(binaryFile);
	}

	public LoadEmptyWorld(cubeMapPath: string): void {
		this.voxelWorld.LoadEmptyWorld(cubeMapPath);
	}

	public LoadWorld(): void {
		this.voxelWorld.LoadWorld();
	}

	public RaycastVoxel(pos: Vector3, direction: Vector3, maxDistance: number): VoxelRaycastResult {
		return this.voxelWorld.RaycastVoxel(pos, direction, maxDistance);
	}

	public GetBlockDefinition(blockId: number): BlockDefinition | undefined {
		return this.voxelWorld.blocks.GetBlockDefinitionFromIndex(blockId);
	}

	public GetBlockAverageColor(blockId: number): Color | undefined {
		return this.GetBlockDefinition(blockId)?.averageColor.GetValue(0);
	}
}
