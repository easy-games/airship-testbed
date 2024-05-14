import { Bin } from "./Bin";
import { SetUtil } from "./SetUtil";

export interface StatusModifierEntry {}

/**
 * A status modifier holds a list of modifiers for some properties. It takes a reducer
 * function that runs whenever this list changes (this is where you can calculate & apply changes).
 *
 * Ex: In a movement status modifier you might have a property blockSprint and in your reducer if any
 * modifier has blockSprint=true you would call SetSprintBlocked. This way you could have multiple sources
 * blocking sprint without overwriting eachother.
 */
export class StatusModifier<T extends StatusModifierEntry> {
	private modifiers: Set<T> = new Set();

	constructor(private reduce: (modifiers: T[], statusModifier: StatusModifier<T>) => void) {}

	/**
	 * Adds a modifier (this will run the reducer).
	 *
	 * @returns A Destroy function to remove the modifier. This can be passed to a Bin.
	 */
	public AddModifier(modifier: T) {
		const a = new Bin();
		this.modifiers.add(modifier);
		this.reduce(SetUtil.ToArray(this.modifiers), this);
		return {
			Destroy: () => {
				return this.RemoveModifier(modifier);
			},
		};
	}

	/**
	 * Removes a modfier. If it existed (and was removed) this will run the reducer. Returns true
	 * if the modifier was removed.
	 */
	public RemoveModifier(modifier: T): boolean {
		const wasRemoved = this.modifiers.delete(modifier);
		if (wasRemoved) {
			this.reduce(SetUtil.ToArray(this.modifiers), this);
		}
		return wasRemoved;
	}

	/** Can be used to manually rerun modifiers. Usually this will run when a modifier is added or removed. */
	public UpdateModifiers() {
		this.reduce(SetUtil.ToArray(this.modifiers), this);
	}

	/**
	 * Returns all active modifiers.
	 */
	public GetModifiers() {
		return this.modifiers;
	}

	/**
	 * Clears all modifiers (this will run the reducer).
	 */
	public Clear() {
		this.modifiers = new Set();
		this.reduce(SetUtil.ToArray(this.modifiers), this);
	}

	/**
	 * Overwrites the existing reducer and immediately runs the new reducer.
	 */
	public SetReducer(reduce: (modifiers: T[], statusModifier: StatusModifier<T>) => void) {
		this.reduce = reduce;
		this.reduce(SetUtil.ToArray(this.modifiers), this);
	}
}
