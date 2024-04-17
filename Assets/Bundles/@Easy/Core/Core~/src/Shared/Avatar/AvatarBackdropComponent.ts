export enum AvatarBackdropType {
	NONE = 0,
	WHITE_FLAT,
	LIGHT_3D,
	DARK_3D,
}

export default class AvatarBackdropComponent extends AirshipBehaviour {
	public solidColor!: MaterialColor;

	public SetBackgdrop(backdrop: AvatarBackdropType) {
		for (let i = 0; i < this.gameObject.transform.childCount; i++) {
			this.gameObject.transform.GetChild(i).gameObject.SetActive(i === (backdrop as number));
		}
	}

	public SetSolidColorBackdrop(color: Color) {
		this.SetBackgdrop(AvatarBackdropType.WHITE_FLAT);
		this.solidColor.SetAllColors(color, false);
	}
}
