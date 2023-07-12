import { Dependency } from "@easy-games/flamework-core";
import { GameObjectBridge } from "Shared/GameObjectBridge";
import { GetItemMeta, GetItemTypeFromBlockId } from "Shared/Item/ItemDefinitions";
import { ItemType } from "Shared/Item/ItemType";
import { RunUtil } from "Shared/Util/RunUtil";
import { VoxelDataAPI } from "Shared/VoxelWorld/VoxelData/VoxelDataAPI";
import { TeamController } from "../../../Client/Controllers/Global/Team/TeamController";
import { Network } from "../../Network";
import { Theme } from "../../Util/Theme";
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
		world.OnVoxelPlaced.Connect((pos, voxel) => {
			const blockId = VoxelWorld.VoxelDataToBlockId(voxel);
			const itemType = GetItemTypeFromBlockId(blockId);

			this.OnBlockDestroy(pos);

			if (itemType) {
				this.OnBlockPlace(pos, itemType);
			}
		});

		/* Listen to updates to voxel meta data */
		Network.ServerToClient.SetVoxelData.Client.OnServerEvent((voxelPos, key, data) => {
			const go = this.objectMap.get(voxelPos);
			if (go) {
				if (key === "teamId") {
					const teamColor = Dependency<TeamController>().GetTeam(data as string)?.color ?? Theme.White;
					const rens = go.GetComponentsInChildren<MeshRenderer>("MeshRenderer");
					for (let i = 0; i < rens.Length; i++) {
						const ren = rens.GetValue(i);
						if (ren.gameObject.tag === "TeamColor") {
							const ren = rens.GetValue(i);
							const mats = ren.materials;
							for (let j = 0; j < mats.Length; j++) {
								const mat = mats.GetValue(j);
								mat.color = new Color(
									mat.color.r * teamColor.r,
									mat.color.g * teamColor.g,
									mat.color.b * teamColor.b,
								);
							}
						}
					}
				}
			}
		});
	}

	private OnBlockPlace(pos: Vector3, itemType: ItemType): void {
		const itemMeta = GetItemMeta(itemType);
		if (itemMeta.block?.prefab) {
			const prefab = AssetBridge.LoadAsset<Object>(
				`Shared/Resources/VoxelWorld/BlockPrefabs/${itemMeta.block.prefab.path}`,
			);
			const prefabGO = GameObjectBridge.InstantiateAt(prefab, pos, Quaternion.identity);
			this.objectMap.set(pos, prefabGO);

			if (itemMeta.block.prefab.childBlocks) {
				const world = WorldAPI.GetMainWorld();
				for (const vec of itemMeta.block.prefab.childBlocks) {
					const worldSpace = pos.add(vec);
					VoxelDataAPI.SetChildOfParent(worldSpace, pos);
					world.PlaceBlockById(worldSpace, WorldAPI.ChildVoxelId);
				}
			}
		}
		if (itemMeta.block?.health !== undefined && RunUtil.IsServer()) {
			VoxelDataAPI.SetVoxelData(pos, "health", itemMeta.block.health);
		}
	}

	private OnBlockDestroy(pos: Vector3): void {
		const obj = this.objectMap.get(pos);
		if (obj) {
			let animatingOut = false;
			const ref = obj.GetComponent<GameObjectReferences>();
			if (ref) {
				const anim = ref.GetValue<Animation>("Animation", "OnDeath");
				if (anim) {
					animatingOut = true;
					anim.Play();
					GameObjectBridge.Destroy(obj, 5);
				}
			}
			if (!animatingOut) {
				GameObjectBridge.Destroy(obj);
			}
		}
		const world = WorldAPI.GetMainWorld();
		const childPositions = VoxelDataAPI.GetChildrenVoxelPos(pos);
		for (const childPos of childPositions) {
			world.PlaceBlockById(childPos, 0);
		}
	}
}
