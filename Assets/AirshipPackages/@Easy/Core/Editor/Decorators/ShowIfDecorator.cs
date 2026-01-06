using Luau;
using System;
using System.Linq;

internal class VisbilityDecorator : AirshipPropertyDecorator {
    protected bool ShouldRenderNoArguments(AirshipSerializedProperty property) {
        return property.type switch {
            AirshipSerializedType.Boolean => property.boolValue,
            AirshipSerializedType.String => !string.IsNullOrEmpty(property.stringValue),
            AirshipSerializedType.Number => property.numberValue != 0,
            AirshipSerializedType.Enum => property.enumType.memberType switch {
                TypeScriptEnumMemberType.Integer => property.intValue != 0,
                TypeScriptEnumMemberType.String => !string.IsNullOrEmpty(property.stringValue),
                _ => throw new ArgumentOutOfRangeException()
            },
            AirshipSerializedType.FlagEnum => property.intValue != 0,
            _ => throw new ArgumentOutOfRangeException()
        };
    }

    protected bool ShouldRenderWithMatches(AirshipSerializedProperty property, LuauMetadataDecoratorValue[] matches) {
        switch (property.type) {
            case AirshipSerializedType.Boolean:
                return matches.Select(v => bool.Parse(v.serializedValue)).Contains(property.boolValue);
            case AirshipSerializedType.String:
                return matches.Select(v => v.value as string).Contains(property.stringValue);
            case AirshipSerializedType.Number:
                return matches.Select(v => int.Parse(v.serializedValue)).Contains(property.intValue);
            case AirshipSerializedType.Enum: {
                return property.enumType.memberType switch {
                    TypeScriptEnumMemberType.String => matches.Select(v => v.value as string)
                        .Contains(property.enumValue.stringValue),
                    TypeScriptEnumMemberType.Integer => matches.Select(v => int.Parse(v.serializedValue))
                        .Contains(property.enumValue.intValue),
                    _ => false,
                };
            }
            case AirshipSerializedType.FlagEnum: {
                return matches.Select(arg => int.Parse(arg.serializedValue)).Any(value => (property.intValue & value) != 0);
            }
            default:
                throw new ArgumentOutOfRangeException();
        }
    }
}

[CustomAirshipDecorator("ShowIf")]
internal class ShowIfDecorator : VisbilityDecorator {
    public override bool ShouldDrawProperty() {
        if (arguments.Length < 1) return false;
        string propertyName = arguments[0].value as string;

        AirshipSerializedProperty targetProperty = serializedObject.FindAirshipProperty(propertyName);
        if (targetProperty == null) return false;

        return arguments.Length == 1 ? ShouldRenderNoArguments(targetProperty) : ShouldRenderWithMatches(targetProperty, arguments[1..]);
    }
}