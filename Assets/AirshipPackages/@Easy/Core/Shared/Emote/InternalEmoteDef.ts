import ObjectUtils from "../Util/ObjectUtils";
import { EmoteId } from "./EmoteId";

export interface InternalEmoteDef {
	id: EmoteId;
	anim: string;
	title: string;
	desc: string;
	image: string;
	looped?: boolean;
}

const defs: {
	[key in EmoteId]: Omit<InternalEmoteDef, "id">;
} = {
	[EmoteId.Wave]: {
		anim: "Assets/AirshipPackages/@Easy/Core/Prefabs/Character/Animations/Emotes/Airship_Character_Emote__Wave_UpperBody.anim",
		title: "Wave",
		desc: "Smile and wave...",
		image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/EmoteWave.png.sprite",
	},
	[EmoteId.CutThroat]: {
		anim: "Assets/AirshipPackages/@Easy/Core/Prefabs/Character/Animations/Emotes/Airship_Character_Emote__Cut_Throat_Upperbody.anim",
		title: "Cut Throat",
		desc: "Don't mess with me",
		image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/EmoteCutThroat.png.sprite",
	},
	[EmoteId.FingerGun]: {
		anim: "Assets/AirshipPackages/@Easy/Core/Prefabs/Character/Animations/Emotes/Airship_Character_Emote__Finger_Gun_Upperbody.anim",
		title: "Boom",
		desc: "You're done bud",
		image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/EmoteFingerGun.png.sprite",
	},
};
for (let id of ObjectUtils.keys(defs)) {
	(defs[id] as any).id = id;
}

export const InternalEmoteDefinitions: {
	[key in EmoteId]: InternalEmoteDef;
} = defs as {
	[key in EmoteId]: InternalEmoteDef;
};
