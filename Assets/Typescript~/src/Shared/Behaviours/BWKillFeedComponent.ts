import BWKillFeedItemComponent from "./BWKillFeedItemComponent";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { CoreClientSignals } from "@Easy/Core/Client/CoreClientSignals";

export default class BWKillFeedComponent extends AirshipBehaviour {
	public killListItemPrefab?: GameObject = undefined;
	private bin = new Bin();

	private AddTargetKillEntry(killedEntity: Entity, killedByEntity: Entity) {
		let entry = PoolManager.SpawnObject(this.killListItemPrefab!);
		entry.transform.parent = this.gameObject.transform;

		const canvasGroup = entry.GetComponent<CanvasGroup>();
		canvasGroup.alpha = 0;
		canvasGroup.TweenCanvasGroupAlpha(1, 0.1);

		const killItem = entry.GetComponent<BWKillFeedItemComponent>();
		killItem.SetAttackEntity(killedByEntity);
		killItem.SetKilledEntity(killedEntity);

		task.delay(5, () => {
			canvasGroup.TweenCanvasGroupAlpha(0, 0.1);
		});

		task.delay(5.2, () => PoolManager.ReleaseObject(entry));
	}

	public override OnStart(): void {
		this.gameObject.ClearChildren();

		this.bin.Add(
			CoreClientSignals.EntityDeath.Connect((event) => {
				if (event.killer) this.AddTargetKillEntry(event.entity, event.killer);
			}),
		);
	}

	public override OnDestroy(): void {
		this.bin.Destroy();
	}
}
