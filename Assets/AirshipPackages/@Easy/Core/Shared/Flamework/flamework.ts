/* eslint-disable no-inner-declarations */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-namespace */
import { Modding } from "./modding";
import { Reflect } from "./reflect";
import { Constructor } from "./Types/types";

// cache bridge crossings
const isClient = RunCore.IsClient();
const isServer = RunCore.IsServer();

/**
 * Dependency Injection Framework for Airship
 */
export namespace Flamework {
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

	export const flameworkConfig: FlameworkConfig = {
		isDefault: true,
	};
	export let isInitialized = false;

	/** @hidden */
	export function resolveDependency(id: string) {
		return Modding.resolveDependency(ArtificialDependency, id, 0, {});
	}

	/** @hidden */
	export function AddPath(path: string, searchPattern?: string, ignorePattern?: string) {
		const preloadPaths: string[] = [];

		const files = EasyFileService.GetFilesInPath(path, searchPattern);
		for (let i = 0; i < files.Length; i++) {
			let filePath = files.GetValue(i);
			if (ignorePattern !== undefined) {
				let res = string.match(filePath.lower(), ignorePattern);
				if (res[0]) {
					continue;
				}
			}
			filePath = filePath.split("assets/bundles/")[1];
			filePath = filePath.split(".lua")[0];
			preloadPaths.push(filePath);
		}

		const preload = (path: string) => {
			const start = os.clock();
			const [success, value] = pcall(require, path);
			const endTime = math.floor((os.clock() - start) * 1000);
			if (!success) {
				throw `${path} failed to preload (${endTime}ms): ${value}`;
			}
		};

		for (const path of preloadPaths) {
			preload(path);
		}
	}

	/** @hidden */
	export function _implements<T>(object: unknown, id: string): object is T {
		return Reflect.getMetadatas<string[]>(object as object, "flamework:implements").some((impl) =>
			impl.includes(id),
		);
	}

	function isSingleton(ctor: object) {
		return Modding.getDecorator<typeof Singleton>(ctor) !== undefined;
	}

	function isService(ctor: object) {
		return Modding.getDecorator<typeof Service>(ctor) !== undefined;
	}

	function isController(ctor: object) {
		return Modding.getDecorator<typeof Controller>(ctor) !== undefined;
	}

	function isConstructor(obj: object): obj is Constructor {
		return "new" in obj && "constructor" in obj;
	}

	function getIdentifier(obj: object, suffix = ""): string {
		return Reflect.getMetadata<string>(obj, "identifier") ?? `UnidentifiedFlameworkListener${suffix}`;
	}

	const externalClasses = new Set<Constructor>();

	/**
	 * Allow an external module to be bootstrapped by Flamework.ignite()
	 */
	export function registerExternalClass(ctor: Constructor) {
		externalClasses.add(ctor);
	}

