/// <reference types="compiler-types" />
export default class ItemDefinitionComponent extends AirshipBehaviour {
    /**
     * Runtime ID. This may change between sessions.
     * For a consistent ID, you should use {@link itemType}.
     */
    id: number;
    displayName: string;
    itemType: string;
    thumbnailImage?: Texture2D;
    maxStackSize?: number;
}
