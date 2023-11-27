import { HeldItem } from "../HeldItem";
export declare class ProjectileLauncherHeldItem extends HeldItem {
    private chargeBin;
    private startHoldTimeSec;
    private processChargeAfterCooldown;
    private chargeAudioSource;
    private projectileTrajectoryRenderer;
    protected OnCooldownReset(): void;
    protected OnChargeStart(): void;
    private HasRequiredAmmo;
    protected OnChargeEnd(): void;
    private CancelChargeSound;
    protected OnUseClient(useIndex: number): void;
    OnCallToActionEnd(): void;
    private GetLaunchData;
    private GetAimVector;
}
