import { Airship } from "../Airship";
import { Singleton } from "../Flamework";
import { CSArrayUtil } from "../Util/CSArrayUtil";
import { MapUtil } from "../Util/MapUtil";
import { Signal } from "../Util/Signal";

type TagSignal = Pick<Signal<[GameObject]>, "Connect" | "ConnectWithPriority" | "Once" | "Wait">;

@Singleton()
export class TagsSingleton {
	private tagManager!: TagManager;

	private tagAddedSignals = new Map<string, Signal<[GameObject]>>();
	private tagRemovedSignals = new Map<string, Signal<[GameObject]>>();

	protected OnStart(): void {
		const tagManager = TagManager.Instance;
		Airship.tags = this;
		this.tagManager = tagManager;

		tagManager.OnTagAdded((tag, gameObject) => {
			const signal = this.tagAddedSignals.get(tag);
			signal?.Fire(gameObject);
		});

		tagManager.OnTagRemoved((tag, gameObject) => {
			const signal = this.tagRemovedSignals.get(tag);
			signal?.Fire(gameObject);
		});
	}

	/**
	 * Adds a tag to a given GameObject
	 * @param gameObject The game object ot add the tag to
	 * @param tag The tag to add
	 */
	public AddTag(gameObject: GameObject, tag: string): void {
		this.tagManager.AddTag(gameObject, tag);
	}

	/**
	 * Check whether or not the game object has the given tag
	 * @param gameObject The game object to check the tag for
	 * @param tag The tag to check
	 * @returns True if the GameObject has the given tag
	 */
	public HasTag(gameObject: GameObject, tag: string): boolean {
		return this.tagManager.HasTag(gameObject, tag);
	}

	/**
	 * Removes a tag from the given GameObject
	 * @param gameObject The game object to remove the tag from
	 * @param tag The tag to remove
	 */
	public RemoveTag(gameObject: GameObject, tag: string): void {
		this.tagManager.RemoveTag(gameObject, tag);
	}

	/**
	 * Gets all tags applied to the given GameObject
	 * @param gameObject The GameObject to get the tags for
	 * @returns The tags attached to the GameObject
	 */
	public GetTags(gameObject: GameObject): ReadonlyArray<string> {
		const csTags = this.tagManager.GetAllTagsForGameObject(gameObject);
		const tags = CSArrayUtil.Convert(csTags);
		return tags;
	}

	/**
	 * Gets all game objects with the given tag
	 * @param tag The tag
	 * @returns The GameObjects with the given tag
	 */
	public GetTagged(tag: string): ReadonlyArray<GameObject> {
		const csGameObjects = this.tagManager.GetTagged(tag);
		const gameObjects = CSArrayUtil.Convert(csGameObjects);
		return gameObjects;
	}

	/**
	 * Gets all tags currently used within the game
	 * @returns The tags used in the game
	 */
	public GetAllTags(): ReadonlyArray<string> {
		const csTags = this.tagManager.GetAllTags();
		const tags = CSArrayUtil.Convert(csTags);
		return tags;
	}

	/**
	 * Gets a tag added signal for the given tag
	 * @param tag The tag
	 * @returns A tag added signal for the tag
	 */
	public OnTagAdded(tag: string): TagSignal {
		const tagSignal = MapUtil.GetOrCreate(this.tagAddedSignals, tag, () => new Signal<[GameObject]>());
		return tagSignal;
	}

	/**
	 * Gets a tag removed signal for the given tag
	 * @param tag The tag
	 * @returns A tag removed signal for the tag
	 */
	public OnTagRemoved(tag: string): TagSignal {
		const tagSignal = MapUtil.GetOrCreate(this.tagRemovedSignals, tag, () => new Signal<[GameObject]>());
		return tagSignal;
	}

	/**
	 * Observes game objects added/removed from a tag. The returned function can be used to stop observing
	 *
	 *
	 * The `observer` function is fired for every game object that is currently registered with this tag, as well as
	 * when new objects are added to this tag. The `observer` function can return a function which is called when the game object
	 * is removed from the tag.
	 *
	 * This may be preferred when you want to watch all the lifecycles of a tag and include existing tags as well.
	 *
	 * If you want the individual lifecycles of a tag see
	 * - {@link OnTagAdded} - for only when game objects are added to a tag
	 * - {@link OnTagRemoved} - for only when game objects are removed from a tag
	 *
	 * You can also use {@link GetTagged} for game objects currently tagged with the tag
	 *
	 * @param tag The tag to observe
	 * @param observer The observer function
	 */
	public ObserveTag(tag: string, observer: (gameObject: GameObject) => void | (() => void)) {
		const cleanupPerGo = new Map<GameObject, () => void>();

		const observe = (gameObject: GameObject) => {
			const cleanup = observer(gameObject);
			if (cleanup !== undefined) {
				cleanupPerGo.set(gameObject, cleanup);
			}
		};

		for (const tagged of this.GetTagged(tag)) {
			observe(tagged);
		}

		const stopTagAdded = this.OnTagAdded(tag).Connect((gameObject) => {
			observe(gameObject);
		});
		const stopTagRemoved = this.OnTagRemoved(tag).Connect((gameObject) => {
			const cleanup = cleanupPerGo.get(gameObject);
			if (cleanup !== undefined) {
				cleanup();
				cleanupPerGo.delete(gameObject);
			}
		});

		return () => {
			stopTagAdded();
			stopTagRemoved();
			for (const [go, cleanup] of cleanupPerGo) {
				cleanup();
			}
		};
	}
}
