/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
import { OnStart } from "../Flamework";
import { Signal } from "../Util/Signal";
type TagSignal = Pick<Signal<[GameObject]>, "Connect" | "ConnectWithPriority" | "Once" | "Wait">;
export declare class TagsSingleton implements OnStart {
    private tagManager;
    private tagAddedSignals;
    private tagRemovedSignals;
    OnStart(): void;
    /**
     * Adds a tag to a given GameObject
     * @param gameObject The game object ot add the tag to
     * @param tag The tag to add
     */
    AddTag(gameObject: GameObject, tag: string): void;
    /**
     * Check whether or not the game object has the given tag
     * @param gameObject The game object to check the tag for
     * @param tag The tag to check
     * @returns True if the GameObject has the given tag
     */
    HasTag(gameObject: GameObject, tag: string): boolean;
    /**
     * Removes a tag from the given GameObject
     * @param gameObject The game object to remove the tag from
     * @param tag The tag to remove
     */
    RemoveTag(gameObject: GameObject, tag: string): void;
    /**
     * Gets all tags applied to the given GameObject
     * @param gameObject The GameObject to get the tags for
     * @returns The tags attached to the GameObject
     */
    GetTags(gameObject: GameObject): ReadonlyArray<string>;
    /**
     * Gets all game objects with the given tag
     * @param tag The tag
     * @returns The GameObjects with the given tag
     */
    GetTagged(tag: string): ReadonlyArray<GameObject>;
    /**
     * Gets all tags currently used within the game
     * @returns The tags used in the game
     */
    GetAllTags(): ReadonlyArray<string>;
    /**
     * Gets a tag added signal for the given tag
     * @param tag The tag
     * @returns A tag added signal for the tag
     */
    OnTagAdded(tag: string): TagSignal;
    /**
     * Gets a tag removed signal for the given tag
     * @param tag The tag
     * @returns A tag removed signal for the tag
     */
    OnTagRemoved(tag: string): TagSignal;
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
    ObserveTag(tag: string, observer: (gameObject: GameObject) => void | (() => void)): () => void;
}
export {};
