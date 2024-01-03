/// <reference types="@easy-games/types" />
/// <reference types="@easy-games/types" />
import { Entity } from "../Entity/Entity";
import { ItemDef } from "../Item/ItemDefinitionTypes";
import { ItemType } from "../Item/ItemType";
export declare class BlockPlaceSignal {
    readonly pos: Vector3;
    readonly itemType: ItemType;
    readonly blockId: string;
    /** Will always be undefined on client. */
    readonly entity?: Entity | undefined;
    readonly itemMeta: ItemDef;
    constructor(pos: Vector3, itemType: ItemType, blockId: string, 
    /** Will always be undefined on client. */
    entity?: Entity | undefined);
}
export declare class BlockGroupPlaceSignal {
    readonly positions: Vector3[];
    readonly itemTypes: ItemType[];
    readonly blockIds: string[];
    /** Will always be undefined on client. */
    readonly entity?: Entity | undefined;
    constructor(positions: Vector3[], itemTypes: ItemType[], blockIds: string[], 
    /** Will always be undefined on client. */
    entity?: Entity | undefined);
}
