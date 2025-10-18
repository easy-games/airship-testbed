export default class AvatarCustomizationSetter_Color extends AirshipBehaviour {
    public colorsA: MaterialColorURP[] = [];
    public colorsB: MaterialColorURP[] = [];
    public colorsC: MaterialColorURP[] = [];

    public Set(colors: Color[]) {
        const size = colors.size();
        if(size > 3) {
            warn("Only 3 colors are supported for customized colors on PlatformGear");
        } 

        if(size > 0) {
            for(const setter of this.colorsA) {
                setter.SetColorOnAll(colors[0]);
            }
        }
        if(size > 1) {
            for(const setter of this.colorsB) {
                setter.SetColorOnAll(colors[1]);
            }
        }
        if(size > 2) {
            for(const setter of this.colorsC) {
                setter.SetColorOnAll(colors[2]);
            }
        }
    }
}
