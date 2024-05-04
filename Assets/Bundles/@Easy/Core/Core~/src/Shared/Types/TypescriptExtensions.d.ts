/**
 * Get the instance value of a class object
 *
 * e.g. `InstanceOf<typeof Class>` will give you `Class`.
 */
type InstanceOf<T extends ClassLike> = T extends { prototype: infer TProto } ? TProto : never;

/**
 * Any class-like object
 */
type ClassLike = { prototype: object };

/**
 * A class of the given `T` - does not require a constructor like `new() => T`
 *
 * - If you want a _constructable_ check - use `new () => T`, abstract type is `abstract new() => T`
 */
type ClassOf<T extends object> = { prototype: T };
