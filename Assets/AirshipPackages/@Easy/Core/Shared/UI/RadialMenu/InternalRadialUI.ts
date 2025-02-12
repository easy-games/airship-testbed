import { Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal } from "@Easy/Core/Shared/Util/Signal";
import { Asset } from "../../Asset";
import InternalRadialUISegment from "./InternalRadialSegment";

export interface InternalRadialUIData {
	image: string;
	title: string;
	desc: string;
}

export interface InternalRadialEntry {
	readonly gameObject: GameObject;
	readonly data: InternalRadialUIData;
}

/**
 * Gets the point on a 2D circle
 *
 * `(x = r * sin(θ), y = r * cos(θ))`
 *
 * https://math.stackexchange.com/questions/260096/find-the-coordinates-of-a-point-on-a-circle
 * @param radius The radius of the circle - r
 * @param angle The angle - θ
 * @returns A Vector2 coordinate of the point
 */
function getPointOn2DCircle(radius: number, angle: number) {
	const angleRadians = math.rad(angle);
	return new Vector2(radius * math.cos(angleRadians), radius * math.sin(angleRadians));
}

export interface InternalRadialSegment<T extends InternalRadialUIData = InternalRadialUIData> {
	/**
	 * The game object of this segment
	 */
	readonly gameObject: GameObject;
	/**
	 * The offset of the center of this segment
	 */
	readonly centerOffset: Vector2;
	/**
	 * The angle of this segment, in degrees
	 */
	readonly angleDegrees: number;
	/**
	 * The size of this segment, in degrees
	 */
	readonly sizeDegrees: number;

	/**
	 * The data associated with this radial wheel segment
	 */
	readonly data: T;
}

const MIN_ITEMS = 1;
const MAX_ITEMS = 10;

const OFFSET = 45;

export abstract class InternalRadialUI<T extends InternalRadialUIData = InternalRadialUIData> extends AirshipBehaviour {
	public readonly onSelectionChanged = new Signal<[index: number, data: T | undefined]>();
	public readonly onSubmit = new Signal<[data: T | undefined]>();

	@SerializeField() protected canvasGroup: CanvasGroup;
	@SerializeField() public bg: Image;
	@SerializeField() public container: RectTransform;

	@Header("Item Details")
	@Spacing(10)
	@SerializeField()
	protected itemDetailsRect: RectTransform;
	@SerializeField() protected itemDetailsTitle: TMP_Text;
	@SerializeField() protected itemDetailsDesc: TMP_Text;
	@SerializeField() protected itemDetailsImg: Image;

	@Header("Segments")
	@Min(0)
	@Max(20)
	@SerializeField()
	protected segmentMarginSize = 20;

	@Spacing(10)
	@SerializeField()
	protected segmentPrefab: GameObject;
	@SerializeField()
	protected segmentContainer: RectTransform;

	public normalColor = new Color(0.2, 0.2, 0.2, 0.8);
	public highlightedColor = new Color(0.3, 0.3, 0.3, 1);

	private bin = new Bin();
	private radialSegments = new Array<InternalRadialEntry>();

	protected Start(): void {
		this.segmentContainer.gameObject.SetActive(false);
		this.itemDetailsRect.gameObject.SetActive(false);
		this.bg.color = new Color(0, 0, 0, 0);
	}

	public abstract OnWheelSegmentCreated(segment: InternalRadialSegment<T>): void;

	/**
	 * Sets the items for the radial wheel
	 *
	 * There is an enforced limit of 1 to 8 items
	 * @param items
	 */
	public SetItems(items: T[]) {
		assert(items.size() >= MIN_ITEMS, "Item count must be >= than " + MIN_ITEMS);
		assert(items.size() < MAX_ITEMS, "Item count must be < than " + MAX_ITEMS);

		this.segmentContainer.gameObject.ClearChildren();
		this.radialSegments.clear();

		const numSegments = items.size();
		const angleDivision = 360 / numSegments;

		for (let i = 0; i < numSegments; i++) {
			const item = items[i];
			const segment = Instantiate(this.segmentPrefab, this.segmentContainer);

			const radialSegment = segment.GetAirshipComponent<InternalRadialUISegment>()!;
			const segmentImage = radialSegment.segmentImage;

			if (numSegments > 1) {
				segmentImage.fillAmount = 1 / numSegments - this.segmentMarginSize / 360;
			}

			const segmentAngle = i * angleDivision;
			segmentImage.transform.rotation = Quaternion.Euler(
				0,
				0,
				-OFFSET + -segmentAngle - this.segmentMarginSize / 2,
			);

			segmentImage.color = this.normalColor;
			this.radialSegments[i] = {
				gameObject: segment,
				data: item,
			};

			const center = getPointOn2DCircle(
				this.segmentContainer.sizeDelta.x / 2,
				-OFFSET + 90 + -(segmentAngle + angleDivision / 2),
			).mul(0.75);

			this.OnWheelSegmentCreated({
				gameObject: segment,
				angleDegrees: segmentAngle,
				sizeDegrees: angleDivision,
				centerOffset: center,
				data: item,
			});
		}
	}

