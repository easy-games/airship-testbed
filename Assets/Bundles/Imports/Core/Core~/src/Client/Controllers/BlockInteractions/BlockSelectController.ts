import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { Game } from "Shared/Game";
import { GameObjectUtil } from "Shared/GameObject/GameObjectUtil";
import { Layer } from "Shared/Util/Layer";
import { MathUtil } from "Shared/Util/MathUtil";
import { OnUpdate } from "Shared/Util/Timer";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { CameraReferences } from "../Camera/CameraReferences";
import { EntityController } from "../Entity/EntityController";

@Controller({})
export class BlockSelectController implements OnStart {
	private highlightGO: GameObject | undefined;
	public SelectedBlockPosition?: Vector3;
	public HighlightBlockPosition?: Vector3;
	public PlaceBlockPosition?: Vector3;
	public IsVoidPlacement = false;

	private voidPlane: GameObject | undefined;
	private enabledCount = 0;
	private lastVoidPlaceTime = 0;

	constructor(private readonly entityController: EntityController) {}

	OnStart(): void {
		const highlightPrefab = AssetBridge.Instance.LoadAsset(
			"Client/Resources/Assets/BlockSelect/BlockSelectHighlight.prefab",
		);
		if (!highlightPrefab) {
			print("Failed to find highlight prefab.");
			return;
		}
		this.highlightGO = GameObjectUtil.Instantiate(highlightPrefab);
		this.highlightGO.layer = Layer.IGNORE_RAYCAST;
		this.highlightGO.SetActive(false);

		const voidPlanePrefab = AssetBridge.Instance.LoadAsset("Client/Resources/Prefabs/VoidPlane.prefab") as Object;
		this.voidPlane = GameObjectUtil.Instantiate(voidPlanePrefab);
		this.voidPlane.name = "VoidPlane";
		this.voidPlane.transform.localScale = new Vector3(50, 0.99, 50);
		this.voidPlane.layer = Layer.BRIDGE_ASSIST;

		//If our local player dies then this should be disabled
		CoreClientSignals.EntityDeath.Connect((event) => {
			if (event.entity.IsLocalCharacter()) {
				this.DisableAll();
			}
		});

		OnUpdate.Connect((dt) => {
			if (this.enabledCount <= 0) {
				return;
			}

			this.CalcSelectedBlock();

			if (this.IsVoidPlacement) {
				if (this.PlaceBlockPosition && this.highlightGO) {
					this.highlightGO.transform.position = this.PlaceBlockPosition.add(new Vector3(0.5, 0.5, 0.5));
					this.highlightGO.SetActive(true);
					return;
				}
			}
			if (this.HighlightBlockPosition && this.highlightGO) {
				this.highlightGO.transform.position = this.HighlightBlockPosition.add(new Vector3(0.5, 0.5, 0.5));
				this.highlightGO.SetActive(true);
				return;
			}

			this.highlightGO?.SetActive(false);
		});
	}

	private CalcSelectedBlock(): void {
		const player = Game.LocalPlayer;
		if (!player?.Character) {
			this.SelectedBlockPosition = undefined;
			this.PlaceBlockPosition = undefined;
			return;
		}
		const characterPos = player.Character.gameObject.transform.position;

		if (os.clock() - this.lastVoidPlaceTime < 0.3) {
			const voidSuccess = this.TryVoidSelect(characterPos);
			if (voidSuccess) return;
		}

		const mouseSuccess = this.TryMouseSelect(characterPos);
		if (mouseSuccess) return;

		const voidSuccess = this.TryVoidSelect(characterPos);
		if (voidSuccess) return;

		// couldn't find a block placement
		this.ResetVariables();
	}

	private TryMouseSelect(characterPos: Vector3): boolean {
		const result = CameraReferences.Instance().RaycastVoxelFromCamera(20);
		if (result.Hit) {
			if (result.HitPosition.sub(characterPos).magnitude <= 8) {
				this.SelectedBlockPosition = WorldAPI.GetVoxelPosition(
					result.HitPosition.sub(result.HitNormal.mul(0.1)),
				);
				this.HighlightBlockPosition = WorldAPI.GetVoxelPosition(
					result.HitPosition.sub(result.HitNormal.mul(0.1)),
				);
				const parentBlockPos = BlockDataAPI.GetParentBlockPos(this.HighlightBlockPosition);
				if (parentBlockPos) {
					this.SelectedBlockPosition = parentBlockPos;
				}
				this.PlaceBlockPosition = WorldAPI.GetVoxelPosition(result.HitPosition.add(result.HitNormal.mul(0.1)));
				this.IsVoidPlacement = false;
				return true;
			}
		}
		return false;
	}

	private TryVoidSelect(characterPos: Vector3): boolean {
		let blockBeneathPos: Vector3 | undefined;
		let characterPosSnapped: Vector3 = characterPos.add(new Vector3(0, 0.2, 0));
		for (let i = 1; i <= 3; i++) {
			let pos = characterPosSnapped.sub(new Vector3(0, i, 0));
			let voxel = WorldAPI.GetMainWorld().GetRawVoxelDataAt(pos);
			if (voxel) {
				blockBeneathPos = pos;
				break;
			}
		}
		if (blockBeneathPos) {
			if (this.voidPlane) {
				this.voidPlane.transform.position = blockBeneathPos;
			}
			const voidPlaneOnlyMask = 128;
			const [voidHit, voidPoint, voidNormal, voidCollider] = CameraReferences.Instance().RaycastPhysicsFromCamera(
				40,
				voidPlaneOnlyMask,
			);
			if (voidHit && voidCollider.transform === this.voidPlane?.transform) {
				let destPos = new Vector3(voidPoint.x, blockBeneathPos.y, voidPoint.z);
				let blockPos = blockBeneathPos;
				let emptyBlockPos: Vector3 | undefined;
				for (let i = 0; i < 10; i++) {
					let direction = destPos.sub(blockPos).normalized.mul(0.8);
					blockPos = blockPos.add(direction);
					const rounded = new Vector3(math.floor(blockPos.x), blockBeneathPos.y, math.floor(blockPos.z));
					let checkVoxel = WorldAPI.GetMainWorld().GetRawVoxelDataAt(rounded);
					if (checkVoxel === 0) {
						emptyBlockPos = rounded;
						break;
					}
				}
				if (emptyBlockPos !== undefined) {
					this.SelectedBlockPosition = undefined;
					this.PlaceBlockPosition = new Vector3(
						emptyBlockPos.x,
						math.round(emptyBlockPos.y),
						emptyBlockPos.z,
					);
					this.HighlightBlockPosition = this.PlaceBlockPosition;
					this.IsVoidPlacement = true;
					return true;
				}
			}
		}
		return false;
	}

	private ResetVariables() {
		this.SelectedBlockPosition = undefined;
		this.HighlightBlockPosition = undefined;
		this.PlaceBlockPosition = undefined;
		this.IsVoidPlacement = false;
	}

	public Enable() {
		this.enabledCount++;
	}

	private DisableAll() {
		this.enabledCount = 1;
		this.Disable();
	}

	public Disable() {
		this.enabledCount = math.max(0, this.enabledCount - 1);
		if (this.enabledCount <= 0 && this.highlightGO) {
			this.highlightGO?.SetActive(false);
		}
	}

	public PlacedVoidBridgeBlock(): void {
		this.lastVoidPlaceTime = os.clock();
	}
}