	type LoadableConfigs = ServiceConfig | ControllerConfig;
	let hasFlameworkIgnited = false;
	let startedIdentifiers = new Set<string>();

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
	export function Ignite(patchedConfig?: Partial<FlameworkConfig>) {
		// if (hasFlameworkIgnited) throw "Flamework.ignite() should only be called once";
		// hasFlameworkIgnited = true;

		if (patchedConfig) {
			for (const [key, value] of pairs(patchedConfig)) {
				flameworkConfig[key as never] = value as never;
			}
		}

		for (const [ctor] of Reflect.objToId) {
			let allowed = false;
			if (isService(ctor) && isServer) {
				allowed = true;
			} else if (isController(ctor) && isClient) {
				allowed = true;
			} else if (isSingleton(ctor)) {
				allowed = true;
			}

			if (!allowed) continue;
			if (!isConstructor(ctor)) continue;

			const isPatched = Reflect.getOwnMetadata<boolean>(ctor, "flamework:isPatched");
			if (flameworkConfig.loadOverride && !flameworkConfig.loadOverride.includes(ctor) && !isPatched) continue;

			const isExternal = Reflect.getOwnMetadata<boolean>(ctor, "flamework:isExternal");
			if (isExternal && !externalClasses.has(ctor as Constructor)) continue;

			Modding.resolveSingleton(ctor);
		}

		const dependencies = new Array<[unknown, LoadableConfigs]>();

		for (let decoratorType of [
			Flamework.id<typeof Service>(),
			Flamework.id<typeof Controller>(),
			Flamework.id<typeof Singleton>(),
		]) {
			for (const [ctor] of Modding.getSingletons()) {
				const decorator = Modding.getDecorator<typeof Service | typeof Controller | typeof Singleton>(
					ctor,
					undefined,
					decoratorType,
				);
				if (!decorator) continue;

				const isExternal = Reflect.getOwnMetadata<boolean>(ctor, "flamework:isExternal");
				if (isExternal && !externalClasses.has(ctor as Constructor)) continue;

				const dependency = Modding.resolveSingleton(ctor);
				dependencies.push([dependency, decorator.arguments[0] || {}]);
			}
		}

		const start = new Map<OnStart, string>();
		const init = new Map<OnInit, string>();

		const tick = new Map<OnTick, string>();
		const render = new Map<OnRender, string>();
		const physics = new Map<OnPhysics, string>();

		dependencies.sort(([, a], [, b]) => (a.loadOrder ?? 1) < (b.loadOrder ?? 1));

		for (const [dependency] of dependencies) {
			if (Flamework.implements<OnInit>(dependency)) init.set(dependency, getIdentifier(dependency));
			if (Flamework.implements<OnStart>(dependency)) start.set(dependency, getIdentifier(dependency));
		}

		for (const [dependency, identifier] of init) {
			if (startedIdentifiers.has(identifier)) continue;
			// debug.setmemorycategory(identifier);
			const initResult = dependency.OnInit();
			if (Promise.is(initResult)) {
				const [status, value] = initResult.awaitStatus();
				if (status === Promise.Status.Rejected) {
					throw `OnInit failed for dependency '${identifier}'. ${tostring(value)}`;
				}
			}
			// debug.resetmemorycategory();
		}

		isInitialized = true;

		for (const [dependency, identifier] of start) {
			if (startedIdentifiers.has(identifier)) continue;
			startedIdentifiers.add(identifier);
			coroutine.wrap(() => {
				dependency.OnStart();
			})();
		}

		return dependencies;
	}

	/**
	 * Preload the specified paths by requiring all ModuleScript descendants.
	 */
	// export declare function addPaths(...args: string[]): void;

	/**
	 * Retrieve the identifier for the specified type.
	 */
	export declare function id<T>(): string;

	/**
	 * Check if the constructor implements the specified interface.
	 */
	export declare function implements<T>(object: Constructor): boolean;

	/**
	 * Check if object implements the specified interface.
	 */
	export declare function implements<T>(object: unknown): object is T;

	/**
	 * Hash a function using the method used internally by Flamework.
	 * If a context is provided, then Flamework will create a new hash
	 * if the specified string does not have one in that context.
	 * @param str The string to hash
	 * @param context A scope for the hash
	 */
	export declare function hash(str: string, context?: string): string;
}

/**
 * An internal class used for resolving the Dependency<T> macro.
 */
class ArtificialDependency {}
Reflect.defineMetadata(ArtificialDependency, "identifier", Flamework.id<ArtificialDependency>());
Reflect.defineMetadata(ArtificialDependency, "flamework:isArtificial", true);

export declare function Dependency<T>(): T;
export declare function Dependency<T>(ctor: Constructor<T>): T;
export declare function Dependency<T>(ctor?: Constructor<T>): T;

/**
 * Register a class as a Service.
 *
 * @server
 * @metadata flamework:implements flamework:parameters
 */
export const Service = Modding.createMetaDecorator<[opts?: Flamework.ServiceConfig]>("Class");

/**
 * Register a class as a Controller.
 *
 * @client
 * @metadata flamework:implements flamework:parameters
 */
export const Controller = Modding.createMetaDecorator<[opts?: Flamework.ControllerConfig]>("Class");

/**
 * Register a class as a singleton.
 *
 * @client @server
 * @metadata flamework:implements flamework:parameters
 */
export const Singleton = Modding.createMetaDecorator<[opts?: Flamework.SingletonConfig]>("Class");

/**
 * Marks this class as an external class.
 *
 * External classes are designed for packages and won't be
 * bootstrapped unless explicitly specified. Excluding this
 * inside of a package will make the class load as long as
 * it has been loaded.
 */
export const External = Modding.createDecorator("Class", (descriptor) => {
	Reflect.defineMetadata(descriptor.object, `flamework:isExternal`, true);
});

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
