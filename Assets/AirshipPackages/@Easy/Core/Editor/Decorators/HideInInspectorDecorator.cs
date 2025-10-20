#if AIRSHIP_EDITOR_API
[CustomAirshipDecorator("HideInInspector")]
internal class HideInInspectorDecorator : AirshipPropertyDecorator {
    public override bool ShouldDrawProperty() => false;
}
#endif