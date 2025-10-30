import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export default class ColorPicker extends AirshipBehaviour {
	@Header("References")
	public canvas: CanvasGroup;
	public closeBtn: Button;
	public colorImage: Image;
	public headerTxt: TextMeshProUGUI;
	public hexInput: TMP_InputField;
	public currentColorImg: Image;
	public initialColorBtn: Button;
	public hueSlide: Slider;
	public saturationSlide: Slider;
	public valueSlide: Slider;

	public OnNewColor = new Signal<Color>();

	private initialColor: Color;
	private currentColor: Color;
	private currentHvs: Vector3;

	private openBin = new Bin();
	private isOpen = false;
	private draggingColor = false;
	private canDragColor = true;

	protected Start(): void {
		if (Game.IsEditor()) {
			Airship.Input.OnDown(CoreAction.Interact).Connect(() => {
				if (this.gameObject.activeInHierarchy) {
					this.Open(new Color(0.5, 0, 0.5), "Test Color Picker");
				}
			});
		}
	}

	public Open(initialColor: Color, label: string | undefined) {
		if (label !== undefined) {
			this.headerTxt.text = label;
		}
		this.initialColor = initialColor;
		this.initialColorBtn.image.color = initialColor;
		this.SetColor(initialColor);

		if (this.isOpen) {
			return;
		}
		this.isOpen = true;

		NativeTween.LocalScale(this.transform, new Vector3(1.1, 1.1, 1.1), 0.1).SetEaseBackOut();
		NativeTween.CanvasGroupAlpha(this.canvas, 1, 0.1);
		this.canvas.interactable = true;
		this.canvas.blocksRaycasts = true;

		this.openBin.Add(
			Mouse.onMoved.Connect((mousePos) => {
				if (Mouse.isLeftDown) {
					if (!this.canDragColor) {
						return;
					}
					const [hit, localPoint] = RectTransformUtility.ScreenPointToLocalPointInRectangle(
						this.colorImage.rectTransform,
						mousePos,
					);
					if (hit) {
						// Normalize the local coordinates to UV (0–1)
						const rect = this.colorImage.rectTransform.rect;
						const uv = new Vector2(
							math.inverseLerp(rect.xMin, rect.xMax, localPoint.x),
							math.inverseLerp(rect.yMin, rect.yMax, localPoint.y),
						);

						//print("LocalImage hit uv: " + uv);
						//Check if the click is inside the RBG image
						if (!this.draggingColor && (uv.x <= 0 || uv.x >= 1 || uv.y <= 0 || uv.y >= 1)) {
							this.canDragColor;
							return;
						}
						this.draggingColor = true;
						this.SetColor(this.GetColorFromUV(uv));
					}
				} else {
					this.draggingColor = false;
					this.canDragColor = true;
				}
			}),
		);
		this.openBin.Add(
			this.closeBtn.onClick.Connect(() => {
				this.Close();
			}),
		);
		this.openBin.Add(
			this.initialColorBtn.onClick.Connect(() => {
				this.ResetToInitialColor();
			}),
		);
		this.openBin.Add(
			this.hueSlide.onValueChanged.Connect((newValue) => {
				this.currentHvs = this.currentHvs.WithX(newValue);
				this.SetHsvColor(this.currentHvs);
			}),
		);
		this.openBin.Add(
			this.saturationSlide.onValueChanged.Connect((newValue) => {
				this.currentHvs = this.currentHvs.WithY(newValue);
				this.SetHsvColor(this.currentHvs);
			}),
		);
		this.openBin.Add(
			this.valueSlide.onValueChanged.Connect((newValue) => {
				this.currentHvs = this.currentHvs.WithZ(newValue);
				this.SetHsvColor(this.currentHvs);
			}),
		);
		this.openBin.Add(
			this.hexInput.onValueChanged.Connect((newValue) => {
				this.SetColor(ColorUtil.HexToColor(newValue, 1));
			}),
		);
	}

	public Close() {
		if (!this.isOpen) {
			return;
		}
		this.isOpen = false;
		this.openBin.Clean();

		NativeTween.LocalScale(this.transform, new Vector3(0.9, 0.9, 0.9), 0.1).SetEaseBackOut();
		NativeTween.CanvasGroupAlpha(this.canvas, 0, 0.1);
		this.canvas.interactable = false;
		this.canvas.blocksRaycasts = false;
	}

	public SetColor(color: Color) {
		this.currentColor = color;
		this.currentColorImg.color = color;
		this.hexInput.SetTextWithoutNotify(ColorUtil.ColorToHex(color));
		this.currentHvs = ColorUtil.RgbToHsv(color);
		this.hueSlide.SetValueWithoutNotify(this.currentHvs.x);
		this.valueSlide.SetValueWithoutNotify(this.currentHvs.y);
		this.saturationSlide.SetValueWithoutNotify(this.currentHvs.z);

		this.OnNewColor.Fire(color);
	}

	public SetHsvColor(hsv: Vector3) {
		this.currentColor = ColorUtil.HsvToRgb(hsv);
		this.currentColorImg.color = this.currentColor;
		this.hexInput.SetTextWithoutNotify(ColorUtil.ColorToHex(this.currentColor));
		this.OnNewColor.Fire(this.currentColor);
	}

	public GetColor() {
		return this.currentColor;
	}

	public GetColorFromUV(uv: Vector2) {
		const hue = math.clamp01(uv.x);
		const value = math.clamp01(uv.y);
		const saturation = 1 - (value * 2 - 1);
		return ColorUtil.HsvToRgb(new Vector3(hue, saturation, value));
	}

	private ResetToInitialColor() {
		this.SetColor(this.initialColor);
	}
}
