import { Asset } from "@Easy/Core/Shared/Asset";
import { InternalEmoteDef } from "../../Emote/InternalEmoteDef";
import InternalRadialUISegment from "./InternalRadialSegment";
import { InternalRadialSegment, InternalRadialUI } from "./InternalRadialUI";

export default class InternalEmoteRadialUI extends InternalRadialUI<InternalEmoteDef> {
	public OnWheelSegmentCreated(segment: InternalRadialSegment<InternalEmoteDef>): void {
		const radialSegment = segment.gameObject.GetAirshipComponent<InternalRadialUISegment>();
		if (!radialSegment) return;
		const center = segment.centerOffset;
		const item = segment.data;

		const segmentIcon = radialSegment.segmentIconImage;

		(segmentIcon.transform as RectTransform).anchoredPosition = (
			this.segmentContainer.transform as RectTransform
		).anchoredPosition.add(new Vector2(center.x, center.y));

		if (item.image) {
			segmentIcon.sprite = Asset.LoadAsset(item.image);
			// if (item.color) segmentIcon.color = item.color;
		}
	}
}
