import { Airship } from "@Easy/Core/Shared/Airship";
import { Game } from "@Easy/Core/Shared/Game";
import { CoreAction } from "@Easy/Core/Shared/Input/AirshipCoreAction";
import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { CanvasAPI } from "@Easy/Core/Shared/Util/CanvasAPI";
import { ColorUtil } from "@Easy/Core/Shared/Util/ColorUtil";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

export default class ColorPicker extends AirshipBehaviour {
	@Header("References")
	public canvas: CanvasGroup;
	public closeBtn: Button;
	public colorImage: Image;
	public colorImageHue: Image;
	public colorImageCursor: RectTransform;
	public headerTxt: TextMeshProUGUI;
	public hexInput: TMP_InputField;
	public currentColorImg: Image;
	public initialColorBtn: Button;
	public hueSlide: Slider;
	public saturationSlide: Slider;
	public valueSlide: Slider;

	@Header("Variables")
	public useHSVImage = false;

	public OnNewColor = new Signal<[color: Color, hex: string]>();
	public OnClose = new Signal();

	private initialColor: Color;
	private currentColor: Color;
	private currentHvs: Vector3 = Vector3.zero;

	private openBin = new Bin();
	private isOpen = false;
	private draggingColor = false;
	private canDragColor = true;
	private currentColorHex = "#FFFFFF";

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
		this.currentColor = initialColor;
		this.currentHvs = ColorUtil.RgbToHsv(initialColor);
		this.initialColorBtn.image.color = initialColor;
		this.SetColor(initialColor);

		this.colorImage.gameObject.SetActive(this.useHSVImage);
		this.colorImageHue.gameObject.SetActive(!this.useHSVImage);

		if (this.isOpen) {
			return;
		}
		this.isOpen = true;

		NativeTween.LocalScale(this.transform, new Vector3(1, 1, 1), 0.1).SetEaseBackOut();
		NativeTween.CanvasGroupAlpha(this.canvas, 1, 0.1).SetEaseBackOut();
		this.canvas.interactable = true;
		this.canvas.blocksRaycasts = true;

		if (!Game.IsMobile()) {
			this.openBin.Add(
				Mouse.onMoved.Connect((mousePos) => {
					if (Mouse.isLeftDown) {
						this.SelectRBG(mousePos);
					} else {
						this.DeselectRBG();
					}
				}),
			);
		}
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

	protected Update(dt: number): void {
		if (Game.IsMobile()) {
			if (Input.touchCount > 0) {
				const touch = Input.GetTouch(0);
				if (touch.phase === TouchPhase.Began || touch.phase === TouchPhase.Moved) {
					this.SelectRBG(touch.position);
				} else {
					this.DeselectRBG();
				}
			}
		}
	}

	private SelectRBG(screenPosition: Vector2) {
		if (!this.canDragColor) {
			return;
		}
		const [hit, localPoint] = RectTransformUtility.ScreenPointToLocalPointInRectangle(
			this.colorImage.rectTransform,
			screenPosition,
		);
		if (hit) {
			// Normalize the local coordinates to UV (0–1)
			const rect = this.colorImage.rectTransform.rect;
			const uv = new Vector2(
				math.inverseLerp(rect.xMin, rect.xMax, localPoint.x),
				math.inverseLerp(rect.yMin, rect.yMax, localPoint.y),
			);

			// Check if the click is inside the RBG image
			if (uv.x <= 0 || uv.x >= 1 || uv.y <= 0 || uv.y >= 1) {
				if (!this.draggingColor) {
					this.canDragColor = false;
					return;
				}
			} else {
				this.colorImageCursor.position = new Vector3(screenPosition.x, screenPosition.y, 0);
			}
			this.draggingColor = true;
			this.SetColor(this.GetColorFromUV(uv));
		}
	}

	private DeselectRBG() {
		this.draggingColor = false;
		this.canDragColor = true;
	}

	public Close() {
		if (!this.isOpen) {
			return;
		}
		this.isOpen = false;
		this.openBin.Clean();

		NativeTween.LocalScale(this.transform, new Vector3(0.8, 0.8, 0.8), 0.1).SetEaseBackOut();
		NativeTween.CanvasGroupAlpha(this.canvas, 0, 0.1).SetEaseBackOut();
		this.canvas.interactable = false;
		this.canvas.blocksRaycasts = false;
	}

	public SetColor(color: Color) {
		this.currentColor = color;
		this.currentColorImg.color = color;
		this.currentColorHex = ColorUtil.ColorToHex(color);
		this.hexInput.SetTextWithoutNotify(this.currentColorHex);
		const targetHsv = ColorUtil.RgbToHsv(color);
		this.currentHvs = targetHsv.WithX(this.currentHvs.x);
		this.colorImageHue.material.SetFloat("_Hue", this.currentHvs.x);
		this.hueSlide.SetValueWithoutNotify(this.currentHvs.x);
		this.valueSlide.SetValueWithoutNotify(this.currentHvs.y);
		this.saturationSlide.SetValueWithoutNotify(this.currentHvs.z);

		this.OnNewColor.Fire(this.currentColor, this.currentColorHex);
	}

	public SetHsvColor(hsv: Vector3) {
		this.currentColor = ColorUtil.HsvToRgb(hsv);
		this.currentColorImg.color = this.currentColor;
		this.currentColorHex = ColorUtil.ColorToHex(this.currentColor);
		this.colorImageHue.material.SetFloat("_Hue", hsv.x);
		this.hexInput.SetTextWithoutNotify(this.currentColorHex);

		this.OnNewColor.Fire(this.currentColor, this.currentColorHex);
	}

	public GetColor() {
		return this.currentColor;
	}

	public GetColorFromUV(uv: Vector2) {
		if (this.useHSVImage) {
			const hue = math.clamp01(uv.x);
			const value = math.clamp01(uv.y);
			const saturation = math.clamp01(1 - (value * 2 - 1));
			return ColorUtil.HsvToRgb(new Vector3(hue, saturation, value));
		} else {
			const hue = this.currentHvs.x;
			const value = math.clamp01(uv.y);
			const saturation = math.sqrt(math.clamp01(uv.x));
			return ColorUtil.HsvToRgb(new Vector3(hue, saturation, value));
		}
	}

	private ResetToInitialColor() {
		this.SetColor(this.initialColor);
	}
}
