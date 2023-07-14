import { Game } from "Shared/Game";
import { GetItemMeta } from "Shared/Item/ItemDefinitions";
import { ItemType } from "Shared/Item/ItemType";
import { Network } from "Shared/Network";
import { Signal } from "Shared/Util/Signal";
import { BlockMeta } from "../Item/ItemMeta";
import { Block } from "./Block";
import { VoxelDataAPI } from "./VoxelData/VoxelDataAPI";

export interface PlaceBlockConfig {
	placedByEntityId?: number;
	priority?: boolean;
}

export class World {
	public static SKYBOX = "Shared/Resources/Skybox/BrightSky/bright_sky_2.png";

	public OnVoxelPlaced = new Signal<[pos: Vector3, voxel: number]>();

	constructor(public readonly voxelWorld: VoxelWorld) {
		voxelWorld.OnVoxelPlaced((voxel, x, y, z) => {
			const vec = new Vector3(x, y, z);
			VoxelDataAPI.ClearVoxelData(vec);
			voxel = VoxelWorld.VoxelDataToBlockId(voxel);
			this.OnVoxelPlaced.Fire(vec, voxel);
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
		const itemMeta = GetItemMeta(itemType);
		if (!itemMeta.block) return;

		const blockId = itemMeta.block.blockId;
		this.PlaceBlockById(pos, blockId, config);
	}

	public PlaceBlockById(pos: Vector3, blockId: number, config?: PlaceBlockConfig): void {
		this.voxelWorld.WriteVoxelAt(pos, blockId, config?.priority ?? true);
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
