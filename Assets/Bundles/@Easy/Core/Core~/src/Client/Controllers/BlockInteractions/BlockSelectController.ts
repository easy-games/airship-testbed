import { Controller, OnStart } from "@easy-games/flamework-core";
import { CoreClientSignals } from "Client/CoreClientSignals";
import { CoreRefs } from "Shared/CoreRefs";
import { Game } from "Shared/Game";
import { Layer } from "Shared/Util/Layer";
import { Signal } from "Shared/Util/Signal";
import { OnUpdate } from "Shared/Util/Timer";
import { BlockDataAPI } from "Shared/VoxelWorld/BlockData/BlockDataAPI";
import { WorldAPI } from "Shared/VoxelWorld/WorldAPI";
import { CameraReferences } from "../Camera/CameraReferences";
import { EntityController } from "../Entity/EntityController";

@Controller({})
export class BlockSelectController implements OnStart {
	private highlightGO: GameObject | undefined;
	public selectedBlockPosition?: Vector3;
	public highlightBlockPosition?: Vector3;
	public placeBlockPosition?: Vector3;
	public isVoidPlacement = false;
	public highlightOnPlacement = false;

	private voidPlane: GameObject | undefined;
	private enabledCount = 0;
	private lastVoidPlaceTime = 0;
	private highlightEnabled = true;
	private isHighlighting = false;

	public onNewBlockSelected: Signal<{
		selectedPos: Vector3 | undefined;
		placedPos: Vector3 | undefined;
		highlightedPos: Vector3 | undefined;
	}> = new Signal();

	constructor(private readonly entityController: EntityController) {}

	OnStart(): void {
		const world = WorldAPI.GetMainWorld();
		if (!world) return;

		const highlightPrefab = AssetBridge.Instance.LoadAsset(
			"@Easy/Core/Client/Resources/Prefabs/BlockSelect/BlockSelectHighlight.prefab",
		);
		if (!highlightPrefab) {
			print("Failed to find highlight prefab.");
			return;
		}
		this.highlightGO = Object.Instantiate(highlightPrefab, CoreRefs.rootTransform);
		this.highlightGO.layer = Layer.IGNORE_RAYCAST;
		this.highlightGO.transform.position = new Vector3(10_000, 0, 10_000);
		this.highlightGO.SetActive(false);

		const voidPlanePrefab = AssetBridge.Instance.LoadAsset("@Easy/Core/Client/Resources/Prefabs/VoidPlane.prefab");
		this.voidPlane = Object.Instantiate(voidPlanePrefab, CoreRefs.rootTransform);
		this.voidPlane.name = "VoidPlane";
		this.voidPlane.transform.localScale = new Vector3(50, 0.99, 50);
		this.voidPlane.transform.position = new Vector3(10_000, 0, 10_000);
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

			if (this.isVoidPlacement || this.highlightOnPlacement) {
				if (this.placeBlockPosition && this.highlightGO) {
					this.highlightGO.transform.position = this.placeBlockPosition.add(new Vector3(0.5, 0.5, 0.5));
					this.Highlight(true);
					return;
				}
			}
			if (this.highlightBlockPosition && this.highlightGO) {
				this.highlightGO.transform.position = this.highlightBlockPosition.add(new Vector3(0.5, 0.5, 0.5));
				this.Highlight(true);
				return;
			}

			this.Highlight(false);
		});
	}

	public ToggleHighlight(enable: boolean) {
		this.highlightEnabled = enable;
		this.Highlight(this.isHighlighting);
	}

	private Highlight(shouldHighlight: boolean) {
		this.isHighlighting = shouldHighlight;
		this.highlightGO?.SetActive(shouldHighlight && this.highlightEnabled);
	}

	private CalcSelectedBlock(): void {
		const player = Game.localPlayer;
		if (!player?.character) {
			this.selectedBlockPosition = undefined;
			this.placeBlockPosition = undefined;
			return;
		}
		const characterPos = player.character.gameObject.transform.position;

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
		if (result?.Hit) {
			if (result.HitPosition.sub(characterPos).magnitude <= 8) {
				let newHighlightPos = WorldAPI.GetVoxelPosition(result.HitPosition.sub(result.HitNormal.mul(0.1)));
				let newSelectedPos = newHighlightPos;
				let newPlacedPos = WorldAPI.GetVoxelPosition(result.HitPosition.add(result.HitNormal.mul(0.1)));
				const parentBlockPos = BlockDataAPI.GetParentBlockPos(newHighlightPos);
				if (parentBlockPos) {
					newSelectedPos = parentBlockPos;
				}
				this.UpdatePositions(newSelectedPos, newPlacedPos, newHighlightPos);
				this.isVoidPlacement = false;
				return true;
			}
		}
		return false;
	}

	private TryVoidSelect(characterPos: Vector3): boolean {
		const world = WorldAPI.GetMainWorld();
		if (!world) return false;

		let blockBeneathPos: Vector3 | undefined;
		let characterPosSnapped: Vector3 = characterPos.add(new Vector3(0, 0.2, 0));
		for (let i = 1; i <= 3; i++) {
			let pos = characterPosSnapped.sub(new Vector3(0, i, 0));
			let voxel = WorldAPI.GetMainWorld()?.GetRawVoxelDataAt(pos);
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
					let checkVoxel = world.GetRawVoxelDataAt(rounded);
					if (checkVoxel === 0) {
						emptyBlockPos = rounded;
						break;
					}
				}
				if (emptyBlockPos !== undefined) {
					const newPlacePos = new Vector3(emptyBlockPos.x, math.round(emptyBlockPos.y), emptyBlockPos.z);
					this.UpdatePositions(newPlacePos, newPlacePos, newPlacePos);
					this.isVoidPlacement = true;
					return true;
				}
			}
		}
		return false;
	}

	private UpdatePositions(
		newSelectedPos: Vector3 | undefined,
		newPlacePos: Vector3 | undefined,
		newHighlightPos: Vector3 | undefined,
	) {
		if (
			newSelectedPos === this.selectedBlockPosition &&
			newPlacePos === this.placeBlockPosition &&
			newHighlightPos === this.highlightBlockPosition
		) {
			return;
		}

		this.selectedBlockPosition = newSelectedPos;
		this.placeBlockPosition = newPlacePos;
		this.highlightBlockPosition = newHighlightPos;

		this.onNewBlockSelected.Fire({
			selectedPos: newSelectedPos,
			placedPos: newPlacePos,
			highlightedPos: newHighlightPos,
		});
	}

	private ResetVariables() {
		this.UpdatePositions(undefined, undefined, undefined);
		this.isVoidPlacement = false;
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
			this.Highlight(false);
		}
	}

	public PlacedVoidBridgeBlock(): void {
		this.lastVoidPlaceTime = os.clock();
	}
}
