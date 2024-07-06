/**
 * A TypeScript parallel to a component Singleton for Airship - no boilerplate required
 *
 * - To expose the serializable properties to the inspector, it must be exported as `default`.
 *
 * Example declaration:
 * ```ts
 * export default class ExampleSingleton extends AirshipSingleton {
 * 	public PrintHelloWorld() {
 * 		print("Hello, World!");
 * 	}
 * }
 * ```
 * 
 * The singleton can then be retrieved via 
 * ```ts
 * import ExampleSingleton from "./ExampleSingleton";
 * export default class SomeRequiringComponent extends AirshipBehaviour {
 *		public Start() {
 *			const exampleSingleton = ExampleSingleton.Get();
 *			exampleSingleton.PrintHelloWorld();
 *		}
 * }
 * ```
 */
declare abstract class AirshipSingleton extends AirshipBehaviour {
	/**
	 * Resolves a single instance of this Singleton object statically
	 */
	public static Get<TThis>(this: TThis): TThis["prototype"];
}
