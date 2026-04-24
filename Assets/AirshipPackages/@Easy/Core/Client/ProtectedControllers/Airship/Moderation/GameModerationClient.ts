import { ModerationServiceClient } from "@Easy/Core/Shared/TypePackages/moderation-service-types";
import { UnityMakeRequest } from "@Easy/Core/Shared/TypePackages/UnityMakeRequest";
import { AirshipUrl } from "@Easy/Core/Shared/Util/AirshipUrl";

export const gameModerationClient = new ModerationServiceClient(UnityMakeRequest(AirshipUrl.ModerationService));
