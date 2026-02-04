import { Airship, Platform } from "@Easy/Core/Shared/Airship";
import { AirshipOutfit } from "@Easy/Core/Shared/Airship/Types/AirshipPlatformInventory";
import { DecodeJSON } from "@Easy/Core/Shared/json";
import { Signal } from "@Easy/Core/Shared/Util/Signal";

@RequireComponent<AccessoryBuilder>()
export default class RuntimeOutfitLoader extends AirshipBehaviour {
    public username = "";
    public outfitObj: AccessoryOutfit;
    @Tooltip("Outfit JSON can be copied by right clicking outfits in the avatar editor")
    public outfitData: string = "";

    public OnOutfitLoaded = new Signal<[]>();

    private builder: AccessoryBuilder;
    
    
    protected Awake(): void {
        this.builder = this.gameObject.GetComponent<AccessoryBuilder>()!;
    }

    protected Start(): void {
        if(this.username && this.username !== "") {
            this.LoadUserOutfit();
        }
        
        if(this.outfitObj) {
            this.LoadObjectOutfit();
        }

        if(this.outfitData && this.outfitData !== "") {
            this.LoadObjectOutfitString();
        }
    }

    private async LoadUserOutfit() {
        const user = await Platform.Client.User.GetUserByUsername(this.username, true);
        if(user) {
            const outfitDto = await Airship.Avatar.GetUserEquippedOutfitDto(user.uid);
            if(outfitDto) {
                await Airship.Avatar.LoadOutfit(this.builder,outfitDto);
                this.OnOutfitLoaded.Fire();
            }
        }
    }

    private LoadObjectOutfit() {
        this.builder.LoadOutfit(this.outfitObj);
        this.builder.UpdateCombinedMesh();
    }

    private async LoadObjectOutfitString() {
        // for(const gearId of this.outfitSet.split(",")) {
        //     if(gearId && gearId !== "") {
        //     }
        // }
        let outfit = undefined;
        try{
            outfit = DecodeJSON<AirshipOutfit>(this.outfitData);
        }catch{
            warn("Unable to parse outfit string");
        }
        if(outfit) {
            await Airship.Avatar.LoadOutfit(this.builder, outfit);
            this.OnOutfitLoaded.Fire();
        }
    }
}
