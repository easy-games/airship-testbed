import { Airship } from "../Airship";
import { Controller, OnStart, Service } from "../Flamework";
import { Bin } from "../Util/Bin";
import { CSArrayUtil } from "../Util/CSArrayUtil";
import { MapUtil } from "../Util/MapUtil";
import { Signal } from "../Util/Signal";

type TagSignal = Pick<Signal<[GameObject]>, "Connect" | "ConnectWithPriority" | "Once" | "Wait">;
type TagSignalSet = WeakSet<Signal<[GameObject]>>;

@Controller()
@Service()
export class TagsSingleton implements OnStart {
	private tagManager!: TagManager;

	private tagAddedSignals = new Map<string, TagSignalSet>();
	private tagRemovedSignals = new Map<string, TagSignalSet>();

	OnStart(): void {
		const tagManager = TagManager.Instance;
		Airship.tags = this;
		this.tagManager = tagManager;

		tagManager.OnTagAdded((tag, gameObject) => {
			const signal = this.tagAddedSignals.get(tag);
			signal?.forEach((signal) => signal.Fire(gameObject));
		});

		tagManager.OnTagRemoved((tag, gameObject) => {
			const signal = this.tagRemovedSignals.get(tag);
			signal?.forEach((signal) => signal.Fire(gameObject));
		});
	}

	public AddTag(gameObject: GameObject, tag: string): void {
		this.tagManager.AddTag(gameObject, tag);
	}

	public HasTag(gameObject: GameObject, tag: string): boolean {
		return this.tagManager.HasTag(gameObject, tag);
	}

	public RemoveTag(gameObject: GameObject, tag: string): void {
		this.tagManager.RemoveTag(gameObject, tag);
	}

	public GetTags(tag: GameObject): ReadonlyArray<string> {
		const csTags = this.tagManager.GetAllTagsForGameObject(tag);
		const tags = CSArrayUtil.Convert(csTags);
		return tags;
	}

	public GetTagged(tag: string): ReadonlyArray<GameObject> {
		const csGameObjects = this.tagManager.GetTagged(tag);
		const gameObjects = CSArrayUtil.Convert(csGameObjects);
		return gameObjects;
	}

	public GetAllTags(): ReadonlyArray<string> {
		const csTags = this.tagManager.GetAllTags();
		const tags = CSArrayUtil.Convert(csTags);
		return tags;
	}

	public GetTagAddedSignal(tag: string): TagSignal {
		const tagSignalSet = MapUtil.GetOrCreate(this.tagAddedSignals, tag, () => new WeakSet() as TagSignalSet);
		const signal = new Signal<[GameObject]>();
		tagSignalSet.add(signal);
		return signal;
	}

	public GetTagRemovedSignal(tag: string): TagSignal {
		const tagSignalSet = MapUtil.GetOrCreate(this.tagRemovedSignals, tag, () => new WeakSet() as TagSignalSet);
		const signal = new Signal<[GameObject]>();
		tagSignalSet.add(signal);
		return signal;
	}
}