	public Show() {
		this.segmentContainer.gameObject.SetActive(true);
		this.active = true;

		this.SetSelectedIndex(this.radialSegments.size() - 1);
		const t1 = NativeTween.GraphicAlpha(this.bg, 0.4, 0.2).SetEaseQuadOut();
		this.container.localScale = Vector3.one.mul(1.15);
		const t2 = NativeTween.LocalScale(this.container, Vector3.one, 0.2).SetEaseQuadOut();
		this.bin.Add(() => {
			t1.Cancel();
			t2.Cancel();
		});
		this.bin.Add(Mouse.AddUnlocker());

		Mouse.WarpCursorPosition(new Vector2(Screen.width / 2, Screen.height / 2));

		this.bin.Add(
			Mouse.onRightDown.Connect(() => {
				this.selectedIndex = -1;
				this.onSelectionChanged.Fire(-1, undefined);
				this.Hide();
			}),
		);
		this.bin.Add(
			Mouse.onLeftDown.Connect(() => {
				this.Hide();
			}),
		);
	}

	public Hide() {
		if (!this.active) return;
		this.segmentContainer.gameObject.SetActive(false);
		this.itemDetailsRect.gameObject.SetActive(false);
		NativeTween.GraphicAlpha(this.bg, 0, 0.2).SetEaseQuadOut();
		// this.bg.color = new Color(0, 0, 0, 0);
		this.bin.Clean();
		this.active = false;
		if (this.selectedIndex > -1) {
			task.spawnDetached(() => {
				this.onSubmit.Fire(this.radialSegments[this.selectedIndex].data as T);
			});
		}
		for (let segment of this.radialSegments) {
			segment.gameObject.transform.localScale = Vector3.one;
		}
	}

	private selectedIndex = -1;
	private active = false;

	protected Update(dt: number): void {
		if (!this.active) return;

		const wheelPosition = this.transform.GetComponent<RectTransform>().anchoredPosition;
		const mousePosition = Mouse.position;

		const offset = mousePosition.sub(wheelPosition);
		const normalizedOffset = offset.normalized;
		const dist = math.sqrt(offset.sqrMagnitude);

		if (offset !== Vector2.zero) {
			if (dist >= 50) {
				let angle = math.deg(math.atan2(normalizedOffset.y, -normalizedOffset.x));
				angle -= OFFSET + 90;
				if (angle < 0) {
					angle += 360;
				}

				const sliceAngles = 360 / this.radialSegments.size();
				for (let i = 0; i < this.radialSegments.size(); i++) {
					if (angle > i * sliceAngles && angle < (i + 1) * sliceAngles) {
						if (this.selectedIndex !== i) {
							this.SetSelectedIndex(i);
						}
					}
				}
			}
		}

		for (let i = 0; i < this.radialSegments.size(); i++) {
			const segment = this.radialSegments[i].gameObject;
			const radialSegment = segment.GetAirshipComponent<InternalRadialUISegment>()!;
			const image = radialSegment.segmentImage;

			if (this.selectedIndex === i) {
				image.color = this.highlightedColor;
			} else {
				image.color = this.normalColor;
			}
		}
	}

	private SetSelectedIndex(i: number): void {
		if (this.selectedIndex > -1) {
			const prevSegment = this.radialSegments[this.selectedIndex];
			NativeTween.LocalScale(prevSegment.gameObject.transform, Vector3.one, 0.1).SetEaseQuadOut();
			// prevSegment.gameObject.transform.localScale = Vector3.one;
		}
		this.selectedIndex = i;
		const segment = this.radialSegments[i];
		this.onSelectionChanged.Fire(i, segment.data as T);
		this.itemDetailsRect.gameObject.SetActive(true);
		this.itemDetailsTitle.text = segment.data.title;
		this.itemDetailsDesc.text = segment.data.desc;
		this.itemDetailsImg.sprite = Asset.LoadAsset(segment.data.image);
		NativeTween.LocalScale(segment.gameObject.transform, Vector3.one.mul(1.03), 0.1).SetEaseQuadOut();
	}
}
