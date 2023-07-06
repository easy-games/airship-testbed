import { Controller, OnStart } from "@easy-games/flamework-core";
import { GameObjectBridge } from "Shared/GameObjectBridge";
import { PointlightDto } from "Shared/Pointlight/PointlightMeta";
import { Task } from "Shared/Util/Task";

/** Light update delay. */
const LIGHT_UPDATE_DELAY = 8;

@Controller({ loadOrder: -1 })
export class PointlightController implements OnStart {
	/** Pointlight prefab. */
	private pointlightPrefab: Object;

	constructor() {
		this.pointlightPrefab = AssetBridge.LoadAsset("Shared/Resources/Prefabs/Pointlight.prefab");
	}

	OnStart(): void {
		/* TEMP: Waiting for fix for pointlight dirtying race condition. Force dirty. */
		this.UpdateLights();
	}

	/** Creates a pointlight provided some `PointlightDto`. */
	public CreatePointlight(pointlight: PointlightDto): void {
		this.GetVoxelWorld().GetComponent<VoxelWorld>().UpdateLights();
		const pointlightObject = GameObjectBridge.InstantiateIn(this.pointlightPrefab, this.GetVoxelWorld().transform);
		pointlightObject.name = "Pointlight";
		const pointlightComponent = pointlightObject.GetComponent<PointLight>();
		/* Set pointlight properties. */
		pointlightComponent.color = new Color(
			pointlight.color[0],
			pointlight.color[1],
			pointlight.color[2],
			pointlight.color[3],
		);
		pointlightComponent.transform.position = pointlight.position;
		pointlightComponent.transform.rotation = pointlight.rotation;
		pointlightComponent.intensity = pointlight.intensity;
		pointlightComponent.range = pointlight.range;
		pointlightComponent.castShadows = pointlight.castShadows;
		pointlightComponent.highQualityLight = pointlight.highQualityLight;
		/* Force light update. */
		this.UpdateLights();
	}

	/** Fetches `VoxelWorld` GameObject. */
	private GetVoxelWorld(): GameObject {
		return GameObject.Find("VoxelWorld");
	}

	/** Updates `VoxelWorld` lights. */
	private UpdateLights(): void {
		Task.Delay(LIGHT_UPDATE_DELAY, () => {
			const world = this.GetVoxelWorld().GetComponent<VoxelWorld>();
			world.UpdateSceneLights();
		});
	}
}
