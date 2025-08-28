/**
 * Server directive
 */
declare const $SERVER: boolean;

/**
 * Client directive
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
