import { Airship } from "@Easy/Core/Shared/Airship";
import ObjectUtils from "@Easy/Core/Shared/Util/ObjectUtils";
import { GameObjectUtil } from "../../../../Core/Shared/GameObject/GameObjectUtil";
import { ItemUtil } from "../../../../Core/Shared/Item/ItemUtil";
import { RunUtil } from "../../../../Core/Shared/Util/RunUtil";
import { SurvivalNetwork } from "../../SurvivalNetwork";
import { BlockDataAPI, CoreBlockMetaKeys } from "../BlockData/BlockDataAPI";
import { WorldAPI } from "../WorldAPI";

export class PrefabBlockManager {
  private static instance: PrefabBlockManager | undefined;
  public static Get(): PrefabBlockManager {
    if (this.instance === undefined) {
      this.instance = new PrefabBlockManager();
    }
    return this.instance;
  }

  private objectMap = new Map<Vector3, GameObject>();

  constructor() {
    const world = WorldAPI.GetMainWorld();
    if (!world) return;
    world.onVoxelPlaced.Connect((pos, voxel) => {
      const blockId = VoxelWorld.VoxelDataToBlockId(voxel);
      const itemType = ItemUtil.GetItemTypeFromStringId(
        world.GetIdFromVoxelId(blockId)
      );

      this.OnBlockDestroy(pos);

      if (itemType) {
        this.OnBlockPlace(pos, itemType);
      }
    });

    if (RunUtil.IsServer()) {
      Airship.Players.onPlayerJoined.Connect((player) => {
        SurvivalNetwork.ServerToClient.SyncPrefabBlocks.server.FireClient(
          player,
          ObjectUtils.keys(this.objectMap)
        );
      });
    } else {
      SurvivalNetwork.ServerToClient.SyncPrefabBlocks.client.OnServerEvent(
        (blockPositions) => {
          world.WaitForFinishedReplicatingChunksFromServer().then(() => {
            for (const pos of blockPositions) {
              const block = world.GetBlockAt(pos);
              if (block.itemType) {
                this.OnBlockPlace(pos, block.itemType);
                // const clientSignals = import("Client/CoreClientSignals").expect().CoreClientSignals;
                // const BlockPlaceClientSignal = import("Client/Signals/BlockPlaceClientSignal").expect()
                // 	.BlockPlaceClientSignal;
                // clientSignals.BlockPlace.Fire(new BlockPlaceClientSignal(pos, block, undefined, true));
              }
            }
          });
        }
      );
    }
  }

  public GetBlockGameObject(pos: Vector3): GameObject | undefined {
    return this.objectMap.get(pos);
  }

  private OnBlockPlace(pos: Vector3, itemType: string): void {
    const itemMeta = ItemUtil.GetItemDef(itemType);
    if (itemMeta.block?.prefab) {
      const prefab = AssetBridge.Instance.LoadAsset<Object>(
        itemMeta.block.prefab.path
      );
      const prefabGO = GameObjectUtil.InstantiateAt(
        prefab,
        pos,
        Quaternion.identity
      );
      this.objectMap.set(pos, prefabGO);

      if (itemMeta.block.prefab.childBlocks) {
        const world = WorldAPI.GetMainWorld();
        for (const vec of itemMeta.block.prefab.childBlocks) {
          const worldSpace = pos.add(vec);
          BlockDataAPI.SetChildOfParent(worldSpace, pos);
          world?.PlaceBlockById(worldSpace, "@Easy/Core:CHILD_OF_BLOCK");
        }
      }
    }
    if (itemMeta.block?.health !== undefined && RunUtil.IsServer()) {
      BlockDataAPI.SetBlockData(
        pos,
        CoreBlockMetaKeys.CURRENT_HEALTH,
        itemMeta.block.health
      );
    }
  }

  private OnBlockDestroy(pos: Vector3): void {
    const obj = this.objectMap.get(pos);
    if (obj) {
      let animatingOut = false;
      const ref = obj.GetComponent<GameObjectReferences>()!;
      if (ref) {
        const anim = ref.GetValue<Animation>("Animation", "OnDeath");
        if (anim) {
          animatingOut = true;
          anim.Play();
          GameObjectUtil.Destroy(obj, 5);
        }
      }
      if (!animatingOut) {
        GameObjectUtil.Destroy(obj);
      }
    }
    const world = WorldAPI.GetMainWorld();
    const childPositions = BlockDataAPI.GetChildrenBlockPos(pos);
    for (const childPos of childPositions) {
      world?.DeleteBlock(childPos);
    }

    this.objectMap.delete(pos);
  }
}
