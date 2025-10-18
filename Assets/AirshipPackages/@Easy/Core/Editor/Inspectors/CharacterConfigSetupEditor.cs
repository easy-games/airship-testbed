using UnityEditor;
using UnityEngine;
#if AIRSHIP_EDITOR_API
[AirshipEditor("CharacterConfigSetup")]
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

                    AirshipEditorGUI.PropertyField(cameraMode);
                    EditorGUI.indentLevel += 1;
                    if (cameraMode.enumValue.Name == "Fixed") {
                        PropertyField("fixedXOffset");
                        PropertyField("fixedYOffset");
                        PropertyField("fixedZOffset");
                        PropertyField("fixedMinRotX");
                        PropertyField("fixedMaxRotX");
                    }
                    if (cameraMode.enumValue.Name is "Orbit" or "OrbitFixed") {
                        PropertyField("orbitRadius");
                        PropertyField("orbitYOffset");
                        PropertyField("orbitMinRotX");
                        PropertyField("orbitMaxRotX");
                    }
                
                    EditorGUI.indentLevel -= 1;
                }
            } else if (selectedTabIndex == 2) {
                // UI
                PropertyField("showChat");
                var visibility = serializedObject.FindAirshipProperty("inventoryVisibility");
                AirshipEditorGUI.PropertyField(visibility);
                if (visibility.enumValue.Name != "Never") {
                    PropertyField("inventoryUIPrefab");
                }
            }
        }
        AirshipEditorGUI.EndTabs();
    }
}
#endif