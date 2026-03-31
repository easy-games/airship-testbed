import { Airship } from "@Easy/Core/Shared/Airship";

export default class SettingsCategoryTest extends AirshipSingleton {
    override Start(): void {
        Airship.Settings.AddCategory("Test Category");
        Airship.Settings.AddSlider("Test Slider", 50, 0, 100, 1);
        Airship.Settings.AddToggle("Test Toggle", true);
        
        Airship.Settings.AddCategory("Another Category");
        Airship.Settings.AddSlider("Another Slider", 50, 0, 100, 1);
        Airship.Settings.AddToggle("Another Toggle", true);
    }
};