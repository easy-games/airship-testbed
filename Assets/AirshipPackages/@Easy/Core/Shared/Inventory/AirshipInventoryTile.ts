import { Signal } from "../Util/Signal";
import { ItemStack } from "./ItemStack";

export default class AirshipInventoryTile extends AirshipBehaviour {
	@Header("References")
	public itemImage!: Image;
	public itemAmount!: TMP_Text;
	public itemName!: TMP_Text;
	public button!: Button;
	@Tooltip("Only used in hotbar")
	public slotNumberText?: TMP_Text;

	@NonSerialized()
	public itemStack: ItemStack | undefined;

	@NonSerialized()
	public onItemStackChanged = new Signal<ItemStack | undefined>();

	public SetItemStack(itemStack: ItemStack | undefined): void {
		this.itemStack = itemStack;
		this.onItemStackChanged.Fire(itemStack);
	}
}
