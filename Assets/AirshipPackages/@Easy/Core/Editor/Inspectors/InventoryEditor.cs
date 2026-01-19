#if AIRSHIP_EDITOR_API
using Mirror;
using UnityEditor;
using UnityEngine;

[CustomAirshipCoreEditor("Inventory")]
public class InventoryEditor : AirshipEditor {
    public override void OnInspectorGUI() {
        var networkIdentity = serializedObject.FindAirshipProperty("networkIdentity");
        if (networkIdentity.objectReferenceValue == null) {
            var component = (AirshipComponent)target;
            var networkIdentityComponent = component.GetComponentInParent<NetworkIdentity>();
            
            if (networkIdentityComponent != null) {
                networkIdentity.objectReferenceValue = networkIdentityComponent;
            }
        }
        
        AirshipEditorGUI.BeginGroup(new GUIContent("Networking"));
        {
            AirshipEditorGUI.ValidateProperty(networkIdentity, IsNotNull);
            PropertyField(networkIdentity);
            if (!networkIdentity.valid) {
                EditorGUILayout.HelpBox("This Inventory is missing a NetworkIdentity, which is required.", MessageType.Error);
                if (GUILayout.Button("Fix")) {
                    var component = (AirshipComponent)target;
                    component.gameObject.AddComponent<NetworkIdentity>();
                }
            }
        }
        AirshipEditorGUI.EndGroup();
        
        AirshipEditorGUI.BeginGroup(new GUIContent("Slots"));
        {
            var maxSlots = serializedObject.FindAirshipProperty("maxSlots");
            
            AirshipEditorGUI.BeginProperty(maxSlots);
            AirshipEditorGUI.IntProperty(new GUIContent("Max Slots"), maxSlots);
            AirshipEditorGUI.EndProperty();
        }
        AirshipEditorGUI.EndGroup();
        
        AirshipEditorGUI.BeginGroup(new GUIContent("Permissions"));
        {
            var modifyPermission = serializedObject.FindAirshipProperty("modifyPermission");
            PropertyField(modifyPermission);
            
            if (modifyPermission.enumValue.name == "Everyone") {
                EditorGUILayout.HelpBox("This setting will allow anyone in the server to modify this inventory", MessageType.Warning);
            }
        }
        AirshipEditorGUI.EndGroup();
    }

    private bool IsNotNull(AirshipSerializedProperty arg) {
        return arg.isObject && arg.objectReferenceValue != null;
    }
}
#endif