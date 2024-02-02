/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
/// <reference types="@easy-games/compiler-types" />
import { Constructor } from "./Types/types";
export declare namespace Flamework {
    export interface ServiceConfig {
        loadOrder?: number;
    }
    export interface SingletonConfig {
        loadOrder?: number;
    }
    export interface ControllerConfig {
        loadOrder?: number;
    }
    export interface Decorator {
        arguments: unknown[];
    }
    export interface FlameworkConfig {
        isDefault: boolean;
        loadOverride?: Constructor<unknown>[];
    }
    export const flameworkConfig: FlameworkConfig;
    export let isInitialized: boolean;
    /** @hidden */
    export function resolveDependency(id: string): {} | null;
    /** @hidden */
    export function AddPath(path: string, searchPattern?: string): void;
    /** @hidden */
    export function _implements<T>(object: unknown, id: string): object is T;
    /**
     * Allow an external module to be bootstrapped by Flamework.ignite()
     */
    export function registerExternalClass(ctor: Constructor): void;
    type LoadableConfigs = ServiceConfig | ControllerConfig;
    /**
     * Initialize Flamework.
     *
     * This will start up the lifecycle events on all currently registered
     * classes.
     *
     * You should preload all necessary directories before calling this
     * as newly registered classes will not run their lifecycle events.
     *
     * @returns All the dependencies that have been loaded.
     */
    export function Ignite(patchedConfig?: Partial<FlameworkConfig>): [unknown, LoadableConfigs][];
    /**
     * Preload the specified paths by requiring all ModuleScript descendants.
     */
    /**
     * Retrieve the identifier for the specified type.
     */
    export function id<T>(): string;
    /**
     * Check if the constructor implements the specified interface.
     */
    export function implements<T>(object: Constructor): boolean;
    /**
     * Check if object implements the specified interface.
     */
    export function implements<T>(object: unknown): object is T;
    /**
     * Hash a function using the method used internally by Flamework.
     * If a context is provided, then Flamework will create a new hash
     * if the specified string does not have one in that context.
     * @param str The string to hash
     * @param context A scope for the hash
     */
    export function hash(str: string, context?: string): string;
    /**
     * Utility for use in test suites, not recommended for anything else.
     */
    export namespace Testing {
        function patchDependency<T>(patchedClass: Constructor<unknown>, id?: string): void;
    }
    export {};
}
export declare function Dependency<T>(): T;
export declare function Dependency<T>(ctor: Constructor<T>): T;
export declare function Dependency<T>(ctor?: Constructor<T>): T;
/**
 * Register a class as a Service.
 *
 * @server
 * @metadata flamework:implements flamework:parameters
 */
export declare const Service: ((opts?: Flamework.ServiceConfig | undefined) => ((ctor: defined) => never) & {
    _flamework_Decorator: never;
}) & {
    _flamework_Parameters: [opts?: Flamework.ServiceConfig | undefined];
};
/**
 * Register a class as a Controller.
 *
 * @client
 * @metadata flamework:implements flamework:parameters
 */
export declare const Controller: ((opts?: Flamework.ControllerConfig | undefined) => ((ctor: defined) => never) & {
    _flamework_Decorator: never;
}) & {
    _flamework_Parameters: [opts?: Flamework.ControllerConfig | undefined];
};
/**
 * Register a class as a singleton.
 *
 * @client @server
 * @metadata flamework:implements flamework:parameters
 */
export declare const Singleton: ((opts?: Flamework.SingletonConfig | undefined) => ((ctor: defined) => never) & {
    _flamework_Decorator: never;
}) & {
    _flamework_Parameters: [opts?: Flamework.SingletonConfig | undefined];
};
/**
 * Marks this class as an external class.
 *
 * External classes are designed for packages and won't be
 * bootstrapped unless explicitly specified. Excluding this
 * inside of a package will make the class load as long as
 * it has been loaded.
 */
export declare const External: ((...args: void[]) => ((ctor: defined) => never) & {
    _flamework_Decorator: never;
}) & {
    _flamework_Parameters: void[];
};
/**
 * Hook into the OnInit lifecycle event.
 */
export interface OnInit {
    /**
     * This function will be called whenever the game is starting up.
     * This should only be used to setup your object prior to other objects using it.
     *
     * It's safe to load dependencies here, but it is not safe to use them.
     * Yielding or returning a promise will delay initialization of other dependencies.
     *
     * @hideinherited
     */
    OnInit(): void | Promise<void>;
}
/**
 * Hook into the OnStart lifecycle event.
 */
export interface OnStart {
    /**
     * This function will be called after the game has been initialized.
     * This function will be called asynchronously.
     *
     * @hideinherited
     */
    OnStart(): void;
}
/**
 * Hook into the OnTick lifecycle event.
 * Equivalent to: RunCore.Heartbeat
 */
export interface OnTick {
    /**
     * Called every frame, after physics.
     *
     * @hideinherited
     */
    OnTick(dt: number): void;
}
/**
 * Hook into the OnPhysics lifecycle event.
 * Equivalent to: RunCore.Stepped
 */
export interface OnPhysics {
    /**
     * Called every frame, before physics.
     *
     * @hideinherited
     */
    OnPhysics(dt: number, time: number): void;
}
/**
 * Hook into the OnRender lifecycle event.
 * Equivalent to: RunCore.RenderStepped
 *
 * @client
 */
export interface OnRender {
    /**
     * Called every frame, before rendering.
     * Only available for controllers.
     *
     * @hideinherited
     */
    OnRender(dt: number): void;
}
