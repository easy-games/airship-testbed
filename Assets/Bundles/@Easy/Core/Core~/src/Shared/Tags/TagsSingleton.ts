import { Airship } from "../Airship";
import { Controller, OnStart, Service } from "../Flamework";
import { Bin } from "../Util/Bin";
import { CSArrayUtil } from "../Util/CSArrayUtil";
import { MapUtil } from "../Util/MapUtil";
import { Signal } from "../Util/Signal";

type TagSignal = Pick<Signal<[GameObject]>, "Connect" | "ConnectWithPriority" | "Once" | "Wait">;
type TagSignalSet = Set<Signal<[GameObject]>>;

@Controller()
@Service()
export class TagsSingleton implements OnStart {
	private tagManager!: TagManager;

	private tagAddedSignals = new Map<string, Signal<[GameObject]>>();
	private tagRemovedSignals = new Map<string, Signal<[GameObject]>>();

	OnStart(): void {
		const tagManager = TagManager.Instance;
		Airship.tags = this;
		this.tagManager = tagManager;

		tagManager.OnTagAdded((tag, gameObject) => {
			const signal = this.tagAddedSignals.get(tag);
			print("Tag added signal recieved", tag, gameObject.name);
			signal?.Fire(gameObject);
		});

		tagManager.OnTagRemoved((tag, gameObject) => {
			const signal = this.tagRemovedSignals.get(tag);
			print("Tag removed signal recieved", tag, gameObject.name);
			signal?.Fire(gameObject);
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

	public OnTagAdded(tag: string): TagSignal {
		const tagSignal = MapUtil.GetOrCreate(this.tagAddedSignals, tag, () => new Signal<[GameObject]>());
		return tagSignal;
	}

	public OnTagRemoved(tag: string): TagSignal {
		const tagSignal = MapUtil.GetOrCreate(this.tagRemovedSignals, tag, () => new Signal<[GameObject]>());
		return tagSignal;
	}
}
