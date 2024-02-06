/// <reference types="@easy-games/compiler-types" />
import { Bin } from "../../Util/Bin";
import { Signal } from "../../Util/Signal";
export default class SocialNotificationComponent extends AirshipBehaviour {
    titleText: TMP_Text;
    userImage: Image;
    usernameText: TMP_Text;
    acceptButton: Button;
    declineButton: Button;
    /**
     * Fires true if accepted. False if declined.
     */
    onResult: Signal<boolean>;
    bin: Bin;
    Start(): void;
    OnDisable(): void;
    OnDestroy(): void;
}
