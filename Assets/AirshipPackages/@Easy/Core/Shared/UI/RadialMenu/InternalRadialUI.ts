import { Keyboard, Mouse } from "@Easy/Core/Shared/UserInput";
import { Bin } from "@Easy/Core/Shared/Util/Bin";
import { Signal, SignalPriority } from "@Easy/Core/Shared/Util/Signal";
import { Asset } from "../../Asset";
import { Game } from "../../Game";
import { CanvasAPI, PointerDirection } from "../../Util/CanvasAPI";
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
	public readonly onOpened = new Signal();
	public readonly onClosed = new Signal();

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
	private latestTouchId = -1;

	protected Start(): void {
		this.segmentContainer.gameObject.SetActive(false);
		this.itemDetailsRect.gameObject.SetActive(false);
		this.bg.color = new Color(0, 0, 0, 0);
		this.bg.raycastTarget = false;
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

		this.SetSelectedIndex(Game.IsMobile() ? this.radialSegments.size() - 1 : -1);
		const t1 = NativeTween.GraphicAlpha(this.bg, 0.5, 0.2).SetEaseQuadOut();
		this.bg.raycastTarget = true;
		this.container.localScale = Vector3.one.mul(1.15);
		const t2 = NativeTween.LocalScale(this.container, Vector3.one, 0.2).SetEaseQuadOut();
		this.bin.Add(() => {
			t1.Cancel();
			t2.Cancel();
		});
		if (Game.IsMobile()) {
			this.bin.AddEngineEventConnection(
				CanvasAPI.OnPointerEvent(this.bg.gameObject, (dir, btn) => {
					if (dir === PointerDirection.DOWN) {
						let newestTouchId = -1;
						for (let i = 0; i < Input.touchCount; i++) {
							const touch = Input.GetTouch(i);
							if (touch.phase === TouchPhase.Began) {
								newestTouchId = touch.fingerId;
								break;
							}
						}

						if (newestTouchId === -1) {
							return;
						}

						this.latestTouchId = newestTouchId;

						const segmentIndex = this.GetSegmentUnderPointer();
						this.SetSelectedIndex(segmentIndex);
					} else if (dir === PointerDirection.UP) {
						const segmentIndex = this.GetSegmentUnderPointer();
						// Only submit if releasing over the currently selected segment
						if (segmentIndex === this.selectedIndex) {
							const segment = this.radialSegments[this.selectedIndex];
							const squishDuration = 0.1;

							NativeTween.LocalScale(
								segment.gameObject.transform,
								Vector3.one,
								squishDuration,
							).SetEaseQuadOut();

							task.delay(squishDuration, () => {
								task.spawnDetached(() => {
									this.onSubmit.Fire(this.radialSegments[this.selectedIndex].data as T);
								});
								this.Hide();
							});
						}
					}
				}),
			);

			this.bin.AddEngineEventConnection(
				CanvasAPI.OnDragEvent(this.bg.gameObject, (data) => {
					const segmentIndex = this.GetNearestSegmentByAngle(data.position);
					if (this.selectedIndex !== segmentIndex) {
						this.SetSelectedIndex(segmentIndex);
					}
				}),
			);
		} else {
			this.bin.Add(Mouse.AddUnlocker());

			Mouse.WarpCursorPosition(new Vector2(Screen.width / 2, Screen.height / 2));

			this.bin.Add(
				Mouse.onRightDown.ConnectWithPriority(SignalPriority.HIGHEST, (e) => {
					e.SetCancelled(true);
					this.selectedIndex = -1;
					this.onSelectionChanged.Fire(-1, undefined);
					this.Hide();
				}),
			);
			this.bin.Add(
				Mouse.onRightDown.ConnectWithPriority(SignalPriority.HIGHEST, () => {
					this.Hide();
				}),
			);
			this.bin.Add(
				Keyboard.OnKeyDown(Key.Escape, () => {
					this.Hide();
				}),
			);
			this.bin.Add(
				Mouse.onLeftDown.ConnectWithPriority(SignalPriority.HIGHEST, (e) => {
					e.SetCancelled(true);
					this.Hide();
				}),
			);
		}
		this.onOpened.Fire();
	}

	public Hide() {
		if (!this.active) return;
		this.segmentContainer.gameObject.SetActive(false);
		this.itemDetailsRect.gameObject.SetActive(false);
		NativeTween.GraphicAlpha(this.bg, 0, 0.2).SetEaseQuadOut();
		this.bg.raycastTarget = false;
		// this.bg.color = new Color(0, 0, 0, 0);
		this.bin.Clean();
		this.active = false;
		this.latestTouchId = -1;
		if (this.selectedIndex > -1 && !Game.IsMobile()) {
			task.spawnDetached(() => {
				this.onSubmit.Fire(this.radialSegments[this.selectedIndex].data as T);
			});
		}
		for (let segment of this.radialSegments) {
			segment.gameObject.transform.localScale = Vector3.one;
		}
		this.onClosed.Fire();
	}

	private selectedIndex = -1;
	private active = false;

	protected Update(dt: number): void {
		if (!this.active) return;

		const wheelPosition = this.transform.GetComponent<RectTransform>().anchoredPosition;
		if (!Game.IsMobile()) {
			const mousePosition = Mouse.position;

			const offset = mousePosition.sub(wheelPosition);
			const normalizedOffset = offset.normalized;
			const dist = math.sqrt(offset.sqrMagnitude);

			if (offset !== Vector2.zero && dist >= 55) {
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
			} else {
				this.SetSelectedIndex(-1);
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
		if (i === this.selectedIndex) return;
		// Update previous selected
		if (this.selectedIndex > -1) {
			const prevSegment = this.radialSegments[this.selectedIndex];
			NativeTween.LocalScale(prevSegment.gameObject.transform, Vector3.one, 0.1).SetEaseQuadOut();
		}

		this.selectedIndex = i;
		if (i > -1) {
			const segment = this.radialSegments[i];
			this.onSelectionChanged.Fire(i, segment.data as T);
			this.itemDetailsRect.gameObject.SetActive(true);
			this.itemDetailsTitle.text = segment.data.title;
			this.itemDetailsDesc.text = segment.data.desc;
			this.itemDetailsImg.sprite = Asset.LoadAsset(segment.data.image);
			NativeTween.LocalScale(segment.gameObject.transform, Vector3.one.mul(1.03), 0.1).SetEaseQuadOut();
		} else {
			this.itemDetailsRect.gameObject.SetActive(false);
		}
	}

	/**
	 * Finds the nearest segment based on angle from the wheel center, regardless of distance.
	 * @param position The position to check (in screen space)
	 * @returns The nearest segment index
	 */
	private GetNearestSegmentByAngle(position: Vector2): number {
		const wheelPosition = this.transform.GetComponent<RectTransform>().anchoredPosition;
		const offset = position.sub(wheelPosition);
		
		if (offset === Vector2.zero) return 0;
		
		const normalizedOffset = offset.normalized;
		let angle = math.deg(math.atan2(normalizedOffset.y, -normalizedOffset.x));
		angle -= OFFSET + 90;
		if (angle < 0) {
			angle += 360;
		}

		const numSegments = this.radialSegments.size();
		const sliceAngles = 360 / numSegments;

		for (let i = 0; i < numSegments; i++) {
			const segmentStartAngle = i * sliceAngles;
			const segmentEndAngle = (i + 1) * sliceAngles;

			if (angle >= segmentStartAngle && angle < segmentEndAngle) {
				return i;
			}
		}

		return 0;
	}

	/**
	 * Checks if the tracked touch pointer is over a segment and returns the segment index.
	 * Uses the latestTouchId to find the correct touch.
	 * @returns The segment index if over a segment, -1 otherwise
	 */
	private GetSegmentUnderPointer(): number {
		if (!Game.IsMobile() || Input.touchCount === 0) return -1;

		let touchPosition: Vector2 | undefined;
		for (let i = 0; i < Input.touchCount; i++) {
			const touch = Input.GetTouch(i);
			if (touch.fingerId === this.latestTouchId) {
				touchPosition = touch.position;
				break;
			}
		}

		if (!touchPosition) {
			return -1;
		}

		const wheelPosition = this.transform.GetComponent<RectTransform>().anchoredPosition;

		const offset = touchPosition.sub(wheelPosition);
		const normalizedOffset = offset.normalized;
		const dist = math.sqrt(offset.sqrMagnitude);

		const innerRadius = 110;
		const outerRadius = this.segmentContainer.sizeDelta.x / 2;
		const addedTolerance = 30;

		if (offset === Vector2.zero || dist < innerRadius || dist > outerRadius + addedTolerance) {
			return -1;
		}

		let angle = math.deg(math.atan2(normalizedOffset.y, -normalizedOffset.x));
		angle -= OFFSET + 90;
		if (angle < 0) {
			angle += 360;
		}

		const numSegments = this.radialSegments.size();
		const sliceAngles = 360 / numSegments;

		for (let i = 0; i < numSegments; i++) {
			const segmentStartAngle = i * sliceAngles;
			const segmentEndAngle = (i + 1) * sliceAngles;

			const segmentFillAngle = sliceAngles * (1 - (this.segmentMarginSize / 360) * numSegments);
			const marginPerSide = (sliceAngles - segmentFillAngle) / 2;

			const actualStartAngle = segmentStartAngle + marginPerSide;
			const actualEndAngle = segmentEndAngle - marginPerSide;

			if (angle >= actualStartAngle && angle <= actualEndAngle) {
				return i;
			}
		}

		return -1;
	}

	public IsWheelOpen(): boolean {
		return this.active;
	}
}
