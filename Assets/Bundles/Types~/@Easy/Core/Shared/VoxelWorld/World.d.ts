/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/compiler-types" />
import { ItemType } from "../Item/ItemType";
import { Signal } from "../Util/Signal";
import { BlockMeta } from "../Item/ItemMeta";
import { Block } from "./Block";
export interface PlaceBlockConfig {
    placedByEntityId?: number;
    /** True if should update collisions instantly.
     *
     * Defaults to true. */
    priority?: boolean;
    blockData?: {
        [key: string]: unknown;
    };
}
export declare class World {
    readonly voxelWorld: VoxelWorld;
    static SKYBOX: string;
    OnVoxelPlaced: Signal<[pos: Vector3, voxel: number]>;
    OnFinishedLoading: Signal<void>;
    OnFinishedReplicatingChunksFromServer: Signal<void>;
    private finishedLoading;
    private finishedReplicatingChunksFromServer;
    constructor(voxelWorld: VoxelWorld);
    IsFinishedLoading(): boolean;
    WaitForFinishedLoading(): Promise<void>;
    IsFinishedReplicatingChunksFromServer(): boolean;
    WaitForFinishedReplicatingChunksFromServer(): Promise<void>;
    /**
     *
     * @param pos
     * @returns Raw voxel data.
     * @deprecated Use `GetVoxelAt()` instead.
     */
    GetRawVoxelDataAt(pos: Vector3): number;
    /**
     * A more convenient version of ReadVoxelAt.
     * @param pos
     * @returns VoxelBlock at position.
     */
    GetBlockAt(pos: Vector3): Block;
    GetBlockBelow(pos: Vector3): Block;
    GetBlockAbove(pos: Vector3): Block;
    /**
     * A way to find block data below a target. Used to know what a character is standing on
     * @param pos
     * @returns BlockMeta under the position.
     */
    GetBlockBelowMeta(pos: Vector3): BlockMeta | undefined;
    RaycastBlockBelow(startPos: Vector3, maxDistance?: number): BlockMeta | undefined;
    /**
     * Translates the string block id to the corresponding voxel block id
     * @param blockStringId The id of the block, e.g. `@Easy/Core:STONE`
     * @returns The voxel block id
     */
    GetWorldBlockIdFromStringId(blockStringId: string): number;
    /**
     * Translates the int block id to the corresponding string block id
     * @param voxelId The integer voxel id
     * @returns The string block id
     */
    GetStringIdFromWorldBlockId(voxelId: number): string;
    PlaceBlock(pos: Vector3, itemType: ItemType, config?: PlaceBlockConfig): void;
    /**
     * Places a block at the given position, with the given `blockStringId`
     *
     * e.g. `@Easy/Core:GRASS` (aka `ItemType.GRASS`) should spawn a grass block at that position
     * @param pos The position of the block
     * @param blockStringId The block type id
     * @param config The configuration for this placed block
     */
    PlaceBlockById(pos: Vector3, blockStringId: string, config?: PlaceBlockConfig): void;
    /**
     * Deletes the block at the given position (setting it to air)
     * @param pos The position of the block to delete
     */
    DeleteBlock(pos: Vector3): void;
    /**
     * Places a block at the given position, with the given `blockVoxelId`.
     *
     * @param pos The position of the block
     * @param blockVoxelId The block voxel id
     * @param config The configuration for this placed block
     */
    private PlaceBlockByVoxelId;
    DeleteBlockGroup(positions: Vector3[]): void;
    PlaceBlockGroupById(positions: Vector3[], blockIds: string[], config?: PlaceBlockConfig): void;
    PlaceBlockGroupByVoxelId(positions: Vector3[], blockIds: number[], config?: PlaceBlockConfig): void;
    LoadWorldFromSaveFile(binaryFile: WorldSaveFile): void;
    LoadEmptyWorld(cubeMapPath: string): void;
    RaycastVoxel(pos: Vector3, direction: Vector3, maxDistance: number): VoxelRaycastResult;
    GetBlockDefinition(blockId: number): BlockDefinition | undefined;
    GetBlockAverageColor(blockId: number): Color | undefined;
}
