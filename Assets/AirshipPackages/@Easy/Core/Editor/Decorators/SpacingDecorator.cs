using System;
using UnityEditor;

[CustomAirshipDecorator("Spacing")]
internal class SpacingDecorator : AirshipPropertyDecorator {
    public override void OnBeforeInspectorGUI() {
        if (arguments.Length == 0) {
            EditorGUILayout.Space();
        }
        else {
            EditorGUILayout.Space(Convert.ToSingle(arguments[0].value));
        }
    }
}