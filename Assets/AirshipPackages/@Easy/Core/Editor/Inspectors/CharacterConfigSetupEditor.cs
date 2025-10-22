using System;
using UnityEditor;
using UnityEngine;
#if AIRSHIP_EDITOR_API

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
                    if (cameraMode.enumValue.name == "Fixed") {
                        PropertyFields("fixedXOffset", "fixedYOffset", "fixedZOffset", "fixedMinRotX", "fixedMaxRotX");
                    }
                    if (cameraMode.enumValue.name is "Orbit" or "OrbitFixed") {
                        PropertyFields("orbitRadius", "orbitYOffset", "orbitMinRotX", "orbitMaxRotX");
                    }
                
                    EditorGUI.indentLevel -= 1;
                }
            } else if (selectedTabIndex == 2) {
                // UI
                PropertyField("showChat");
                var visibility = serializedObject.FindAirshipProperty("inventoryVisibility");
                PropertyField(visibility);
                if (visibility.enumValue.name != "Never") {
                    PropertyField("inventoryUIPrefab");
                }
            }
        }
        AirshipEditorGUI.EndTabs();
    }
}
#endif