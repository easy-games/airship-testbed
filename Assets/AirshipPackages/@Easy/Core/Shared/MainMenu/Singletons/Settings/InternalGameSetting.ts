export enum InternalGameSettingType {
	Slider = "Slider",
	Toggle = "Toggle",
	CustomButton = "CustomButton",
}

export interface InternalGameSetting {
	name: string;
	type: InternalGameSettingType;
	value: unknown;
}

export interface InternalSliderGameSetting extends InternalGameSetting {
	min: number;
	max: number;
	increment: number;
}
