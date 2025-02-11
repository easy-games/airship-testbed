import ObjectUtils from "../Util/ObjectUtils";
import { EmoteDefinition } from "./EmoteDefinition";
import { EmoteId } from "./EmoteId";

const gestureFadeInTime = 0.22;
const gestureFadeOutTime = 0.22;
const gestureDuration = 1.6;

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
		duration: 1,
	},
	[EmoteId.HandsUp]: {
		anim: "Assets/AirshipPackages/@Easy/Core/Prefabs/Character/Animations/Gestures/Airship_Character_Gesture__HandsUp.anim",
		title: "Hands Up",
		desc: "I surrender!",
		image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/HandsUp.png.sprite",
		fadeInTime: gestureFadeInTime,
		fadeOutTime: gestureFadeOutTime,
		duration: 4,
	},
	[EmoteId.ThumbsUp]: {
		anim: "Assets/AirshipPackages/@Easy/Core/Prefabs/Character/Animations/Gestures/Airship_Character_Gesture__Positive_LeftHand.anim",
		title: "Thumbs up",
		desc: "I agree with that!",
		image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/EmoteThumbsUp.png.sprite",
		fadeInTime: gestureFadeInTime,
		fadeOutTime: gestureFadeOutTime,
		duration: gestureDuration,
	},
	[EmoteId.ThumbsDown]: {
		anim: "Assets/AirshipPackages/@Easy/Core/Prefabs/Character/Animations/Gestures/Airship_Character_Gesture__Negative_LeftHand.anim",
		title: "Thumbs down",
		desc: "I don't agree",
		image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/EmoteThumbsDown.png.sprite",
		fadeInTime: gestureFadeInTime,
		fadeOutTime: gestureFadeOutTime,
		duration: gestureDuration,
	},
	[EmoteId.Point]: {
		anim: "Assets/AirshipPackages/@Easy/Core/Prefabs/Character/Animations/Gestures/Airship_Character_Gesture__Pointing_LeftHand.anim",
		title: "Point",
		desc: "You there!",
		image: "Assets/AirshipPackages/@Easy/Core/Prefabs/EmoteImages/EmotePoint.png.sprite",
		fadeInTime: gestureFadeInTime,
		fadeOutTime: gestureFadeOutTime,
		duration: gestureDuration,
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
