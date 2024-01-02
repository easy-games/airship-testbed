import BWKillFeedItemComponent from "./BWKillFeedItemComponent";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Entity } from "@Easy/Core/Shared/Entity/Entity";
import { CoreClientSignals } from "@Easy/Core/Client/CoreClientSignals";
import { DamageType } from "@Easy/Core/Shared/Damage/DamageType";
import { GameObjectUtil } from "@Easy/Core/Shared/GameObject/GameObjectUtil";

export default class BWKillFeedComponent extends AirshipBehaviour {
	public KillListItemPrefab?: GameObject = undefined;
	private bin = new Bin();

	private AddTargetKillEntry(killedEntity: Entity, damageType: DamageType, killedByEntity: Entity | undefined) {
		let entry = GameObjectUtil.Instantiate(this.KillListItemPrefab!);

		const canvasGroup = entry.GetComponent<CanvasGroup>();
		canvasGroup.alpha = 0;
		canvasGroup.TweenCanvasGroupAlpha(1, 0.1);

		const killItem = entry.GetComponent<BWKillFeedItemComponent>();
		killItem.SetAttackEntity(killedByEntity);
		killItem.SetDamageType(damageType);
		killItem.SetKilledEntity(killedEntity);

		entry.transform.SetParent(this.gameObject.transform, false);
		task.delay(5, () => {
			canvasGroup.TweenCanvasGroupAlpha(0, 0.1);
		});

		task.delay(5.2, () => GameObjectUtil.Destroy(entry));
	}

	public override OnStart(): void {
		this.gameObject.ClearChildren();

		this.bin.Add(
			CoreClientSignals.EntityDeath.Connect((event) => {
				event.damageType;
				this.AddTargetKillEntry(event.entity, event.damageType, event.killer);
			}),
		);
	}

	public override OnDestroy(): void {
		this.bin.Destroy();
	}
}
