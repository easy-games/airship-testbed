export default class AirshipInventoryTile extends AirshipBehaviour {
	@Header("References")
	public itemImage!: Image;
	public itemAmount!: TMP_Text;
	public itemName!: TMP_Text;
	public button!: Button;
	@Tooltip("Only used in hotbar")
	public slotNumberText?: TMP_Text;
}
