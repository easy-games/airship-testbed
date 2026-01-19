[CustomAirshipDecorator("HideInInspector")]
internal class HideInInspectorDecorator : AirshipPropertyDecorator {
    public override bool ShouldDrawProperty() => false;
}