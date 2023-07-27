import Object from "@easy-games/unity-object-utils";
import { Game } from "Shared/Game";
import { ItemType } from "Shared/Item/ItemType";
import { Network } from "Shared/Network";
import { Signal } from "Shared/Util/Signal";
import { BlockMeta } from "../Item/ItemMeta";
import { ItemUtil } from "../Item/ItemUtil";
import { Block } from "./Block";
import { BlockDataAPI } from "./BlockData/BlockDataAPI";

export interface PlaceBlockConfig {
	placedByEntityId?: number;
	priority?: boolean;
	blockData?: {
		[key: string]: unknown;
	};
}

export class World {
	public static SKYBOX = "Shared/Resources/Skybox/BrightSky/bright_sky_2.png";

	public OnVoxelPlaced = new Signal<[pos: Vector3, voxel: number]>();
	public OnFinishedLoading = new Signal<void>();
	public OnFinishedReplicatingChunksFromServer = new Signal<void>();
	private finishedLoading = false;
	private finishedReplicatingChunksFromServer = false;

	constructor(public readonly voxelWorld: VoxelWorld) {
		voxelWorld.OnVoxelPlaced((voxel, x, y, z) => {
			const vec = new Vector3(x, y, z);
			BlockDataAPI.ClearBlockData(vec);
			voxel = VoxelWorld.VoxelDataToBlockId(voxel);
			this.OnVoxelPlaced.Fire(vec, voxel);
		});

		if (!voxelWorld.finishedLoading) {
			voxelWorld.OnFinishedLoading(() => {
				this.finishedLoading = true;
				this.OnFinishedLoading.Fire();
			});
		} else {
			this.finishedLoading = true;
			this.OnFinishedLoading.Fire();
		}

		if (!voxelWorld.finishedReplicatingChunksFromServer) {
			voxelWorld.OnFinishedReplicatingChunksFromServer(() => {
				this.finishedReplicatingChunksFromServer = true;
				this.OnFinishedReplicatingChunksFromServer.Fire();
			});
		} else {
			this.finishedReplicatingChunksFromServer = true;
			this.OnFinishedReplicatingChunksFromServer.Fire();
		}
	}

	public IsFinishedLoading(): boolean {
		return this.finishedLoading;
	}

	public async WaitForFinishedLoading(): Promise<void> {
		if (this.finishedLoading) return;

		return new Promise<void>((resolve) => {
			this.OnFinishedLoading.Wait();
			resolve();
		});
	}

	public IsFinishedReplicatingChunksFromServer(): boolean {
		return this.finishedReplicatingChunksFromServer;
	}

	public async WaitForFinishedReplicatingChunksFromServer(): Promise<void> {
		if (this.finishedReplicatingChunksFromServer) return;

		return new Promise<void>((resolve) => {
			this.OnFinishedReplicatingChunksFromServer.Wait();
			resolve();
		});
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

	/**
	 * A way to find block data below a target. Used to know what a character is standing on
	 * @param pos
	 * @returns BlockMeta under the position.
	 */
	public GetBlockBelowMeta(pos: Vector3): BlockMeta | undefined {
		return this.GetBlockAt(pos.add(new Vector3(0, -0.5, 0)))?.itemMeta?.block;
	}

	public PlaceBlock(pos: Vector3, itemType: ItemType, config?: PlaceBlockConfig): void {
		const itemMeta = ItemUtil.GetItemMeta(itemType);
		if (!itemMeta.block) return;

		const blockId = itemMeta.block.blockId;
		this.PlaceBlockById(pos, blockId, config);
	}

	public PlaceBlockById(pos: Vector3, blockId: number, config?: PlaceBlockConfig): void {
		this.voxelWorld.WriteVoxelAt(pos, blockId, config?.priority ?? true);
		if (config?.blockData) {
			for (const key of Object.keys(config.blockData)) {
				BlockDataAPI.SetBlockData(pos, key as string, config.blockData[key]);
			}
		}

		if (RunCore.IsServer()) {
			Network.ServerToClient.BlockPlace.Server.FireAllClients(pos, blockId, config?.placedByEntityId);
		} else {
			if (config?.placedByEntityId === Game.LocalPlayer.Character?.id) {
				// Client predicted block place event
				const clientSignals = import("Client/ClientSignals").expect().ClientSignals;
				const BlockPlaceClientSignal = import("Client/Signals/BlockPlaceClientSignal").expect()
					.BlockPlaceClientSignal;

				const block = new Block(blockId, this);
				clientSignals.BlockPlace.Fire(new BlockPlaceClientSignal(pos, block, Game.LocalPlayer.Character));
			}
		}
	}

	public LoadWorldFromVoxelBinaryFile(binaryFile: VoxelBinaryFile, blockDefines: TextAsset): void {
		this.voxelWorld.LoadWorldFromVoxelBinaryFile(binaryFile, blockDefines);
	}

	public LoadEmptyWorld(blockDefines: TextAsset, cubeMapPath: string): void {
		this.voxelWorld.LoadEmptyWorld(blockDefines, cubeMapPath);
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
