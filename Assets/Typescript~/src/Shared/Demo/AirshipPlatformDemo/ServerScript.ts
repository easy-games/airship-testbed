import { EntityService } from "@Easy/Core/Server/Services/Entity/EntityService";
import { EntityPrefabType } from "@Easy/Core/Shared/Entity/EntityPrefabType";
import { RandomUtil } from "@Easy/Core/Shared/Util/RandomUtil";
import { RunUtil } from "@Easy/Core/Shared/Util/RunUtil";
import { SetInterval, SetTimeout } from "@Easy/Core/Shared/Util/Timer";
import { Dependency } from "@easy-games/flamework-core";

export default class TestScript extends AirshipBehaviour {
	private entityService!: EntityService;
	public spawnArea!: GameObject;

	override Awake(): void {
		this.entityService = Dependency<EntityService>();
	}

	override Start(): void {
		if (RunUtil.IsClient()) return;

		// Only runs server
		const coreServerSignals = import("@Easy/Core/Server/CoreServerSignals").expect().CoreServerSignals;

		coreServerSignals.WeaponHit.Connect(() => {});

		const bounds = (this.spawnArea.collider as Collider).bounds;

		SetInterval(1000, () => {
			const randomLoc = new Vector3(
				math.random(bounds.min.x, bounds.max.x),
				math.random(bounds.min.y, bounds.max.y),
				math.random(bounds.min.z, bounds.max.z),
			);
			this.entityService.SpawnEntity(EntityPrefabType.HUMAN, randomLoc);
		});
	}

	override OnDestroy(): void {}
}
