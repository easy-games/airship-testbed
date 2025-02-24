export enum AvatarBackdropType {
	NONE = 0,
	WHITE_FLAT,
	LIGHT_3D,
	DARK_3D,
}

export default class AvatarBackdropComponent extends AirshipBehaviour {
	public solidColor!: MaterialColorURP;

	public SetBackdrop(backdrop: AvatarBackdropType) {
		for (let i = 0; i < this.gameObject.transform.childCount; i++) {
			this.gameObject.transform.GetChild(i).gameObject.SetActive(i === (backdrop as number));
		}
	}

	public SetSolidColorBackdrop(color: Color) {
		this.SetBackdrop(AvatarBackdropType.WHITE_FLAT);
		//this.solidColor.(color, false);
	}
}
