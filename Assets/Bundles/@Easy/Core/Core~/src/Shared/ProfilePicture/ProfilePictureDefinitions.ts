import ObjectUtils from "@easy-games/unity-object-utils";
import { ProfilePictureId } from "./ProfilePictureId";
import { ProfilePictureMeta } from "./ProfilePictureMeta";

const defs: {
	[key in ProfilePictureId]: Omit<ProfilePictureMeta, "id">;
} = {
	[ProfilePictureId.BEAR]: {
		path: "Dom.png",
	},
};

for (const id of ObjectUtils.keys(defs)) {
	const meta = defs[id] as ProfilePictureMeta;
	meta.id = id;
	meta.path = `@Easy/Core/Shared/Resources/Images/ProfilePictures/${meta.path}`;
}

export const ProfilePictureDefinitions = defs as {
	[key in ProfilePictureId]: ProfilePictureMeta;
};
