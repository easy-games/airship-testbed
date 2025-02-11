import ObjectUtils from "../Util/ObjectUtils";
import { EmoteDefinition } from "./EmoteDefinition";
import { EmoteId } from "./EmoteId";

const defs: {
	[key in EmoteId]: Omit<EmoteDefinition, "id">;
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
	[EmoteId.HandsUp]: {
		anim: "Assets/AirshipPackages/@Easy/Core/Prefabs/Character/Animations/Gestures/Airship_Character_Gesture__HandsUp.anim",
		title: "Hands Up",
		desc: "I surrender!",
		image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/HandsUp.png.sprite",
		fadeInTime: 0.22,
	},
};
for (let id of ObjectUtils.keys(defs)) {
	(defs[id] as any).id = id;
}

export const InternalEmoteDefinitions: {
	[key in EmoteId]: EmoteDefinition;
} = defs as {
	[key in EmoteId]: EmoteDefinition;
};
