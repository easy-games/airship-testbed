[CustomAirshipDecorator("HideIf")]
internal class HideIfDecorator : VisbilityDecorator {
    public override bool ShouldDrawProperty() {
        if (arguments.Length < 1) return false;
        string propertyName = arguments[0].value as string;

        AirshipSerializedProperty targetProperty = serializedObject.FindAirshipProperty(propertyName);
        if (targetProperty == null) return false;

        return arguments.Length == 1 ? !ShouldRenderNoArguments(targetProperty) : !ShouldRenderWithMatches(targetProperty, arguments[1..]);
    }
}