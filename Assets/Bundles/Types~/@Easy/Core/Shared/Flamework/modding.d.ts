/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
import { Constructor } from "./Types/types";
interface BaseDescriptor {
    /**
     * The ID of this decorator.
     */
    id: string;
    /**
     * The constructor this decorator is attached to.
     */
    object: Constructor;
}
export interface ClassDescriptor extends BaseDescriptor {
}
export interface MethodDescriptor extends PropertyDescriptor {
}
export interface PropertyDescriptor extends BaseDescriptor {
    property: string;
    isStatic: boolean;
}
interface AttachedDecorator<T extends readonly unknown[]> {
    object: Constructor;
    arguments: T;
}
type TSDecorator<T> = T & {
    _flamework_Decorator: never;
};
type ClassDecorator = TSDecorator<(ctor: defined) => never>;
type MethodDecorator = TSDecorator<(target: defined, propertyKey: string, descriptor: defined) => never>;
type PropertyDecorator = TSDecorator<(target: defined, propertyKey: string) => never>;
type DecoratorWithMetadata<T, P> = T & {
    _flamework_Parameters: P;
};
type DecoratorParameters<T> = T extends {
    _flamework_Parameters: infer P;
} ? P : [];
type AnyDecorator = DecoratorWithMetadata<(...args: never[]) => unknown, unknown[]>;
type Decorator<P extends readonly unknown[], D> = DecoratorWithMetadata<P extends {
    length: 0;
} ? ((...args: P) => D) & D : (...args: P) => D, P>;
type DependencyRegistration = object | ((ctor: Constructor) => object);
export declare namespace Modding {
    /**
     * Registers a listener for lifecycle events.
     */
    export function addListener(object: object): void;
    /**
     * Removes a listener for lifecycle events and decorators.
     */
    export function removeListener(object: object): void;
    /**
     * Registers a listener added event.
     * Fires whenever any listener is added.
     *
     * Fires for all existing listeners.
     */
    /**
     * Registers a listener added event.
     * Fires whenever a listener has a decorator with the specified ID.
     *
     * Fires for all existing listeners.
     */
    /**
     * Registers a listener added event.
     * Fires whenever a listener has a lifecycle event with the specified ID.
     *
     * Fires for all existing listeners.
     */
    /**
     * Registers a listener added event.
     */
    /**
     * Registers a listener removed event.
     *
     * Fires whenever any listener is removed.
     */
    /**
     * Registers a listener removed event.
     *
     * Fires whenever a listener has a decorator with the specified ID.
     */
    /**
     * Registers a listener removed event.
     *
     * Fires whenever a listener has a lifecycle event with the specified ID.
     */
    /**
     * Registers a listener removed event.
     */
    /**
     * Registers a class decorator.
     */
    export function createDecorator<T extends readonly unknown[] = void[]>(kind: "Class", func: (descriptor: ClassDescriptor, config: T) => void): Decorator<T, ClassDecorator>;
    /**
     * Registers a method decorator.
     */
    export function createDecorator<T extends readonly unknown[] = void[]>(kind: "Method", func: (descriptor: MethodDescriptor, config: T) => void): Decorator<T, MethodDecorator>;
    /**
     * Registers a property decorator.
     */
    export function createDecorator<T extends readonly unknown[] = void[]>(kind: "Property", func: (descriptor: PropertyDescriptor, config: T) => void): Decorator<T, PropertyDecorator>;
    /**
     * Registers a metadata class decorator.
     */
    export function createMetaDecorator<T extends readonly unknown[] = void[]>(kind: "Class"): Decorator<T, ClassDecorator>;
    /**
     * Registers a metadata method decorator.
     */
    export function createMetaDecorator<T extends readonly unknown[] = void[]>(kind: "Method"): Decorator<T, MethodDecorator>;
    /**
     * Registers a metadata property decorator.
     */
    export function createMetaDecorator<T extends readonly unknown[] = void[]>(kind: "Property"): Decorator<T, PropertyDecorator>;
    /**
     * Retrieves registered decorators.
     */
    export function getDecorators<T extends AnyDecorator>(id?: string): AttachedDecorator<DecoratorParameters<T>>[];
    /**
     * Creates a map of every property using the specified decorator.
     */
    export function getPropertyDecorators<T extends AnyDecorator>(obj: object, id?: string): Map<string, {
        arguments: DecoratorParameters<T>;
    }>;
    /**
     * Retrieves a decorator from an object or its properties.
     */
    export function getDecorator<T extends AnyDecorator>(object: object, property?: string, id?: string): {
        arguments: DecoratorParameters<T>;
    } | undefined;
    /**
     * Retrieves a singleton or instantiates one if it does not exist.
     */
    export function resolveSingleton<T extends object>(ctor: Constructor<T>): {} | null;
    /** @internal Used for bootstrapping */
    export function getSingletons(): Map<Constructor, unknown>;
    /**
     * Modifies dependency resolution for a specific ID.
     *
     * If a function is passed, it will be called, passing the target constructor, every time that ID needs to be resolved.
     * Otherwise, the passed object is returned directly.
     */
    export function registerDependency<T>(dependency: DependencyRegistration, id?: string): void;
    /**
     * Instantiates this class using dependency injection.
     */
    export function createDependency<T extends object>(ctor: Constructor<T>, options?: DependencyResolutionOptions): T;
    /**
     * Creates an object for this class and returns a deferred constructor.
     */
    export function createDeferredDependency<T extends object>(ctor: Constructor<T>, options?: DependencyResolutionOptions): readonly [T, () => void];
    /**
     * Dependency resolution logic.
     * @internal
     */
    export function resolveDependency(ctor: Constructor, dependencyId: string, index: number, options: DependencyResolutionOptions): {} | null;
    /**
     * @hidden
     * @deprecated
     */
    export type Generic<T, M extends keyof GenericMetadata<T>> = Pick<GenericMetadata<T>, M> & {
        /** @hidden */ _flamework_macro_generic: [T, {
            [k in M]: k;
        }];
    };
    export type Caller<M extends keyof CallerMetadata> = Pick<CallerMetadata, M> & {
        /** @hidden */ _flamework_macro_caller: {
            [k in M]: k;
        };
    };
    interface CallerMetadata {
        /**
         * The starting line of the expression.
         */
        line: number;
        /**
         * The char at the start of the expression relative to the starting line.
         */
        character: number;
        /**
         * The width of the expression.
         * This includes the width of multiline statements.
         */
        width: number;
        /**
         * A unique identifier that can be used to identify exact callsites.
         * This can be used for hooks.
         */
        uuid: string;
        /**
         * The source text for the expression.
         */
        text: string;
    }
    interface GenericMetadata<T> {
        /**
         * The ID of the type.
         */
        id: string;
        /**
         * A string equivalent of the type.
         */
        text: string;
    }
    export {};
}
interface DependencyResolutionOptions {
    /**
     * Fires whenever a dependency is attempting to be resolved.
     *
     * Return undefined to let Flamework resolve it.
     */
    handle?: (id: string, index: number) => unknown;
    /**
     * Fires whenever Flamework tries to resolve a primitive (e.g string)
     */
    handlePrimitive?: (id: string, index: number) => defined;
}
export {};
