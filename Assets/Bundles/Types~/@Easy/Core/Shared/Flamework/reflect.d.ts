/// <reference types="compiler-types" />
/// <reference types="compiler-types" />
import { Constructor } from "./Types/types";
/**
 * Reflection/metadata API
 */
export declare namespace Reflect {
    const metadata: WeakMap<object, Map<string | {
        _nominal_Marker: never;
    }, Map<string, unknown>>>;
    const decorators: Map<string, object[]>;
    const idToObj: Map<string, object>;
    const objToId: Map<object, string>;
    /**
     * Apply metadata onto this object.
     */
    function defineMetadata(obj: object, key: string, value: unknown, property?: string): void;
    /**
     * Apply metadata in batch onto this object.
     */
    function defineMetadataBatch(obj: object, list: {
        [key: string]: unknown;
    }, property?: string): void;
    /**
     * Delete metadata from this object.
     */
    function deleteMetadata(obj: object, key: string, property?: string): void;
    /**
     * Get metadata from this object.
     * Type parameter is an assertion.
     */
    function getOwnMetadata<T>(obj: object, key: string, property?: string): T | undefined;
    /**
     * Check if this object has the specified metadata key.
     */
    function hasOwnMetadata(obj: object, key: string, property?: string): boolean;
    /**
     * Retrieve all metadata keys for this object.
     */
    function getOwnMetadataKeys(obj: object, property?: string): string[];
    /**
     * Retrieves all properties (that contain metadata) on this object.
     */
    function getOwnProperties(obj: object): string[];
    /**
     * Retrieve all values for the specified key from the object and its parents.
     * Type parameter is an assertion.
     */
    function getMetadatas<T extends defined>(obj: object, key: string, property?: string): T[];
    /**
     * Get metadata from this object or its parents.
     * Type parameter is an assertion.
     */
    function getMetadata<T>(obj: object, key: string, property?: string): T | undefined;
    /**
     * Check if this object or any of its parents has the specified metadata key.
     */
    function hasMetadata(obj: object, key: string, property?: string): boolean;
    /**
     * Retrieve all metadata keys for this object and its parents.
     */
    function getMetadataKeys(obj: object, property?: string): string[];
    /**
     * Retrieves all properties (that contain metadata) on this object and its parents.
     */
    function getProperties(obj: object): string[];
    /** @hidden */
    function decorate<A extends readonly unknown[]>(object: Constructor, id: string, rawDecoration: {
        _flamework_Parameters: [...A];
    }, args: [...A], property?: string, isStatic?: boolean): void;
}
