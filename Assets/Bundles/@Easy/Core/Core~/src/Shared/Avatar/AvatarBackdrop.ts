export enum AvatarBackdrop {
	NONE = 0,
	WHITE_FLAT,
	LIGHT_3D,
	DARK_3D,
}
export default class AvatarBackdropComponent extends AirshipBehaviour {
	public SetBackgdrop(backdrop: AvatarBackdrop) {
		for (let i = 0; i < this.gameObject.transform.childCount; i++) {
			this.gameObject.transform.GetChild(i).gameObject.SetActive(i === (backdrop as number));
		}
	}
}
