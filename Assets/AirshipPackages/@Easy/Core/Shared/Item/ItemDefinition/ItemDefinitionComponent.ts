export default class ItemDefinitionComponent extends AirshipBehaviour {
	/**
	 * Runtime ID. This may change between sessions.
	 * For a consistent ID, you should use {@link itemType}.
	 */
	@HideInInspector()
	public id = -1;

	@Header("Inventory Item")
	//Identification
	public displayName = "Default Item";
	public itemType = "";
	public thumbnailImage?: Texture2D;
	public maxStackSize?: number = -1;
}
