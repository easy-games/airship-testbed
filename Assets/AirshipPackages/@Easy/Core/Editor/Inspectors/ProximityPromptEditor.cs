#if AIRSHIP_EDITOR_API
using TypescriptAst;
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
        
        AirshipEditorGUI.BeginGroup(new GUIContent("Display"));
        {
            PropertyField(objectText);
            PropertyField(actionText);
            PropertyField(@static);
        }
        AirshipEditorGUI.EndGroup();
       
        AirshipEditorGUI.BeginGroup(new GUIContent("Input"));
        {
            PropertyField(actionName);
            PropertyField(mouseRaycastTarget);
            PropertyField(activateWhenDown);
        }
        AirshipEditorGUI.EndGroup();
        
        AirshipEditorGUI.BeginGroup(new GUIContent("Visibility"));
        {
            PropertyField(maxRange);
            PropertyField(hideWhenDead);
        }
        AirshipEditorGUI.EndGroup();
    }

    public void DrawReferences() {
        string[] referenceProperties = new[] {
            "objectTextWrapper",
            "canvas",
            "objectTextLabel",
            "actionTextLabel",
            "keybindTextLabel",
            "backgroundImg",
            "button",
            "touchIcon",
        };

        var hasIssues = false;
        
        foreach (var propertyName in referenceProperties) {
            var property = serializedObject.FindAirshipProperty(propertyName);
            AirshipEditorGUI.ValidateProperty(property, prop => prop.objectReferenceValue != null);
            hasIssues = hasIssues || !property.valid;
        }

        if (hasIssues) {
            EditorGUILayout.HelpBox("Missing properties, Proximity Prompt may not work as expected", MessageType.Warning);
        }
        
        AirshipEditorGUI.HorizontalLine(new Color(70 / 255f, 70 / 255f, 70 / 255f));
        showRefs = EditorGUILayout.BeginFoldoutHeaderGroup(showRefs, new GUIContent("References", "The references to GameObjects for the Proximity Prompt"));
        if (showRefs || hasIssues) {
            foreach (var propertyName in referenceProperties) {
                var property = serializedObject.FindAirshipProperty(propertyName);
                PropertyField(property);
            }
        }
        EditorGUILayout.EndFoldoutHeaderGroup();
    }

    public bool showRefs = false;
    
    public override void OnInspectorGUI() {
        DrawUserProperties();
        

            DrawReferences();
       
        
    }

    public override void OnSceneGUI() {
        var component = (AirshipComponent)target;
        var maxRange = serializedObject.FindAirshipProperty("maxRange");
        
        var transform = component.transform;
        var position = transform.position;

        var prevColor = Handles.color;
        Handles.color = new Color(0, 0.5f, 1);
        maxRange.numberValue = Handles.RadiusHandle(transform.rotation, position, maxRange.numberValue);
        
        Handles.Label(
            position + new Vector3(0, maxRange.numberValue, 0), 
            $"{string.Format("{0:0.##}", maxRange.numberValue)}m", 
            new GUIStyle(EditorStyles.whiteLargeLabel) {normal = {textColor = Handles.color }});
        
        maxRange.serializedProperty.serializedObject.ApplyModifiedProperties();
        Handles.color = prevColor;
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