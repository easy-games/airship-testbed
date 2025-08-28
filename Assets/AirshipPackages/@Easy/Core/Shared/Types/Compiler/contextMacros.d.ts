/**
 * A special macro that will make a block of code server-only, stripping it from client code.
 *
 * Can only be used within an _if statement_ - e.g.
 * ```ts
 * if ($SERVER) {
 *      print("I only print on the server!");
 * }
 * ```
 *
 * To mark a whole method as server-only, see {@link Server}.
 */
declare const $SERVER: boolean;

/**
 * A special macro that will make a block of code client-only, stripping it from server code.
 *
 * Can only be used within an _if statement_ - e.g.
 * ```ts
 * if ($CLIENT) {
 *      print("I only print on the client!");
 * }
 * ```
 *
 * To mark a whole method as client-only, see {@link Client}.
 */
declare const $CLIENT: boolean;

/**
 * When used on a method, will mark the method as server-only and will be stripped from the client
 */
declare const Server: AirshipBehaviourMethodDecorator<[]>;
/**
 * When used on a method, will mark the method as client-only
 */
declare const Client: AirshipBehaviourMethodDecorator<[]>;
