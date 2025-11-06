import AvatarCustomizationBtn from "./AvatarCustomizationBtn";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export default class AvatarCustomizationOption_Variant extends AirshipBehaviour {
	@Header("Templates")
	public variantBtnTemplate: GameObject;

	@Header("References")
	public btnHolder: Transform;

	public OnSelect = new Signal<[varientIndex: number]>();

	private currentVariant: number = 0;
	private bin = new Bin();
	private currentBtns: AvatarCustomizationBtn[] = [];

	public Init(currentVariantI: number, numberOfVariants: number): void {
		this.bin.Clean();
		this.currentVariant = currentVariantI;

		//Set the active color
		this.SetVariant(currentVariantI);

		//Create the grid of color options
		this.CreateButtons(numberOfVariants);
	}

	protected OnDestroy(): void {
		this.bin.Clean();
	}

	private CreateButtons(numberOfVariants: number) {
		//Destroy old options
		for (const childT of this.btnHolder) {
			Destroy(childT.gameObject);
		}
		this.currentBtns.clear();

		//Create new options
		for (let i = 0; i < numberOfVariants; i++) {
			const index = i;
			this.currentBtns.push(this.CreateBtn(index));
		}
	}

	private CreateBtn(index: number) {
		let btn = Instantiate(
			this.variantBtnTemplate,
			this.btnHolder,
		).gameObject.GetAirshipComponent<AvatarCustomizationBtn>();
		if (!btn) {
			error("Color Btn Template must have an AvatarCustomizationBtn component on it");
		}
		btn.image.color = new Color(0.6, 0.6, 0.6, 1);
		btn.txt.text = "" + index;
		this.bin.Add(
			btn.btn.onClick.Connect(() => {
				this.OnSelect.Fire(index);
				this.SetVariant(index);
			}),
		);
		return btn;
	}

	private SetVariant(index: number) {
		this.currentVariant = index;
		for (let i = 0; i < this.currentBtns.size(); i++) {
			this.currentBtns[i].image.color = i === index ? Color.white : new Color(0.6, 0.6, 0.6, 1);
		}
	}
}
