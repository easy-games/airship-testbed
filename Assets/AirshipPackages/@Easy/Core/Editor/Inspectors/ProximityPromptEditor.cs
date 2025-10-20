#if AIRSHIP_EDITOR_API
using Editor.Typescript;
using UnityEditor;
using UnityEngine;

[CustomAirshipCoreEditor("ProximityPrompt")]
public class ProximityPromptEditor : AirshipEditor {
    public void DrawUserProperties() {
        var objectText = serializedObject.FindAirshipProperty("objectText");
        var actionText = serializedObject.FindAirshipProperty("actionText");
        var actionName = serializedObject.FindAirshipProperty("actionName");
        var maxRange = serializedObject.FindAirshipProperty("maxRange");
        var mouseRaycastTarget = serializedObject.FindAirshipProperty("mouseRaycastTarget");
        var @static = serializedObject.FindAirshipProperty("static");
        var activateWhenDown = serializedObject.FindAirshipProperty("activateWhenDown");
        var hideWhenDead = serializedObject.FindAirshipProperty("hideWhenDead");
        
        AirshipEditorGUI.BeginGroup();
        {
            AirshipEditorGUI.Heading(new GUIContent("Display"));
            PropertyField(objectText);
            PropertyField(actionText);
        }
        AirshipEditorGUI.EndGroup();
       
        AirshipEditorGUI.BeginGroup();
        {
            AirshipEditorGUI.Heading(new GUIContent("Input"));
            PropertyField(actionName);
            PropertyField(mouseRaycastTarget);
            PropertyField(activateWhenDown);
        }
        AirshipEditorGUI.EndGroup();
        
        AirshipEditorGUI.BeginGroup();
        {
            AirshipEditorGUI.Heading(new GUIContent("Visibility"));
            PropertyField(maxRange);
            PropertyField(@static);
            PropertyField(hideWhenDead);
        }
        AirshipEditorGUI.EndGroup();
    }

    public void DrawReferences() {
        PropertyField("objectTextWrapper");
        PropertyField("canvas");
        PropertyField("objectTextLabel");
        PropertyField("actionTextLabel");
        PropertyField("keybindTextLabel");
        PropertyField("backgroundImg");
        PropertyField("button");
        PropertyField("touchIcon");
    }

    public bool showRefs = false;
    
    public override void OnInspectorGUI() {
        DrawUserProperties();
        
        AirshipEditorGUI.HorizontalLine();
        showRefs = EditorGUILayout.BeginFoldoutHeaderGroup(showRefs, new GUIContent("References", "The references to GameObjects for the Proximity Prompt"));
        if (showRefs) {
            DrawReferences();
        }
        EditorGUILayout.EndFoldoutHeaderGroup();
    }

    public override void OnSceneGUI() {
        var component = (AirshipComponent)target;
        var maxRange = serializedObject.FindAirshipProperty("maxRange");
        Handles.DrawWireDisc(component.transform.position, Vector3.up, maxRange.numberValue);
    }

    public override bool HasPreviewGUI() {
        return true;
    }

    public override void OnPreviewGUI(Rect r, GUIStyle background) {
        var objectText = serializedObject.FindAirshipProperty("objectText");
        var actionText = serializedObject.FindAirshipProperty("actionText");
        
        var originalRect = new Rect(r);
        r.xMin = r.xMax / 2;
        r.x = r.x / 2;
        
        EditorGUI.DrawRect(r, new Color(0, 0, 0, 0.5f));
        
        var backRect = new Rect(r) { height = 30};
        EditorGUI.DrawRect(backRect, Color.black);
        
        EditorGUI.LabelField(backRect, objectText.stringValue, new GUIStyle(EditorStyles.whiteBoldLabel) { fontSize = 18, alignment = TextAnchor.MiddleCenter});

        var midRect = new Rect(r) { y = r.yMax / 2 - 25 , width = 50, height = 50, x = originalRect.xMax / 2 - 25 };
        EditorGUI.DrawRect(midRect, Color.white);

        var bottomRect = new Rect(r) { y = r.yMax - 50, height =  50 };
        EditorGUI.LabelField(bottomRect, actionText.stringValue, new GUIStyle(EditorStyles.whiteBoldLabel) { fontSize = 18, alignment = TextAnchor.MiddleCenter, wordWrap = true });
    }
}
#endif