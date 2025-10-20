using Mirror;
using System;
using UnityEditor;
using UnityEngine;
#if AIRSHIP_EDITOR_API
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
        
        if (networkIdentity.objectReferenceValue == null) {
            PropertyField(networkIdentity);
            if (networkIdentity.objectReferenceValue == null) {
                EditorGUILayout.HelpBox("This Inventory is missing a NetworkIdentity", MessageType.Error);
            }
        }
        
        AirshipEditorGUI.BeginGroup();
        {
            AirshipEditorGUI.Heading(new GUIContent("Slots"));
            var maxSlots = serializedObject.FindAirshipProperty("maxSlots");
            PropertyField(maxSlots);
        }
        AirshipEditorGUI.EndGroup();
        
        AirshipEditorGUI.BeginGroup();
        {
            AirshipEditorGUI.Heading(new GUIContent("Permissions"));
            var modifyPermission = serializedObject.FindAirshipProperty("modifyPermission");
            PropertyField(modifyPermission);
            if (modifyPermission.enumValue.Name == "NetworkOwner") {
                GUI.enabled = false;
                PropertyField(new GUIContent("Network Identity"), "networkIdentity");
                GUI.enabled = true;
            } else if (modifyPermission.enumValue.Name == "Everyone") {
                EditorGUILayout.HelpBox("This setting will allow anyone in the server to modify this inventory", MessageType.Warning);
            }
        }
        AirshipEditorGUI.EndGroup();
    }
}

[CustomAirshipCoreEditor("CharacterConfigSetup")]
public class CharacterConfigEditor : AirshipEditor {
    private int selectedTabIndex = 0;
    public override void OnInspectorGUI() {
        selectedTabIndex = AirshipEditorGUI.BeginTabs(selectedTabIndex, new[] { new GUIContent("Character"), new GUIContent("Camera"), new GUIContent("UI") });
        {
            if (selectedTabIndex == 0) {
                // Character
                PropertyField("customCharacterPrefab");
                
                AirshipEditorGUI.HorizontalLine();
                
                if (PropertyField("useDefaultMovement")) {
                    EditorGUI.indentLevel += 1;

                    PropertyField("enableJumping");
                    PropertyField("enableSprinting");
                    PropertyField("enableCrouching");
                    PropertyField("footstepSounds");
                    
                    EditorGUI.indentLevel -= 1;
                }
                
                AirshipEditorGUI.HorizontalLine();

                if (PropertyField("instantiateViewmodel")) {
                    PropertyField("customViewmodelPrefab");
                }
            } else if (selectedTabIndex == 1) {
                // Camera
                if (PropertyField("useAirshipCameraSystem")) {
                    AirshipEditorGUI.HorizontalLine();
                    
                    PropertyField("startInFirstPerson");
                    PropertyField("allowFirstPersonToggle");
                    
                    AirshipEditorGUI.HorizontalLine();
                    
                    if (PropertyField("useSprintFOV")) {
                        PropertyField("sprintFOVMultiplier");
                    }
                    
                    AirshipEditorGUI.HorizontalLine();
                    
                    var cameraMode = serializedObject.FindAirshipProperty("characterCameraMode");
                    
                    PropertyField(cameraMode);
                    EditorGUI.indentLevel += 1;
                    if (cameraMode.enumValue.Name == "Fixed") {
                        // PropertyField("fixedXOffset");
                        // PropertyField("fixedYOffset");
                        // PropertyField("fixedZOffset");
                        // PropertyField("fixedMinRotX");
                        // PropertyField("fixedMaxRotX");
                        
                        PropertyFields("fixedXOffset", "fixedYOffset", "fixedZOffset", "fixedMinRotX", "fixedMaxRotX");
                    }
                    if (cameraMode.enumValue.Name is "Orbit" or "OrbitFixed") {
                        // PropertyField("orbitRadius");
                        // PropertyField("orbitYOffset");
                        // PropertyField("orbitMinRotX");
                        // PropertyField("orbitMaxRotX");
                        
                        PropertyFields("orbitRadius", "orbitYOffset", "orbitMinRotX", "orbitMaxRotX");
                    }
                
                    EditorGUI.indentLevel -= 1;
                }
            } else if (selectedTabIndex == 2) {
                // UI
                PropertyField("showChat");
                var visibility = serializedObject.FindAirshipProperty("inventoryVisibility");
                PropertyField(visibility);
                if (visibility.enumValue.Name != "Never") {
                    PropertyField("inventoryUIPrefab");
                }
            }
        }
        AirshipEditorGUI.EndTabs();
    }
}
#endif