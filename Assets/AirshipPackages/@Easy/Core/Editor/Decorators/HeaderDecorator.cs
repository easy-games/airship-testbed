#if AIRSHIP_EDITOR_API
using UnityEditor;

[CustomAirshipDecorator("Header")]
internal class HeaderDecorator : AirshipPropertyDecorator {
    public override void OnBeforeInspectorGUI() {
        EditorGUILayout.Space();
        var guiStyle = EditorStyles.boldLabel;
        guiStyle.richText = true;
        var title = arguments[0].value as string;
        EditorGUILayout.LabelField(title, guiStyle);
    }
}
#endif