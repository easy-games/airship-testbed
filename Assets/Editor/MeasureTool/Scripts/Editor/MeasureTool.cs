namespace EpsilonDelta
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using UnityEditor;
    using UnityEditor.EditorTools;
    using UnityEditor.ShortcutManagement;
    using UnityEngine;
#if !UNITY_2021_2_OR_NEWER
    using UnityEditor.Experimental.SceneManagement; // Out of experimental in 2021.2
#else
    using UnityEditor.SceneManagement;
#endif
    using UnityEngine.Rendering;
#if UNITY_2019 || UNITY_2020_1
    using ToolManager = UnityEditor.EditorTools.EditorTools; // Unity 2020.2 changed naming from EditorTools to ToolManager
#endif
    using static UnityEngine.Mathf;
    using static Extensions;

    // v1.4.2
    // Tagging a class with the EditorTool attribute and no target type registers a global tool.
    // Global tools are valid for any selection, and are accessible through the top left toolbar in the editor.
    [EditorTool("Measure Tool")]
    public class MeasureTool : EditorTool
    {
#region Fields, properties, events
        private static string PrefId => PlayerSettings.companyName + "." + PlayerSettings.productName + ".EpsilonDelta.MeasureTool.";
        private static bool PersistentTool = false;

        private static GUIStyle xAxisStyle = new GUIStyle();
        private static GUIStyle yAxisStyle = new GUIStyle();
        private static GUIStyle zAxisStyle = new GUIStyle();
        private static GUIStyle uiRelativeStyle = new GUIStyle();
        private static GUIStyle distanceStyle = new GUIStyle();
        private static GUIStyle positionStyle = new GUIStyle();
        private static GUIStyle windowStyle = new GUIStyle();
        private static GUIStyle windowHeaderStyle = new GUIStyle();
        private static GUIStyle headerButtonStyle = new GUIStyle();
        private static GUIStyle foldoutStyle = new GUIStyle();
        private static Color boxColor = new Color(0.7f, 0.7f, 0.7f, 0.95f);
        private static int labelFontSize = 20;
        private static int outlineWidth = 0;
        private static Color uiRelativeColor = new Color(1, 0.6f, 0);
        public static Color positionColor = Color.grey;
        private static bool areStylesSet = false;

        private static readonly Vector3 right = Vector3.right;
        private static readonly Vector3 up = Vector3.up;
        private static readonly Vector3 forward = Vector3.forward;

        [SerializeField] private Texture2D toolIcon;
        [SerializeField] private Texture2D toolIconPro;
        private GUIContent iconContent;

        private static bool showSceneViewWindow = true;
        private static bool showSettings = false;
        private static Vector2 windowPosition = new Vector2(60, 0);
        private static Vector2 windowOffset;
        private static Rect mainRect;
        private static Rect settingsRect;
        private static bool mouseDown = false;

        private static Transform[] activeTransformsInScene = Array.Empty<Transform>();
        private enum MeasureGroup { All = 0, Selected = 1, SelectedWithChildren = 2}
        private static MeasureGroup measureGroup = MeasureGroup.Selected;

        private static bool measureDistance = false;
        private static bool showPosition = false;
        private static bool showLocalPosition = false;
        private static bool measureCollider = true;
        private static bool measureCollider2D = true;
        private static bool measureMesh = true;
        private static bool measureSkinnedMesh = false;
        private static bool measureUI = true;
        private static bool measureOther = true;
        private static bool measureMisc = false;
        private static bool measureTerrainMesh = false;
        private static bool measureTerrainCollider = true;
        private static bool uiUnscaled = true;
        private static bool anchoredPosition = false;
        private static bool uiRelative = true;

        private static bool colliderFoldout = false;
        private static bool collider2DFoldout = false;
        private static bool meshFoldout = false;
        private static bool uiFoldout = false;
        private static bool otherFoldout = true;

        private static bool colliderLocal = false;
        private static bool collider2DLocal = false;
        private static bool meshLocal = false;
        private static bool uiLocal = true;

        private static bool colliderCompound = false;
        private static bool collider2DCompound = false;
        private static bool meshCompound = false;
        private static bool uiCompound = false;
        private static bool totalCompound = false;

        private static bool preferGroup = false;
        private static bool preferMeshOverCollider = true; // false means we prefer Collider over Mesh

        private static bool drawWireCube = false;

        private static bool drawXLine = true;
        private static bool drawYLine = true;
        private static bool drawZLine = true;

        private static float lineWidth = 5f;
        private static int precision = 3;
        private static float zeroThreshold = 0.0005f;

        private static Dictionary<Component, CachedMeasure> cachedCollider2Ds = new Dictionary<Component, CachedMeasure>();
        private static Dictionary<Component, CachedMeasure> cachedColliders = new Dictionary<Component, CachedMeasure>();
        private static Dictionary<Component, CachedMeasure> cachedMeshes = new Dictionary<Component, CachedMeasure>();
        private static Dictionary<Component, CachedMeasure> cachedTerrains = new Dictionary<Component, CachedMeasure>();
        private static Dictionary<Component, CachedMeasure> cachedUIs = new Dictionary<Component, CachedMeasure>();
        private static Dictionary<Component, CachedMeasure> cachedMiscellaneous = new Dictionary<Component, CachedMeasure>();

        public override GUIContent toolbarIcon
        {
            get
            {
                if (iconContent == null || iconContent.image == null)
                {
                    Texture2D icon;
                    //  Icon dimensions to match Unity's icon == 19x18 px
                    if (EditorGUIUtility.isProSkin && toolIconPro == null)
                    {
                        toolIconPro = AssetDatabase.LoadAssetAtPath<Texture2D>(GetMeasureToolFolderPath() + "/Icons/MeasureToolIconPro.png");
                    }
                    if (!EditorGUIUtility.isProSkin && toolIcon == null)
                    {
                        toolIcon = AssetDatabase.LoadAssetAtPath<Texture2D>(GetMeasureToolFolderPath() + "/Icons/MeasureToolIcon.png");
                    }
                    icon = EditorGUIUtility.isProSkin ? toolIconPro : toolIcon;
                    if (icon != null)
                        iconContent = new GUIContent(icon, "Measure Tool");
                    else
                        iconContent = new GUIContent("Measure Tool", "Measure Tool");
                }
                return iconContent;
            }
        }
#endregion

#region Setup methods
        [InitializeOnLoadMethod]
        private static void Init()
        {
            LoadPreferences();
            SceneView.duringSceneGui += OnSceneGUI;
            TogglePersistentMeasureTool(PersistentTool);
        }

        private void OnEnable() // EditorTool class inherits from ScriptableObject
        {
            ToolManager.activeToolChanged += OnActiveToolChanged;
            ToolManager.activeToolChanging += OnActiveToolChanging;
            OnActiveToolChanged();
        }

        private void OnDisable() // EditorTool class inherits from ScriptableObject
        {
            ToolManager.activeToolChanged -= OnActiveToolChanged;
            ToolManager.activeToolChanging -= OnActiveToolChanging;
            SceneView.duringSceneGui -= OnSceneGUI;
            SavePreferences();
        }

        private void OnActiveToolChanged()
        {
            if (ToolManager.activeToolType == typeof(MeasureTool) && !PersistentTool) // If active tool is now Measure Tool
            {
                if (measureGroup == MeasureGroup.All) activeTransformsInScene = FindAllTransforms();
                Selection.selectionChanged -= OnSelectionChanged;
                EditorApplication.hierarchyChanged -= OnHierarchyChanged;
                Selection.selectionChanged += OnSelectionChanged;
                EditorApplication.hierarchyChanged += OnHierarchyChanged;
            }
        }

        private void OnActiveToolChanging()
        {
            if (ToolManager.activeToolType == typeof(MeasureTool) && !PersistentTool) // If Measure Tool is about to change to something else
            {
                Selection.selectionChanged -= OnSelectionChanged;
                EditorApplication.hierarchyChanged -= OnHierarchyChanged;
            }
        }

        private static void OnSelectionChanged()
        {
            if (measureGroup == MeasureGroup.Selected || measureGroup == MeasureGroup.SelectedWithChildren ) ClearCachedMeasures();
        }

        private static void OnHierarchyChanged()
        {
            if (measureGroup == MeasureGroup.All) activeTransformsInScene = FindAllTransforms();
            ClearCachedMeasures();
            SceneView.RepaintAll();
        }

        [Shortcut("Measure Tool", KeyCode.A, ShortcutModifiers.Alt)]
        public static void ShortcutMeasureTool()
        {
            ToolManager.SetActiveTool(typeof(MeasureTool));
        }

        [MenuItem("Tools/Measure Tool Persistent &S")]
        public static void TogglePersistentMeasureTool()
        {
            TogglePersistentMeasureTool(!PersistentTool);
        }

        private static void TogglePersistentMeasureTool(bool on)
        {
            PersistentTool = on;
            if (PersistentTool)
            {
                if (measureGroup == MeasureGroup.All) activeTransformsInScene = FindAllTransforms();
                Selection.selectionChanged -= OnSelectionChanged;
                EditorApplication.hierarchyChanged -= OnHierarchyChanged;
                Selection.selectionChanged += OnSelectionChanged;
                EditorApplication.hierarchyChanged += OnHierarchyChanged;
            }
            else if (ToolManager.activeToolType != typeof(MeasureTool))
            {
                Selection.selectionChanged -= OnSelectionChanged;
                EditorApplication.hierarchyChanged -= OnHierarchyChanged;
            }
            SavePreferences();
            SceneView.RepaintAll();
        }
#endregion

#region UnityEditor call methods
        private static void OnSceneGUI(SceneView sceneView)
        {
            if (PersistentTool)
            {
                Measure(SceneView.focusedWindow);
                DrawSceneViewWindow(SceneView.focusedWindow); // Called every event
            }
        }

        // EditorTool method invoked by Unity (equivalent of OnSceneGUI for non-persistent tool)
        public override void OnToolGUI(EditorWindow window)
        {
            if (!PersistentTool)
            {
                Measure(window);
                DrawSceneViewWindow(window);
            }
        }
#endregion

#region Main methods
        private static void DrawSceneViewWindow(EditorWindow window)
        {
            Event e = Event.current;
            if (e.type == EventType.Layout) // Layout is the first event
            {
                ClearCachedMeasures();
            }

            if ((e.type == EventType.MouseUp && e.button == 0) || (e.isMouse && e.button != 0) || (e.type == EventType.MouseLeaveWindow))
            {
                mouseDown = false;
            }

            SetUpGUIStyles();

            Handles.BeginGUI(); // Draw this while also drawing handles
            Vector2 mousePosition = e.mousePosition;
            Rect areaRect = new Rect(windowPosition.x, windowPosition.y, 240, 550);

            GUILayout.BeginArea(areaRect);
            EditorGUILayout.BeginHorizontal();
            mainRect = EditorGUILayout.BeginVertical(GUILayout.MinWidth(1));
            GUI.color = boxColor;
            GUI.Box(mainRect, GUIContent.none, windowStyle);
            GUI.color = Color.white;

            Rect headerRect = EditorGUILayout.BeginHorizontal();

            if (GUI.Button(new Rect(0, 0, 20, 20), showSceneViewWindow ? "-" : "+", headerButtonStyle))
            {
                showSceneViewWindow = !showSceneViewWindow;
                if (e.modifiers == EventModifiers.Alt)
                {
                    meshFoldout = showSceneViewWindow;
                    colliderFoldout = showSceneViewWindow;
                    collider2DFoldout = showSceneViewWindow;
                    uiFoldout = showSceneViewWindow;
                    otherFoldout = showSceneViewWindow;
                }
                SavePreferences();
                SceneView.RepaintAll();
            }
            Rect measureHeader = new Rect(20, 0, 70, 20); // We have to catch events before GUI.Button, because button uses (consumes) events
            Rect settingsHeader = new Rect(118, 0, 110, 20);
            if (e.type == EventType.MouseDown && e.button == 0 && (measureHeader.Contains(e.mousePosition) || settingsHeader.Contains(e.mousePosition)))
            {
                mouseDown = true;
                windowOffset = mousePosition - windowPosition;
            }
            if (e.type == EventType.MouseDrag && e.button == 0 && mouseDown)
            {
                windowPosition = mousePosition - windowOffset;
                SceneView.RepaintAll();
            }

            ClampWindowToSceneView();

            GUI.Button(measureHeader, "Measure " + (PersistentTool ? "P" : "T"), windowHeaderStyle); // Only button will catch events, label does not
            GUILayoutUtility.GetRect(90, 20);
            EditorGUI.BeginChangeCheck();
            showSettings = GUI.Toggle(new Rect(90, 0, 20, 20), showSettings, EditorGUIUtility.IconContent("d_Settings"), EditorStyles.label);
            if (EditorGUI.EndChangeCheck())
            {
                SavePreferences();
                SceneView.RepaintAll();
            }
            GUILayoutUtility.GetRect(20, 20);
            EditorGUILayout.EndHorizontal();

            if (showSceneViewWindow)
            {
                EditorGUI.BeginChangeCheck();
                GUILayout.BeginHorizontal();
                MeasureGroup measureGroupOldValue = measureGroup;
                GUIContent[] measureOnlySelectedOptions = new GUIContent[] { new GUIContent("All"), new GUIContent("Sel", "Selected only"), new GUIContent("SwC", "Selected with their children") };
                measureGroup = (MeasureGroup)GUILayout.Toolbar((int)measureGroup, measureOnlySelectedOptions, EditorStyles.miniButtonMid);
                GUILayout.EndHorizontal();
                bool checkObjectCount = EditorGUI.EndChangeCheck();

                EditorGUI.BeginChangeCheck();

                (measureMesh, meshFoldout) = GUIExtensions.ToggleFoldout(measureMesh, meshFoldout, "Mesh", foldoutStyle);
                if (meshFoldout)
                {
                    bool[] toggles = GUIExtensions.ToggleMenu(new bool[]{ meshLocal, meshCompound, measureSkinnedMesh, measureTerrainMesh }, new string[] { "Local", "Compound", "Skinned", "Terrain" });
                    meshLocal = toggles[0]; meshCompound = toggles[1]; measureSkinnedMesh = toggles[2]; measureTerrainMesh = toggles[3];
                }

                (measureCollider, colliderFoldout) = GUIExtensions.ToggleFoldout(measureCollider, colliderFoldout, "Collider", foldoutStyle);
                if (colliderFoldout)
                {
                    bool[] toggles = GUIExtensions.ToggleMenu(new bool[] { colliderLocal, colliderCompound, measureTerrainCollider }, new string[] { "Local", "Compound", "Terrain" });
                    colliderLocal = toggles[0]; colliderCompound = toggles[1]; measureTerrainCollider = toggles[2];
                }

                (measureCollider2D, collider2DFoldout) = GUIExtensions.ToggleFoldout(measureCollider2D, collider2DFoldout, "Collider2D", foldoutStyle);
                if (collider2DFoldout)
                {
                    bool[] toggles = GUIExtensions.ToggleMenu(new bool[] { collider2DLocal, collider2DCompound}, new string[] { "Local", "Compound" });
                    collider2DLocal = toggles[0]; collider2DCompound = toggles[1];
                }

                (measureUI, uiFoldout) = GUIExtensions.ToggleFoldout(measureUI, uiFoldout, "UI", foldoutStyle);
                if (uiFoldout)
                {
                    bool[] toggles = GUIExtensions.ToggleMenu(new bool[] { uiLocal, uiUnscaled, anchoredPosition, uiRelative, uiCompound },
                        new string[] { "Local", "Unscaled", "Anchor Pos", "Relative", "Compound" },
                        new string[] { "", "Show unscaled sizes - in root canvas coordinates (useful when using CanvasScaler)", "Show anchored position (and hide world/local position if ticked)", "", "" });
                    uiLocal = toggles[0]; uiUnscaled = toggles[1]; anchoredPosition = toggles[2]; uiRelative = toggles[3]; uiCompound = toggles[4];
                }

                EditorGUI.BeginChangeCheck();
                bool measureOtherOldValue = measureOther;
                bool measureDistanceOldValue = measureDistance;

                (measureOther, otherFoldout) = GUIExtensions.ToggleFoldout(measureOther, otherFoldout, "Other", foldoutStyle);
                checkObjectCount |= EditorGUI.EndChangeCheck();
                if (otherFoldout)
                {
                    EditorGUI.BeginChangeCheck();
                    bool[] toggles = GUIExtensions.ToggleMenu(new bool[] { measureDistance }, new string[] { "Distance" });
                    measureDistance = toggles[0];
                    if (EditorGUI.EndChangeCheck()) checkObjectCount = true;

                    toggles = GUIExtensions.ToggleMenu(new bool[] { showPosition}, new string[] { "Position"}, new string[] {""});
                    showPosition = toggles[0];
                    if (showPosition)
                    {
                        GUILayout.BeginHorizontal();
                        GUILayout.Space(22);
                        string[] positionSelectedOptions = new string[] { "World", "Local" };
                        showLocalPosition = GUILayout.Toolbar(showLocalPosition ? 1 : 0,
                            positionSelectedOptions, EditorStyles.miniButtonMid, GUILayout.MaxWidth(95)) == 1;
                        GUILayout.EndHorizontal();
                    }

                    toggles = GUIExtensions.ToggleMenu(new bool[] {measureMisc }, new string[] {"Misc" }, new string[] {"Camera Frustum, Particles" });
                    measureMisc = toggles[0];
                }
                if (checkObjectCount)
                {
                    if (measureGroup == MeasureGroup.All)
                    {
                        activeTransformsInScene = FindAllTransforms();
                        if (activeTransformsInScene.Length > 200 || (measureOther && measureDistance && activeTransformsInScene.Length > 50))
                        {
                            if (!EditorUtility.DisplayDialog("MeasureTool", "Measuring so many Gameobjects may significantly slow down editor.",
                                "Proceed", "Cancel", DialogOptOutDecisionType.ForThisMachine, "EpsilonDelta.slowDownWarning"))
                            {
                                measureGroup = measureGroupOldValue;
                                measureDistance = measureDistanceOldValue;
                                measureOther = measureOtherOldValue;
                            }
                            ClearCachedMeasures();
                            SavePreferences();
                            SceneView.RepaintAll();
                            GUIUtility.ExitGUI(); // This will prevent of correct execution of next lines
                        }
                    }
                    ClearCachedMeasures();
                    SavePreferences();
                    SceneView.RepaintAll();
                }

                totalCompound = GUILayout.Toggle(totalCompound, "Compound All");

                GUILayout.BeginHorizontal();
                GUI.contentColor = new Color(1f, 0.4f, 0.4f, 1);
                drawXLine = GUILayout.Toggle(drawXLine, "X", EditorStyles.miniButtonLeft);
                GUI.contentColor = Color.green;
                drawYLine = GUILayout.Toggle(drawYLine, "Y", EditorStyles.miniButtonMid);
                GUI.contentColor = Color.blue;
                drawZLine = GUILayout.Toggle(drawZLine, "Z", EditorStyles.miniButtonRight);
                GUI.contentColor = Color.white;
                GUILayout.EndHorizontal();

                GUILayout.BeginHorizontal();
                GUILayout.Label("Precision:");
                if (GUILayout.Button("-", EditorStyles.miniButtonMid, GUILayout.MinWidth(20)))
                {
                    precision = Clamp(--precision, 0, 6);
                    zeroThreshold = Pow(10, -precision) * 0.5f;
                }
                if (GUILayout.Button("+", EditorStyles.miniButtonMid, GUILayout.MinWidth(20)))
                {
                    precision = Clamp(++precision, 0, 6);
                    zeroThreshold = Pow(10, -precision) * 0.5f;
                }
                GUILayout.EndHorizontal();

                if (EditorGUI.EndChangeCheck())
                {
                    ClearCachedMeasures();
                    SceneView.RepaintAll();
                    if (measureGroup == MeasureGroup.All) activeTransformsInScene = FindAllTransforms();
                    SavePreferences();
                }
            }
            EditorGUILayout.EndVertical();

            if (showSettings)
            {
                EditorGUI.BeginChangeCheck();
                GUILayout.Space(4);
                settingsRect = EditorGUILayout.BeginVertical(GUILayout.MaxWidth(110));
                GUI.color = boxColor;
                GUI.Box(settingsRect, GUIContent.none, windowStyle);
                GUI.color = Color.white;
                GUI.Button(settingsHeader, "Settings", windowHeaderStyle); // Only button will catch events, label does not
                GUILayoutUtility.GetRect(110, 20);

                EditorGUI.BeginChangeCheck();
                GUILayout.BeginHorizontal();
                GUILayout.Label("Font Size", GUILayout.ExpandWidth(false));
                labelFontSize = RoundToInt(GUILayout.HorizontalSlider(labelFontSize, 10, 40, GUILayout.ExpandWidth(true), GUILayout.MaxWidth(43)));
                GUILayout.EndHorizontal();

                GUILayout.BeginHorizontal();
                GUILayout.Label("Outline", GUILayout.ExpandWidth(false), GUILayout.MinWidth(57));
                outlineWidth = RoundToInt(GUILayout.HorizontalSlider(outlineWidth, 0, 2, GUILayout.ExpandWidth(true), GUILayout.MaxWidth(43)));
                GUILayout.EndHorizontal();

                GUILayout.BeginHorizontal();
                GUILayout.Label("Position Color", GUILayout.ExpandWidth(false));
                positionColor = EditorGUILayout.ColorField(GUIContent.none, positionColor, false, true, false, GUILayout.MaxWidth(18));
                GUILayout.Space(3);
                GUILayout.EndHorizontal();
                if (EditorGUI.EndChangeCheck()) areStylesSet = false;

                GUILayout.BeginHorizontal();
                GUILayout.Space(3);
                drawWireCube = GUILayout.Toggle(drawWireCube, "Wire Cube");
                GUILayout.EndHorizontal();
                preferGroup = GUILayout.Toggle(preferGroup, new GUIContent("Prefer", "When both are present, should only one measure be displayed?"));
                if (preferGroup)
                {
                    GUILayout.BeginHorizontal();
                    GUILayout.Space(18);
                    string[] preferGroupSelectedOptions = new string[] { "Mesh", "Collider" };
                    preferMeshOverCollider = GUILayout.Toolbar(preferMeshOverCollider ? 0 : 1,
                        preferGroupSelectedOptions, EditorStyles.miniButtonMid, GUILayout.MaxWidth(95)) == 0;
                    GUILayout.EndHorizontal();
                }
                GUILayout.Space(5);
                EditorGUILayout.EndVertical();
                if (EditorGUI.EndChangeCheck())
                {
                    ClearCachedMeasures();
                    SceneView.RepaintAll();
                    if (measureGroup == MeasureGroup.All) activeTransformsInScene = FindAllTransforms();
                    SavePreferences();
                }
                ClampWindowToSceneView();
            }
            EditorGUILayout.EndHorizontal();
            GUILayout.EndArea();
            Handles.EndGUI();
        }

#region Measuring
        private static void Measure(EditorWindow window)
        {
            if (Event.current.type != EventType.Repaint) return;
            Transform[] measuredTransforms;
            if (measureGroup == MeasureGroup.Selected)
            {
                measuredTransforms = Selection.GetTransforms(SelectionMode.ExcludePrefab | SelectionMode.Editable);
            }
            else if (measureGroup == MeasureGroup.SelectedWithChildren)
            {
                measuredTransforms = Selection.GetTransforms(SelectionMode.Deep | SelectionMode.ExcludePrefab | SelectionMode.Editable);
            }
            else
            {
                measuredTransforms = activeTransformsInScene;
            }

            foreach (Transform t in measuredTransforms)
            {
                if (!t || !t.gameObject.activeInHierarchy) continue;

                if (measureOther && measureDistance && measuredTransforms.Length > 1) MeasureDistances(t, measuredTransforms);
                if (preferGroup)
                {
                    if (preferMeshOverCollider)
                    {
                        bool hasMesh = false;
                        if (measureMesh) hasMesh = MeasureMesh(t, meshLocal);
                        if (measureMesh && measureTerrainMesh) hasMesh = hasMesh | MeasureTerrain(t);
                        if (measureUI) hasMesh = hasMesh | MeasureUI(t, uiLocal);
                        if (!hasMesh)
                        {
                            if (measureCollider) MeasureCollider(t, colliderLocal);
                            if (measureCollider2D) MeasureCollider2D(t, collider2DLocal);
                        }
                    }
                    else
                    {
                        bool hasCollider = false;
                        if (measureCollider) hasCollider = MeasureCollider(t, colliderLocal);
                        if (measureCollider2D) hasCollider = MeasureCollider2D(t, collider2DLocal);
                        if (!hasCollider)
                        {
                            if (measureMesh) MeasureMesh(t, meshLocal);
                            if (measureMesh && measureTerrainMesh) MeasureTerrain(t);
                            if (measureUI) MeasureUI(t, uiLocal);
                        }
                    }
                }
                else
                {
                    if (measureMesh) MeasureMesh(t, meshLocal);
                    if (measureMesh && measureTerrainMesh) MeasureTerrain(t);
                    if (measureCollider) MeasureCollider(t, colliderLocal);
                    if (measureCollider2D) MeasureCollider2D(t, collider2DLocal);
                    if (measureUI) MeasureUI(t, uiLocal);
                }
                if (measureOther && measureMisc)
                {
                    MeasureParticleSystem(t);
                    MeasureCamera(t);
                }
                if (anchoredPosition && t is RectTransform rt) DrawPosition(rt.anchoredPosition3D, t.position);
                else if (measureOther && showPosition)
                {
                    Vector3 labelPosition = t.position;
                    Vector3 position = showLocalPosition ? t.localPosition : labelPosition;
                    DrawPosition(position, labelPosition);
                }
            }

            if (meshCompound) MeasureCompoundVolume(cachedMeshes);
            if (colliderCompound) MeasureCompoundVolume(cachedColliders);
            if (collider2DCompound) MeasureCompoundVolume(cachedCollider2Ds);
            if (uiCompound) MeasureCompoundVolume(cachedUIs);

            if (totalCompound)
            {
                HashSet<CachedMeasure> combinedMeasures = new HashSet<CachedMeasure>();
                if (measureCollider) combinedMeasures.UnionWith(cachedColliders.Values);
                if (measureCollider2D) combinedMeasures.UnionWith(cachedCollider2Ds.Values);
                if (measureMesh)
                {
                    combinedMeasures.UnionWith(cachedMeshes.Values);
                    if (measureTerrainMesh) combinedMeasures.UnionWith(cachedTerrains.Values);
                }
                if (measureUI) combinedMeasures.UnionWith(cachedUIs.Values);
                if (measureMisc) combinedMeasures.UnionWith(cachedMiscellaneous.Values);

                MeasureTotalCompoundVolume(combinedMeasures);
            }
        }

        private static bool MeasureCollider(Transform t, bool local = false)
        {
            Collider[] colliders = t.GetComponents<Collider>().Where(c => c.enabled).ToArray();
            bool hasCollider = false;
            foreach (Collider collider in colliders)
            {
                if (collider is WheelCollider) continue;
                if (!measureTerrainCollider && collider is TerrainCollider) continue;
                hasCollider = true;

                CachedMeasure cachedCollider;
                if (collider is MeshCollider mc && mc.sharedMesh)
                {
                    cachedCollider = MeasureVertices(mc.sharedMesh.vertices, t, local);
                }
                else
                {
                    Vector3 globalExtents = collider.bounds.extents;
                    Vector3 globalCenter = collider.bounds.center;
                    Vector3 center = collider.bounds.center;
                    Vector3 extents = collider.bounds.extents;

                    Vector3[] xLine = new Vector3[2];
                    Vector3[] yLine = new Vector3[2];
                    Vector3[] zLine = new Vector3[2];

                    if (local && !(collider is TerrainCollider))
                    {
                        if (collider is BoxCollider bc)
                        {
                            extents = bc.size / 2f;
                            xLine = new Vector3[2] { extents.x * t.lossyScale.x * -right, extents.x * t.lossyScale.x * right };
                            yLine = new Vector3[2] { extents.y * t.lossyScale.y * -up, extents.y * t.lossyScale.y * up };
                            zLine = new Vector3[2] { extents.z * t.lossyScale.z * -forward, extents.z * t.lossyScale.z * forward };
                        }
                        if (collider is SphereCollider sc)
                        {
                            extents = Vector3.one * sc.radius;
                            float scale = Max(Abs(t.lossyScale.x), Abs(t.lossyScale.y), Abs(t.lossyScale.z));
                            xLine = new Vector3[2] { extents.x * scale * -right, right * extents.x * scale };
                            yLine = new Vector3[2] { extents.y * scale * -up, extents.y * scale * up };
                            zLine = new Vector3[2] { extents.z * scale * -forward, extents.z * scale * forward };
                        }
                        if (collider is CapsuleCollider cc)
                        {
                            if (cc.direction == 0)
                            {
                                extents = new Vector3
                                    (Max(cc.radius * Max(Abs(t.lossyScale.y), Abs(t.lossyScale.z)), (cc.height / 2f) * Abs(t.lossyScale.x)),
                                    cc.radius * Max(Abs(t.lossyScale.y), Abs(t.lossyScale.z)),
                                    cc.radius * Max(Abs(t.lossyScale.y), Abs(t.lossyScale.z)));
                            }
                            else if (cc.direction == 1)
                            {
                                extents = new Vector3
                                    (cc.radius * Max(Abs(t.lossyScale.x), Abs(t.lossyScale.z)),
                                    Max(cc.radius * Max(Abs(t.lossyScale.x), Abs(t.lossyScale.z)), (cc.height / 2f) * Abs(t.lossyScale.y)),
                                    cc.radius * Max(Abs(t.lossyScale.x), Abs(t.lossyScale.z)));
                            }
                            else
                            {
                                extents = new Vector3
                                    (cc.radius * Max(Abs(t.lossyScale.x), Abs(t.lossyScale.y)),
                                    cc.radius * Max(Abs(t.lossyScale.x), Abs(t.lossyScale.y)),
                                    Max(cc.radius * Max(Abs(t.lossyScale.x), Abs(t.lossyScale.y)), (cc.height / 2f) * Abs(t.lossyScale.z)));
                            }

                            xLine = new Vector3[2] { (-right * extents.x), (right * extents.x) };
                            yLine = new Vector3[2] { (-up * extents.y), (up * extents.y) };
                            zLine = new Vector3[2] { (-forward * extents.z), (forward * extents.z) };
                        }

                        xLine = new Vector3[2] { center + t.TransformDirection(xLine[0]), center + t.TransformDirection(xLine[1]) };
                        yLine = new Vector3[2] { center + t.TransformDirection(yLine[0]), center + t.TransformDirection(yLine[1]) };
                        zLine = new Vector3[2] { center + t.TransformDirection(zLine[0]), center + t.TransformDirection(zLine[1]) };
                    }
                    else
                    {
                        xLine = new Vector3[2] { (center - right * extents.x), (center + right * extents.x) };
                        yLine = new Vector3[2] { (center - up * extents.y), (center + up * extents.y) };
                        zLine = new Vector3[2] { (center - forward * extents.z), (center + forward * extents.z) };
                    }

                    Vector3 finalSize = new Vector3((xLine[1] - xLine[0]).magnitude, (yLine[1] - yLine[0]).magnitude, (zLine[1] - zLine[0]).magnitude);
                    cachedCollider = new CachedMeasure(xLine, yLine, zLine, finalSize, globalExtents, globalCenter, t.position);

                    cachedColliders[collider] = cachedCollider;
                }

                if (drawWireCube) DrawWireCube(cachedCollider);
                DrawVolumeLines(cachedCollider);
            }
            return hasCollider;
        }

        private static bool MeasureCollider2D(Transform t, bool local = false)
        {
            Collider2D[] collider2Ds = t.GetComponents<Collider2D>().Where(c => c.enabled).ToArray();
            foreach (Collider2D collider2D in collider2Ds)
            {
                CachedMeasure cachedCollider2D;
                Vector3 globalExtents = collider2D.bounds.extents;
                Vector3 globalCenter = collider2D.bounds.center;
                Vector3 center = collider2D.bounds.center;
                Vector3 extents = collider2D.bounds.extents;

                Vector3[] xLine = new Vector3[2];
                Vector3[] yLine = new Vector3[2];

                if (local && !(collider2D is UnityEngine.Tilemaps.TilemapCollider2D) && !(collider2D is CompositeCollider2D))
                {
                    if (collider2D is BoxCollider2D bc)
                    {
                        extents = bc.size / 2f;
                        Vector3 offset = bc.offset;
                        xLine = new Vector3[2] { -right * extents.x + offset, right * extents.x + offset };
                        yLine = new Vector3[2] { -up * extents.y + offset, up * extents.y + offset };

                        xLine = new Vector3[2] { t.TransformPoint(xLine[0]), t.TransformPoint(xLine[1]) };
                        yLine = new Vector3[2] { t.TransformPoint(yLine[0]), t.TransformPoint(yLine[1]) };
                    }
                    if (collider2D is PolygonCollider2D pc)
                    {
                        float minX, maxX, minY, maxY;
                        minX = Min(pc.points.Select(v => v.x).ToArray()); maxX = Max(pc.points.Select(v => v.x).ToArray());
                        minY = Min(pc.points.Select(v => v.y).ToArray()); maxY = Max(pc.points.Select(v => v.y).ToArray());

                        center = new Vector3((minX + maxX) / 2f, (minY + maxY) / 2f, 0);
                        extents = new Vector3((maxX - minX) / 2f, (maxY - minY) / 2f, 0);
                        Vector3 offset = pc.offset;

                        xLine = new Vector3[2] { -right * extents.x, right * extents.x };
                        yLine = new Vector3[2] { -up * extents.y, up * extents.y };

                        xLine = new Vector3[2] { t.position + t.TransformVector(xLine[0] + offset + center), t.position + t.TransformVector(xLine[1] + offset + center) };
                        yLine = new Vector3[2] { t.position + t.TransformVector(yLine[0] + offset + center), t.position + t.TransformVector(yLine[1] + offset + center) };
                    }
                    if (collider2D is EdgeCollider2D ec)
                    {
                        float minX, maxX, minY, maxY;
                        minX = Min(ec.points.Select(v => v.x).ToArray()); maxX = Max(ec.points.Select(v => v.x).ToArray());
                        minY = Min(ec.points.Select(v => v.y).ToArray()); maxY = Max(ec.points.Select(v => v.y).ToArray());

                        center = new Vector3((minX + maxX) / 2f, (minY + maxY) / 2f, 0);
                        extents = new Vector3((maxX - minX) / 2f, (maxY - minY) / 2f, 0);
                        Vector3 offset = ec.offset;

                        xLine = new Vector3[2] { -right * extents.x, right * extents.x };
                        yLine = new Vector3[2] { -up * extents.y, up * extents.y };

                        xLine = new Vector3[2] { t.position + t.TransformVector(xLine[0] + offset + center), t.position + t.TransformVector(xLine[1] + offset + center) };
                        yLine = new Vector3[2] { t.position + t.TransformVector(yLine[0] + offset + center), t.position + t.TransformVector(yLine[1] + offset + center) };
                    }
                    if (collider2D is CircleCollider2D cc)
                    {
                        extents = Vector3.one * cc.radius;
                        float scale = Max(Abs(t.lossyScale.x), Abs(t.lossyScale.y));
                        xLine = new Vector3[2] { -right * extents.x * scale, right * extents.x * scale };
                        yLine = new Vector3[2] { -up * extents.y * scale, up * extents.y * scale };

                        xLine = new Vector3[2] { center + Quaternion.Euler(0, 0, t.rotation.eulerAngles.z) * xLine[0], center + Quaternion.Euler(0, 0, t.rotation.eulerAngles.z) * xLine[1] };
                        yLine = new Vector3[2] { center + Quaternion.Euler(0, 0, t.rotation.eulerAngles.z) * yLine[0], center + Quaternion.Euler(0, 0, t.rotation.eulerAngles.z) * yLine[1] };
                    }
                    if (collider2D is CapsuleCollider2D cac)
                    {
                        if (cac.direction == CapsuleDirection2D.Vertical)
                        {
                            float radius = cac.size.x / 2f;

                            xLine = new Vector3[2] { -right * radius, right * radius };
                            yLine = new Vector3[2] { -up * cac.size.y / 2f, up * cac.size.y / 2f };

                            xLine = new Vector3[2] { t.TransformVector(xLine[0]), t.TransformVector(xLine[1]) };
                            yLine = new Vector3[2] { t.TransformVector(yLine[0]), t.TransformVector(yLine[1]) };

                            xLine = new Vector3[2] { xLine[0].XY() + forward * t.position.z, xLine[1].XY() + forward * t.position.z };
                            yLine = new Vector3[2] { yLine[0].XY() + forward * t.position.z, yLine[1].XY() + forward * t.position.z };

                            float xLineExtents = (xLine[1] - xLine[0]).magnitude / 2f;
                            float yLineExtents = (yLine[1] - yLine[0]).magnitude / 2f;
                            yLineExtents = Max(xLineExtents, yLineExtents);
                            Vector3 yLineDir = (yLine[1] - yLine[0]).normalized;
                            Vector3 xLineDir = new Vector3(yLineDir.y, -yLineDir.x, 0);

                            xLine = new Vector3[2] { center - xLineDir * xLineExtents, center + xLineDir * xLineExtents };
                            yLine = new Vector3[2] { center - yLineDir * yLineExtents, center + yLineDir * yLineExtents };
                        }
                        else
                        {
                            float radius = cac.size.y / 2f;

                            xLine = new Vector3[2] { -right * cac.size.x / 2f, right * cac.size.x / 2f };
                            yLine = new Vector3[2] { -up * radius, up * radius };

                            xLine = new Vector3[2] { t.TransformVector(xLine[0]), t.TransformVector(xLine[1]) };
                            yLine = new Vector3[2] { t.TransformVector(yLine[0]), t.TransformVector(yLine[1]) };

                            xLine = new Vector3[2] { xLine[0].XY() + forward * t.position.z, xLine[1].XY() + forward * t.position.z };
                            yLine = new Vector3[2] { yLine[0].XY() + forward * t.position.z, yLine[1].XY() + forward * t.position.z };

                            float xLineExtents = (xLine[1] - xLine[0]).magnitude / 2f;
                            float yLineExtents = (yLine[1] - yLine[0]).magnitude / 2f;
                            xLineExtents = Max(xLineExtents, yLineExtents);
                            Vector3 xLineDir = (xLine[1] - xLine[0]).normalized;
                            Vector3 yLineDir = new Vector3(xLineDir.y, -xLineDir.x, 0);

                            xLine = new Vector3[2] { center - xLineDir * xLineExtents, center + xLineDir * xLineExtents };
                            yLine = new Vector3[2] { center - yLineDir * yLineExtents, center + yLineDir * yLineExtents };
                        }
                    }
                }
                else
                {
                    xLine = new Vector3[2] { center - right * extents.x, center + right * extents.x };
                    yLine = new Vector3[2] { center - up * extents.y, center + up * extents.y };
                }
                xLine = new Vector3[2] { xLine[0].XY() + forward * t.position.z, xLine[1].XY() + forward * t.position.z };
                yLine = new Vector3[2] { yLine[0].XY() + forward * t.position.z, yLine[1].XY() + forward * t.position.z };

                Vector3 finalSize = new Vector3((xLine[1] - xLine[0]).magnitude, (yLine[1] - yLine[0]).magnitude, 0);
                cachedCollider2D = new CachedMeasure(xLine, yLine, finalSize, globalExtents, globalCenter, t.position);
                cachedCollider2Ds[collider2D] = cachedCollider2D;

                if (drawWireCube) DrawWireCube(cachedCollider2D, true);
                DrawVolumeLines(cachedCollider2D, true);
            }
            return collider2Ds.Length > 0;
        }

        private static bool MeasureMesh(Transform t, bool local = false)
        {
            bool twoD = false;
            bool batched = false;
            bool skinned = false;
            Transform rootBone = null;
            CachedMeasure cachedMesh;
            Vector3[] vertices = null;

            if (t.TryGetComponent(out MeshFilter meshFilter) && meshFilter.sharedMesh &&
                t.TryGetComponent(out MeshRenderer meshRenderer) && meshRenderer.enabled)
            {
                if (meshRenderer.isPartOfStaticBatch)
                {
                    SubMeshDescriptor subMeshDescriptor = meshFilter.sharedMesh.GetSubMesh(meshRenderer.subMeshStartIndex);
                    Vector3[] meshVertices = meshFilter.sharedMesh.vertices;
                    int startIndex = subMeshDescriptor.firstVertex;
                    int length = subMeshDescriptor.vertexCount;
                    vertices = new Vector3[length];
                    Array.Copy(meshVertices, startIndex, vertices, 0, length);
                    batched = true;
                }
                else
                {
                    vertices = meshFilter.sharedMesh.vertices;
                }
            }
            else if (measureSkinnedMesh && t.TryGetComponent(out SkinnedMeshRenderer smr) && smr.enabled && smr.sharedMesh)
            {
                Mesh m = new Mesh();
                rootBone = smr.rootBone;
                smr.BakeMesh(m);
                vertices = m.vertices;
                vertices = t.TransformPointsUnscaled(vertices); // SkinnedMeshRenderer component applies transform in a special, unscaled way

                skinned = true;
            }
            else if (t.TryGetComponent(out SpriteRenderer spriteRenderer) && spriteRenderer.enabled && spriteRenderer.sprite)
            {
                vertices = Array.ConvertAll(spriteRenderer.sprite.vertices, v => (Vector3)v);
                if (local) twoD = true;
            }
            if (vertices != null)
            {
                cachedMesh = MeasureVertices(vertices, skinned ? rootBone : t, local, batched, skinned);
                cachedMeshes[t] = cachedMesh;
            }
            else return false;

            if (drawWireCube) DrawWireCube(cachedMesh, twoD);
            DrawVolumeLines(cachedMesh, twoD);
            return true;
        }

        private static CachedMeasure MeasureVertices(Vector3[] vertices, Transform t, bool local = false, bool batched = false, bool skinned = false)
        {
            float minX, maxX, minY, maxY, minZ, maxZ;
            Vector3 right = MeasureTool.right; Vector3 up = MeasureTool.up; Vector3 forward = MeasureTool.forward;
            Vector3 originalCenter, originalExtents;
            Vector3[] transformedVertices = new Vector3[vertices.Length];

            if ((batched || skinned)) // Batched or skinned mesh vertices are already transformed into world coordinates
            {
                // To avoid double transforming for performance reasons, we do it here
                Array.Copy(vertices, transformedVertices, vertices.Length);
                if (t != null) vertices = t.InverseTransformPointsArray(vertices);
            }
            else if (t != null) transformedVertices = t.TransformPointsArray(vertices);

            minX = Min(vertices.Select(v => v.x).ToArray()); maxX = Max(vertices.Select(v => v.x).ToArray());
            minY = Min(vertices.Select(v => v.y).ToArray()); maxY = Max(vertices.Select(v => v.y).ToArray());
            minZ = Min(vertices.Select(v => v.z).ToArray()); maxZ = Max(vertices.Select(v => v.z).ToArray());

            originalCenter = new Vector3((minX + maxX) / 2f, (minY + maxY) / 2f, (minZ + maxZ) / 2f);
            originalExtents = new Vector3((maxX - minX) / 2f, (maxY - minY) / 2f, (maxZ - minZ) / 2f);

            minX = Min(transformedVertices.Select(v => v.x).ToArray()); maxX = Max(transformedVertices.Select(v => v.x).ToArray());
            minY = Min(transformedVertices.Select(v => v.y).ToArray()); maxY = Max(transformedVertices.Select(v => v.y).ToArray());
            minZ = Min(transformedVertices.Select(v => v.z).ToArray()); maxZ = Max(transformedVertices.Select(v => v.z).ToArray());

            // Global and transformed original centers/extents will differ in some concave objects (and maybe in others too)
            Vector3 globalExtents = new Vector3((maxX - minX) / 2f, (maxY - minY) / 2f, (maxZ - minZ) / 2f);
            Vector3 globalCenter = new Vector3((minX + maxX) / 2f, (minY + maxY) / 2f, (minZ + maxZ) / 2f);
            Vector3[] xLine;
            Vector3[] yLine;
            Vector3[] zLine;

            if (local && t != null)
            {
                Vector3 center = originalCenter;
                Vector3 extents = originalExtents;

                xLine = new Vector3[2] { (center - right * extents.x), (center + right * extents.x) };
                yLine = new Vector3[2] { (center - up * extents.y), (center + up * extents.y) };
                zLine = new Vector3[2] { (center - forward * extents.z), (center + forward * extents.z) };

                xLine = new Vector3[2] { t.TransformPoint(xLine[0]), t.TransformPoint(xLine[1]) };
                yLine = new Vector3[2] { t.TransformPoint(yLine[0]), t.TransformPoint(yLine[1]) };
                zLine = new Vector3[2] { t.TransformPoint(zLine[0]), t.TransformPoint(zLine[1]) };
            }
            else
            {
                Vector3 center = globalCenter;

                xLine = new Vector3[2] { new Vector3(minX, center.y, center.z), new Vector3(maxX, center.y, center.z) };
                yLine = new Vector3[2] { new Vector3(center.x, minY, center.z), new Vector3(center.x, maxY, center.z) };
                zLine = new Vector3[2] { new Vector3(center.x, center.y, minZ), new Vector3(center.x, center.y, maxZ) };
            }

            Vector3 finalSize = new Vector3((xLine[1] - xLine[0]).magnitude, (yLine[1] - yLine[0]).magnitude, (zLine[1] - zLine[0]).magnitude);
            return new CachedMeasure(xLine, yLine, zLine, finalSize, globalExtents, globalCenter, t ? t.position : globalCenter);
        }

        private static bool MeasureUI(Transform t, bool local = false)
        {
            if (t is RectTransform rt)
            {
                CachedMeasure cachedUI;
                Vector3[] corners = new Vector3[4];
                rt.GetWorldCorners(corners); // bottom left = 0, top left = 1, top right = 2, bottom right = 3;
                Vector3 center = (corners[3] + corners[1]) / 2f;
                Vector3 globalCenter = center;
                Vector3 extents = new Vector3(
                    Max(corners.Select(c => c.x).ToArray()) - Min(corners.Select(c => c.x).ToArray()),
                    Max(corners.Select(c => c.y).ToArray()) - Min(corners.Select(c => c.y).ToArray()),
                    Max(corners.Select(c => c.z).ToArray()) - Min(corners.Select(c => c.z).ToArray())) / 2f;
                Vector3 globalExtents = extents;

                Vector3[] xLine;
                Vector3[] yLine;
                Vector3[] zLine;
                if (!local)
                {
                    xLine = new Vector3[2] { center - right * extents.x, center + right * extents.x };
                    yLine = new Vector3[2] { center - up * extents.y, center + up * extents.y };
                    zLine = new Vector3[2] { center - forward * extents.z, center + forward * extents.z };
                }
                else
                {
                    xLine = new Vector3[2] { (center - (corners[2] - corners[1]) / 2f), center + (corners[2] - corners[1]) / 2f };
                    yLine = new Vector3[2] { (center - (corners[1] - corners[0]) / 2f), center + (corners[1] - corners[0]) / 2f };
                    zLine = new Vector3[2] { (xLine[0] + xLine[1]) / 2f, (xLine[0] + xLine[1]) / 2f };
                }
                Vector3 finalSize;
                Transform rct = null;
                if (uiUnscaled)
                {
                    var rootCanvas = rt.GetComponentInParent<Canvas>();
                    if (rootCanvas) rootCanvas = rootCanvas.rootCanvas;
                    if (rootCanvas) rct = rootCanvas.transform;
                }
                if (uiUnscaled && rct != null) finalSize = new Vector3(
                    rct.InverseTransformVector(xLine[1] - xLine[0]).magnitude,
                    rct.InverseTransformVector(yLine[1] - yLine[0]).magnitude,
                    rct.InverseTransformVector(zLine[1] - zLine[0]).magnitude);
                else finalSize = new Vector3((xLine[1] - xLine[0]).magnitude, (yLine[1] - yLine[0]).magnitude, (zLine[1] - zLine[0]).magnitude);

                cachedUI = new CachedMeasure(xLine, yLine, zLine, finalSize, globalExtents, globalCenter, t.position);
                cachedUIs[t] = cachedUI;

                // Measure relative position to parent RectTransform
                if (uiRelative && rt.parent != null && rt.parent is RectTransform rtParent)
                {
                    Vector3[] parentCorners = new Vector3[4];
                    rtParent.GetWorldCorners(parentCorners);
                    Vector3[] localCorners = rtParent.InverseTransformPointsArray(corners);

                    Handles.color = uiRelativeColor;

                    for (int i = 0; i < 4; i++) // For each of rt corner
                    {
                        // Identify parent corner and two edges relative to which we measure distance.
                        // We will use local coordinates (rtParent coordinate system) of rt corners to eliminate parent transformations.
                        int addX = 0, addY = 0, addZ = 0, add = 0; // add to index j according to rotation, scaling... of rt

                        if (localCorners[0].x > localCorners[3].x && localCorners[0].y > localCorners[1].y) addZ = 2;
                        if (localCorners[0].y > localCorners[1].y && localCorners[3].y > localCorners[2].y) addX = i % 2 == 0 ? 1 : -1;
                        if (localCorners[0].x >= localCorners[3].x && localCorners[1].x >= localCorners[2].x) addY = i % 2 == 0 ? -1 : 1;

                        add = addX + addY + addZ;
                        int j = Mod(i + add, 4); // j is index of corner of parent recttransform

                        // Measure in two directions aligned with the parent coordinate system
                        Vector3 parentEdge1 = (parentCorners[j] - parentCorners[Mod(j - 1, 4)]);
                        Vector3 parentEdge2 = (parentCorners[j] - parentCorners[Mod(j + 1, 4)]);
                        Vector3 dir1 = parentEdge1.normalized; Vector3 dir2 = parentEdge2.normalized;
                        Vector3 endPoint; // The intersection point. The point where the dashed line will end (starts from corner of rt)

                        // Shoot in the direction of parentEdge2 from rt corner
                        if (LineLineIntersection(out endPoint, parentCorners[j].XY(), dir1.XY(), corners[i].XY(), dir2.XY()))
                        {
                            float zFraction = parentEdge1.x != 0 ? (endPoint.x - parentCorners[j].x) / parentEdge1.x :
                                parentEdge1.y != 0 ? (endPoint.y - parentCorners[j].y) / parentEdge1.y : 0;
                            endPoint.z = parentCorners[j].z + parentEdge1.z * zFraction;
                            Handles.DrawDottedLine(corners[i], endPoint, lineWidth);
                            float dist;
                            if (uiUnscaled && rct != null) dist = rct.InverseTransformVector(corners[i] - endPoint).magnitude; // In canvas coordinate system
                            else dist = (corners[i] - endPoint).magnitude;
                            LabelOutlined((corners[i] + endPoint) * 0.5f, dist.ToString(dist > zeroThreshold ? $"F{precision}" : "F0"), uiRelativeStyle, outlineWidth);
                        }

                        // Shoot in the direction of parentEdge1 from rt corner
                        if (LineLineIntersection(out endPoint, parentCorners[j].XY(), dir2.XY(), corners[i].XY(), dir1.XY()))
                        {
                            float zFraction = parentEdge2.x != 0 ? (endPoint.x - parentCorners[j].x) / parentEdge2.x :
                                parentEdge2.y != 0 ? (endPoint.y - parentCorners[j].y) / parentEdge2.y : 0;
                            endPoint.z = parentCorners[j].z + parentEdge2.z * zFraction;
                            Handles.DrawDottedLine(corners[i], endPoint, lineWidth);
                            float dist;
                            if (uiUnscaled && rct != null) dist = rct.InverseTransformVector(corners[i] - endPoint).magnitude; // In canvas coordinate system
                            else dist = (corners[i] - endPoint).magnitude;
                            LabelOutlined((corners[i] + endPoint) * 0.5f, dist.ToString(dist > zeroThreshold ? $"F{precision}" : "F0"), uiRelativeStyle, outlineWidth);
                        }
                    }
                }

                if (drawWireCube) DrawWireCube(cachedUI, true);
                DrawVolumeLines(cachedUI, local);
                return true;
            }
            else return false;
        }

        private static bool MeasureTerrain(Transform t)
        {
            if (t.TryGetComponent(out Terrain terrain) && terrain.enabled && terrain.terrainData)
            {
                CachedMeasure cachedTerrain;
                Vector3 center = terrain.terrainData.bounds.center + t.position; // Needs to be corrected, probably a Unity bug
                Vector3 extents = terrain.terrainData.bounds.extents;

                Vector3[] xLine = new Vector3[2] { (center - right * extents.x), (center + right * extents.x) };
                Vector3[] yLine = new Vector3[2] { (center - up * extents.y), (center + up * extents.y) };
                Vector3[] zLine = new Vector3[2] { (center - forward * extents.z), (center + forward * extents.z) };

                Vector3 finalSize = new Vector3((xLine[1] - xLine[0]).magnitude, (yLine[1] - yLine[0]).magnitude, (zLine[1] - zLine[0]).magnitude);
                cachedTerrain = new CachedMeasure(xLine, yLine, zLine, finalSize, extents, center, t.position);
                cachedTerrains[t] = cachedTerrain;

                if (drawWireCube) DrawWireCube(cachedTerrain);
                DrawVolumeLines(cachedTerrain);
                return true;
            }
            else return false;
        }

        private static bool MeasureParticleSystem(Transform t)
        {
            if (t.TryGetComponent(out ParticleSystemRenderer particleSystem))
            {
                CachedMeasure cachedMisc;
                Vector3 center = particleSystem.bounds.center;
                Vector3 extents = particleSystem.bounds.extents;

                Vector3[] xLine = new Vector3[2] { (center - right * extents.x), (center + right * extents.x) };
                Vector3[] yLine = new Vector3[2] { (center - up * extents.y), (center + up * extents.y) };
                Vector3[] zLine = new Vector3[2] { (center - forward * extents.z), (center + forward * extents.z) };

                Vector3 finalSize = new Vector3((xLine[1] - xLine[0]).magnitude, (yLine[1] - yLine[0]).magnitude, (zLine[1] - zLine[0]).magnitude);
                cachedMisc = new CachedMeasure(xLine, yLine, zLine, finalSize, extents, center, t.position);
                cachedMiscellaneous[t] = cachedMisc;

                if (drawWireCube) DrawWireCube(cachedMisc);
                DrawVolumeLines(cachedMisc);
                return true;
            }
            else return false;
        }

        // We don't involve Camera to Compound All
        private static bool MeasureCamera(Transform t, bool local = false)
        {
            if (t.TryGetComponent(out Camera camera))
            {
                Vector3[] corners = new Vector3[4];
                camera.CalculateFrustumCorners(new Rect(0, 0, 1, 1), camera.farClipPlane, Camera.MonoOrStereoscopicEye.Mono, corners);
                corners = t.TransformPointsUnscaled(corners);
                Vector3 globalExtents = new Vector3(Abs((corners[1].x - corners[2].x) * 0.5f), Abs((corners[0].y -  corners[1].y) * 0.5f), 0);
                Vector3 globalCenter = (corners[0] + corners[2]) * 0.5f;

                Vector3[] xLine = new Vector3[2] { (globalCenter - (corners[2] - corners[1]) / 2f), globalCenter + (corners[2] - corners[1]) / 2f };
                Vector3[] yLine = new Vector3[2] { (globalCenter - (corners[1] - corners[0]) / 2f), globalCenter + (corners[1] - corners[0]) / 2f };

                Vector3 finalSize = new Vector3((xLine[1] - xLine[0]).magnitude, (yLine[1] - yLine[0]).magnitude, 0);
                CachedMeasure cachedMisc = new CachedMeasure(xLine, yLine, finalSize, globalExtents, globalCenter, t.position);

                if (drawWireCube) DrawWireCube(cachedMisc, true);
                DrawVolumeLines(cachedMisc, true);

                corners = new Vector3[4];
                camera.CalculateFrustumCorners(new Rect(0, 0, 1, 1), camera.nearClipPlane, Camera.MonoOrStereoscopicEye.Mono, corners);
                corners = t.TransformPointsUnscaled(corners);
                globalExtents = new Vector3(Abs((corners[1].x - corners[2].x) * 0.5f), Abs((corners[0].y - corners[1].y) * 0.5f), 0);
                globalCenter = (corners[0] + corners[2]) * 0.5f;

                if (drawZLine)
                {
                    Handles.color = Color.blue;
                    Handles.DrawDottedLine(cachedMisc.globalCenter, globalCenter, lineWidth);
                    var planesDistance = (cachedMisc.globalCenter - globalCenter).magnitude;
                    LabelOutlined((cachedMisc.globalCenter + globalCenter) * 0.5f,
                        planesDistance.ToString(planesDistance > zeroThreshold ? $"F{precision}" : "F0"), zAxisStyle, outlineWidth);
                }

                if (!camera.orthographic)
                {
                    xLine = new Vector3[2] { (globalCenter - (corners[2] - corners[1]) / 2f), globalCenter + (corners[2] - corners[1]) / 2f };
                    yLine = new Vector3[2] { (globalCenter - (corners[1] - corners[0]) / 2f), globalCenter + (corners[1] - corners[0]) / 2f };

                    finalSize = new Vector3((xLine[1] - xLine[0]).magnitude, (yLine[1] - yLine[0]).magnitude, 0);
                    cachedMisc = new CachedMeasure(xLine, yLine, finalSize, globalExtents, globalCenter, t.position);

                    DrawVolumeLines(cachedMisc, true);
                    if (drawWireCube) DrawWireCube(cachedMisc, true);
                }
                return true;
            }
            else return false;
        }

        private static void MeasureDistances(Transform t, Transform[] measuredTransforms)
        {
            foreach (Transform other in measuredTransforms)
            {
                if (other == t) continue;
                Vector3[] line = new Vector3[2] { t.position, other.position };
                float finalSize = (line[1] - line[0]).magnitude;

                Vector3 labelPosition = (line[1] + line[0]) / 2f;

                Handles.color = Color.yellow;
                Handles.DrawDottedLine(line[0], line[1], lineWidth);
                LabelOutlined(labelPosition, finalSize.ToString(finalSize > zeroThreshold ? $"F{precision}" : "F0"), distanceStyle, outlineWidth);
            }
        }

        private static void MeasureCompoundVolume(Dictionary<Component, CachedMeasure> cachedMeasures)
        {
            if (cachedMeasures.Count == 0) return;
            Vector3[] bounds = new Vector3[2]
            {
            new Vector3(
                Min(cachedMeasures.Select(cm => cm.Value.globalXLine[0].x).ToArray()),
                Min(cachedMeasures.Select(cm => cm.Value.globalYLine[0].y).ToArray()),
                Min(cachedMeasures.Select(cm => cm.Value.globalZLine[0].z).ToArray())),
            new Vector3(
                Max(cachedMeasures.Select(cm => cm.Value.globalXLine[1].x).ToArray()),
                Max(cachedMeasures.Select(cm => cm.Value.globalYLine[1].y).ToArray()),
                Max(cachedMeasures.Select(cm => cm.Value.globalZLine[1].z).ToArray()))
            };

            Vector3 center = new Vector3((bounds[1].x + bounds[0].x) / 2f, (bounds[1].y + bounds[0].y) / 2f, (bounds[1].z + bounds[0].z) / 2f);
            Vector3 extents = new Vector3((bounds[1].x - bounds[0].x) / 2f, (bounds[1].y - bounds[0].y) / 2f, (bounds[1].z - bounds[0].z) / 2f);

            Vector3[] xLine = new Vector3[2] { (center - right * extents.x), (center + right * extents.x) };
            Vector3[] yLine = new Vector3[2] { (center - up * extents.y), (center + up * extents.y) };
            Vector3[] zLine = new Vector3[2] { (center - forward * extents.z), (center + forward * extents.z) };
            Vector3 finalSize = new Vector3((xLine[1] - xLine[0]).magnitude, (yLine[1] - yLine[0]).magnitude, (zLine[1] - zLine[0]).magnitude);

            CachedMeasure cachedCompoundVolume = new CachedMeasure(xLine, yLine, zLine, finalSize, extents, center, center);

            DrawWireCube(cachedCompoundVolume, thickness: 2);
            DrawVolumeLines(cachedCompoundVolume, bold: true);
        }

        private static void MeasureTotalCompoundVolume(HashSet<CachedMeasure> cachedMeasures)
        {
            if (cachedMeasures.Count == 0) return;
            Vector3[] bounds = new Vector3[2]
            {
            new Vector3(
                Min(cachedMeasures.Select(cm => cm.globalXLine[0].x).ToArray()),
                Min(cachedMeasures.Select(cm => cm.globalYLine[0].y).ToArray()),
                Min(cachedMeasures.Select(cm => cm.globalZLine[0].z).ToArray())),
            new Vector3(
                Max(cachedMeasures.Select(cm => cm.globalXLine[1].x).ToArray()),
                Max(cachedMeasures.Select(cm => cm.globalYLine[1].y).ToArray()),
                Max(cachedMeasures.Select(cm => cm.globalZLine[1].z).ToArray()))
            };

            Vector3 center = new Vector3((bounds[1].x + bounds[0].x) / 2f, (bounds[1].y + bounds[0].y) / 2f, (bounds[1].z + bounds[0].z) / 2f);
            Vector3 extents = new Vector3((bounds[1].x - bounds[0].x) / 2f, (bounds[1].y - bounds[0].y) / 2f, (bounds[1].z - bounds[0].z) / 2f);

            Vector3[] xLine = new Vector3[2] { (center - right * extents.x), (center + right * extents.x) };
            Vector3[] yLine = new Vector3[2] { (center - up * extents.y), (center + up * extents.y) };
            Vector3[] zLine = new Vector3[2] { (center - forward * extents.z), (center + forward * extents.z) };
            Vector3 finalSize = new Vector3((xLine[1] - xLine[0]).magnitude, (yLine[1] - yLine[0]).magnitude, (zLine[1] - zLine[0]).magnitude);

            CachedMeasure cachedTotalCompoundVolume = new CachedMeasure(xLine, yLine, zLine, finalSize, extents, center, center);

            DrawWireCube(cachedTotalCompoundVolume, thickness: 3);
            DrawVolumeLines(cachedTotalCompoundVolume, bold: true);
        }
#endregion
#endregion

#region Helper methods

        private static void ClampWindowToSceneView()
        {
            // This has to be performed every sceneGUI call (e.g. rescaling SceneView by mouse drag could otherwise hide the window.
            // EditorGUIUtilit.pixelsPerPoint is scaling factor for scaled UI (e.g. small monitor with high res have 150% scaling)
            float screenWidth = SceneView.currentDrawingSceneView.camera.pixelWidth / EditorGUIUtility.pixelsPerPoint;
            float screenHeight = SceneView.currentDrawingSceneView.camera.pixelHeight / EditorGUIUtility.pixelsPerPoint;
            // Clamp(0f, 0f, -1f) returns -1
            windowPosition = new Vector2(Clamp(windowPosition.x, 0, Max(0, screenWidth - (mainRect.width + settingsRect.width))),
                Clamp(windowPosition.y, 0, Max(0,screenHeight - Max(mainRect.height, settingsRect.height))));
        }

        private static void SetUpGUIStyles()
        {
            if (!areStylesSet)
            {
                foldoutStyle = new GUIStyle(EditorStyles.miniButtonMid);
                foldoutStyle.alignment = TextAnchor.MiddleLeft;

                headerButtonStyle = new GUIStyle(GUI.skin.button);

                windowStyle = new GUIStyle(GUI.skin.window);
                headerButtonStyle.alignment = TextAnchor.UpperCenter;

                windowHeaderStyle = new GUIStyle(EditorStyles.boldLabel);
                windowHeaderStyle.alignment = TextAnchor.MiddleLeft;

                SetAxisStyles();
                SetAxisStyle(distanceStyle, Color.yellow, labelFontSize);
                SetAxisStyle(uiRelativeStyle, uiRelativeColor, labelFontSize);
                SetAxisStyle(positionStyle, positionColor, RoundToInt(labelFontSize * 0.65f));

                areStylesSet = true;
            }
        }

        private static void SetAxisStyles()
        {
            SetAxisStyle(xAxisStyle, Color.red, labelFontSize);
            SetAxisStyle(yAxisStyle, Color.green, labelFontSize);
            SetAxisStyle(zAxisStyle, Color.blue, labelFontSize);
        }

        private static void SetAxisStyle(GUIStyle axisStyle, Color color, int fontSize, FontStyle fontStyle = FontStyle.Normal)
        {
            axisStyle.alignment = TextAnchor.MiddleLeft;
            axisStyle.normal.textColor = color;
            axisStyle.fontSize = fontSize;
            axisStyle.fontStyle = fontStyle;
        }

        private static void LabelOutlined(Vector3 position, string text, GUIStyle style, int width = 0)
        {
            if (width > 0 && HandleUtility.WorldToGUIPointWithDepth(position).z > 0)
            {
                var backgroundStyle = new GUIStyle(style);
                backgroundStyle.normal.textColor = Color.black;
                Rect rect = HandleUtility.WorldPointToSizedRect(position, new GUIContent(text), style);
                Handles.BeginGUI();
                for (int i = -width; i <= width; i++)
                {
                    GUI.Label(new Rect(rect.x - width, rect.y + i, rect.width, rect.height), text, backgroundStyle);
                    GUI.Label(new Rect(rect.x + width, rect.y + i, rect.width, rect.height), text, backgroundStyle);
                }
                for (int i = -width + 1; i <= width - 1; i++)
                {
                    GUI.Label(new Rect(rect.x + i, rect.y - width, rect.width, rect.height), text, backgroundStyle);
                    GUI.Label(new Rect(rect.x + i, rect.y + width, rect.width, rect.height), text, backgroundStyle);
                }
                Handles.EndGUI();
            }
            Handles.Label(position, text, style);
        }

        private static void DrawVolumeLines(CachedMeasure cachedMeasure, bool twoDimensional = false, bool bold = false)
        {

            Vector3 labelOffset = new Vector3(0.1f, 0.1f, 0.1f); // It does not work accurately but it's not a big issue
            Vector3[] labelPosition = new Vector3[3]
            {
                cachedMeasure.xLine[1] + cachedMeasure.right * labelOffset.x,
                cachedMeasure.yLine[1] + cachedMeasure.up * labelOffset.y,
                twoDimensional? Vector3.zero : cachedMeasure.zLine[1] + cachedMeasure.forward * labelOffset.z
            };
            Vector3 finalSize = cachedMeasure.finalSize;
            int boldOutline = bold ? 1 : 0;
            if (bold)
            {
                SetAxisStyle(xAxisStyle, Color.red, RoundToInt(labelFontSize * 1.2f), FontStyle.Bold);
                SetAxisStyle(yAxisStyle, Color.green, RoundToInt(labelFontSize * 1.2f), FontStyle.Bold);
                SetAxisStyle(zAxisStyle, Color.blue, RoundToInt(labelFontSize * 1.2f), FontStyle.Bold);
            }

            if (drawXLine)
            {
                Handles.color = Color.red;
                Handles.DrawDottedLine(cachedMeasure.xLine[0], cachedMeasure.xLine[1], lineWidth * (bold ? 2 : 1));
                LabelOutlined(labelPosition[0], finalSize.x.ToString(finalSize.x > zeroThreshold ? $"F{precision}" : "F0"), xAxisStyle, outlineWidth + boldOutline);
            }
            if (drawYLine)
            {
                Handles.color = Color.green;
                Handles.DrawDottedLine(cachedMeasure.yLine[0], cachedMeasure.yLine[1], lineWidth * (bold ? 2 : 1));
                LabelOutlined(labelPosition[1], finalSize.y.ToString(finalSize.y > zeroThreshold ? $"F{precision}" : "F0"), yAxisStyle, outlineWidth + boldOutline);
            }
            if (drawZLine && !twoDimensional)
            {
                Handles.color = Color.blue;
                Handles.DrawDottedLine(cachedMeasure.zLine[0], cachedMeasure.zLine[1], lineWidth * (bold ? 2 : 1));
                LabelOutlined(labelPosition[2], finalSize.z.ToString(finalSize.z > zeroThreshold ? $"F{precision}" : "F0"), zAxisStyle, outlineWidth + boldOutline);
            }
            Handles.color = Color.white;
            if (bold) SetAxisStyles();
        }

        public static void DrawPosition(Vector3 pos, Vector3 labelPosition)
        {
            string positionText = $"({pos.x.ToString(Abs(pos.x) > zeroThreshold ? $"F{precision}" : "F0")}, {pos.y.ToString(Abs(pos.y) > zeroThreshold ? $"F{precision}" : "F0")}, {pos.z.ToString(Abs(pos.z) > zeroThreshold ? $"F{precision}" : "F0")})";
            LabelOutlined(labelPosition, positionText, positionStyle, outlineWidth);
        }

        private static void DrawWireCube(CachedMeasure cachedMeasure, bool twoDimensional = false, int thickness = 0)
        {
            if (twoDimensional)
            {
                Vector3 p1 = cachedMeasure.xLine[1] + cachedMeasure.yLine[1] - cachedMeasure.center;
                Vector3 p3 = cachedMeasure.xLine[1] + cachedMeasure.yLine[0] - cachedMeasure.center;
                Vector3 p5 = cachedMeasure.xLine[0] + cachedMeasure.yLine[1] - cachedMeasure.center;
                Vector3 p7 = cachedMeasure.xLine[0] + cachedMeasure.yLine[0] - cachedMeasure.center;

                Handles.color = Color.yellow;
                DrawLine(p1, p3, thickness);
                DrawLine(p1, p5, thickness);
                DrawLine(p5, p7, thickness);
                DrawLine(p7, p3, thickness);
            }
            else
            {
                Vector3 p1 = cachedMeasure.xLine[1] + cachedMeasure.yLine[1] + cachedMeasure.zLine[1] - 2 * cachedMeasure.center;
                Vector3 p2 = cachedMeasure.xLine[1] + cachedMeasure.yLine[1] + cachedMeasure.zLine[0] - 2 * cachedMeasure.center;
                Vector3 p3 = cachedMeasure.xLine[1] + cachedMeasure.yLine[0] + cachedMeasure.zLine[1] - 2 * cachedMeasure.center;
                Vector3 p4 = cachedMeasure.xLine[1] + cachedMeasure.yLine[0] + cachedMeasure.zLine[0] - 2 * cachedMeasure.center;
                Vector3 p5 = cachedMeasure.xLine[0] + cachedMeasure.yLine[1] + cachedMeasure.zLine[1] - 2 * cachedMeasure.center;
                Vector3 p6 = cachedMeasure.xLine[0] + cachedMeasure.yLine[1] + cachedMeasure.zLine[0] - 2 * cachedMeasure.center;
                Vector3 p7 = cachedMeasure.xLine[0] + cachedMeasure.yLine[0] + cachedMeasure.zLine[1] - 2 * cachedMeasure.center;
                Vector3 p8 = cachedMeasure.xLine[0] + cachedMeasure.yLine[0] + cachedMeasure.zLine[0] - 2 * cachedMeasure.center;

                Handles.color = Color.yellow;
                DrawLine(p1, p2, thickness);
                DrawLine(p1, p3, thickness);
                DrawLine(p2, p4, thickness);
                DrawLine(p3, p4, thickness);
                DrawLine(p1, p5, thickness);
                DrawLine(p5, p6, thickness);
                DrawLine(p5, p7, thickness);
                DrawLine(p6, p2, thickness);
                DrawLine(p6, p8, thickness);
                DrawLine(p7, p8, thickness);
                DrawLine(p7, p3, thickness);
                DrawLine(p8, p4, thickness);
            }
        }

        private static void DrawLine(Vector3 p1, Vector3 p2, int thickness = 0)
        {
#if UNITY_2020_2_OR_NEWER
            Handles.DrawLine(p1, p2, thickness);
#else
            Handles.DrawLine(p1, p2);
#endif
        }

        private static void ClearCachedMeasures()
        {
            cachedCollider2Ds.Clear();
            cachedColliders.Clear();
            cachedMeshes.Clear();
            cachedTerrains.Clear();
            cachedUIs.Clear();
            cachedMiscellaneous.Clear();
        }

        private static Transform[] FindAllTransforms()
        {
            PrefabStage prefabStage = PrefabStageUtility.GetCurrentPrefabStage();
            if (prefabStage != null)
            {
                return prefabStage.prefabContentsRoot.GetComponentsInChildren<Transform>(false);
            }
            else return activeTransformsInScene = FindObjectsOfType<Transform>();
        }

        private static void SavePreferences()
        {
            EditorPrefs.SetBool(PrefId + nameof(PersistentTool), PersistentTool);
            EditorPrefs.SetBool(PrefId + nameof(showSceneViewWindow), showSceneViewWindow);
            EditorPrefs.SetBool(PrefId + nameof(showSettings), showSettings);
            EditorPrefs.SetInt(PrefId + nameof(measureGroup), (int)measureGroup);

            EditorPrefs.SetBool(PrefId + nameof(measureDistance), measureDistance);
            EditorPrefs.SetBool(PrefId + nameof(showPosition), showPosition);
            EditorPrefs.SetBool(PrefId + nameof(showLocalPosition), showLocalPosition);
            EditorPrefs.SetBool(PrefId + nameof(measureCollider), measureCollider);
            EditorPrefs.SetBool(PrefId + nameof(measureCollider2D), measureCollider2D);
            EditorPrefs.SetBool(PrefId + nameof(measureMesh), measureMesh);
            EditorPrefs.SetBool(PrefId + nameof(measureSkinnedMesh), measureSkinnedMesh);
            EditorPrefs.SetBool(PrefId + nameof(measureUI), measureUI);
            EditorPrefs.SetBool(PrefId + nameof(measureOther), measureOther);
            EditorPrefs.SetBool(PrefId + nameof(measureTerrainMesh), measureTerrainMesh);
            EditorPrefs.SetBool(PrefId + nameof(measureTerrainCollider), measureTerrainCollider);
            EditorPrefs.SetBool(PrefId + nameof(measureMisc), measureMisc);
            EditorPrefs.SetBool(PrefId + nameof(uiUnscaled), uiUnscaled);
            EditorPrefs.SetBool(PrefId + nameof(anchoredPosition), anchoredPosition);
            EditorPrefs.SetBool(PrefId + nameof(uiRelative), uiRelative);

            EditorPrefs.SetBool(PrefId + nameof(colliderFoldout), colliderFoldout);
            EditorPrefs.SetBool(PrefId + nameof(collider2DFoldout), collider2DFoldout);
            EditorPrefs.SetBool(PrefId + nameof(meshFoldout), meshFoldout);
            EditorPrefs.SetBool(PrefId + nameof(uiFoldout), uiFoldout);
            EditorPrefs.SetBool(PrefId + nameof(otherFoldout), otherFoldout);

            EditorPrefs.SetBool(PrefId + nameof(colliderLocal), colliderLocal);
            EditorPrefs.SetBool(PrefId + nameof(collider2DLocal), collider2DLocal);
            EditorPrefs.SetBool(PrefId + nameof(meshLocal), meshLocal);
            EditorPrefs.SetBool(PrefId + nameof(uiLocal), uiLocal);

            EditorPrefs.SetBool(PrefId + nameof(colliderCompound), colliderCompound);
            EditorPrefs.SetBool(PrefId + nameof(collider2DCompound), collider2DCompound);
            EditorPrefs.SetBool(PrefId + nameof(meshCompound), meshCompound);
            EditorPrefs.SetBool(PrefId + nameof(uiCompound), uiCompound);
            EditorPrefs.SetBool(PrefId + nameof(totalCompound), totalCompound);

            EditorPrefs.SetBool(PrefId + nameof(preferGroup), preferGroup);
            EditorPrefs.SetBool(PrefId + nameof(preferMeshOverCollider), preferMeshOverCollider);

            EditorPrefs.SetBool(PrefId + nameof(drawWireCube), drawWireCube);
            EditorPrefs.SetInt(PrefId + nameof(labelFontSize), labelFontSize);
            EditorPrefs.SetInt(PrefId + nameof(outlineWidth), outlineWidth);
            EditorPrefs.SetString(PrefId + nameof(positionColor), JsonUtility.ToJson(positionColor));
            EditorPrefs.SetBool(PrefId + nameof(drawXLine), drawXLine);
            EditorPrefs.SetBool(PrefId + nameof(drawYLine), drawYLine);
            EditorPrefs.SetBool(PrefId + nameof(drawZLine), drawZLine);
            EditorPrefs.SetInt(PrefId + nameof(precision), precision);

            EditorPrefs.SetFloat(PrefId + nameof(windowPosition) + "x", windowPosition.x);
            EditorPrefs.SetFloat(PrefId + nameof(windowPosition) + "y", windowPosition.y);
        }

        // If GetBool/Int/... does not exist, default value is used or value given as an optional parameter
        private static void LoadPreferences()
        {
            PersistentTool = EditorPrefs.GetBool(PrefId + nameof(PersistentTool));
            showSceneViewWindow = EditorPrefs.GetBool(PrefId + nameof(showSceneViewWindow), true);
            showSettings = EditorPrefs.GetBool(PrefId + nameof(showSettings));
            measureGroup = (MeasureGroup)EditorPrefs.GetInt(PrefId + nameof(measureGroup), 1);

            measureDistance = EditorPrefs.GetBool(PrefId + nameof(measureDistance));
            showPosition = EditorPrefs.GetBool(PrefId + nameof(showPosition));
            showLocalPosition = EditorPrefs.GetBool(PrefId + nameof(showLocalPosition));
            measureCollider = EditorPrefs.GetBool(PrefId + nameof(measureCollider), true);
            measureCollider2D = EditorPrefs.GetBool(PrefId + nameof(measureCollider2D), true);
            measureMesh = EditorPrefs.GetBool(PrefId + nameof(measureMesh), true);
            measureSkinnedMesh = EditorPrefs.GetBool(PrefId + nameof(measureSkinnedMesh), true);
            measureUI = EditorPrefs.GetBool(PrefId + nameof(measureUI), true);
            measureOther = EditorPrefs.GetBool(PrefId + nameof(measureOther), true);
            measureTerrainMesh = EditorPrefs.GetBool(PrefId + nameof(measureTerrainMesh));
            measureTerrainCollider = EditorPrefs.GetBool(PrefId + nameof(measureTerrainCollider), true);
            measureMisc = EditorPrefs.GetBool(PrefId + nameof(measureMisc), measureMisc);
            uiUnscaled = EditorPrefs.GetBool(PrefId + nameof(uiUnscaled), true);
            anchoredPosition = EditorPrefs.GetBool(PrefId + nameof(anchoredPosition));
            uiRelative = EditorPrefs.GetBool(PrefId + nameof(uiRelative), true);

            colliderFoldout = EditorPrefs.GetBool(PrefId + nameof(colliderFoldout));
            collider2DFoldout = EditorPrefs.GetBool(PrefId + nameof(collider2DFoldout));
            meshFoldout = EditorPrefs.GetBool(PrefId + nameof(meshFoldout));
            uiFoldout = EditorPrefs.GetBool(PrefId + nameof(uiFoldout));
            otherFoldout = EditorPrefs.GetBool(PrefId + nameof(otherFoldout), true);

            colliderLocal = EditorPrefs.GetBool(PrefId + nameof(colliderLocal));
            collider2DLocal = EditorPrefs.GetBool(PrefId + nameof(collider2DLocal));
            meshLocal = EditorPrefs.GetBool(PrefId + nameof(meshLocal));
            uiLocal = EditorPrefs.GetBool(PrefId + nameof(uiLocal), true);

            colliderCompound = EditorPrefs.GetBool(PrefId + nameof(colliderCompound));
            collider2DCompound = EditorPrefs.GetBool(PrefId + nameof(collider2DCompound));
            meshCompound = EditorPrefs.GetBool(PrefId + nameof(meshCompound));
            uiCompound = EditorPrefs.GetBool(PrefId + nameof(uiCompound));
            totalCompound = EditorPrefs.GetBool(PrefId + nameof(totalCompound));

            preferGroup = EditorPrefs.GetBool(PrefId + nameof(preferGroup));
            preferMeshOverCollider = EditorPrefs.GetBool(PrefId + nameof(preferMeshOverCollider), true);

            drawWireCube = EditorPrefs.GetBool(PrefId + nameof(drawWireCube));
            labelFontSize = EditorPrefs.GetInt(PrefId + nameof(labelFontSize), 20);
            outlineWidth = EditorPrefs.GetInt(PrefId + nameof(outlineWidth), 0);
            try
            {
                positionColor = JsonUtility.FromJson<Color>(EditorPrefs.GetString(PrefId + nameof(positionColor), JsonUtility.ToJson(Color.grey)));
            }
            catch
            {
                positionColor = Color.grey;
                EditorPrefs.SetString(PrefId + nameof(positionColor), JsonUtility.ToJson(positionColor));
            }
            drawXLine = EditorPrefs.GetBool(PrefId + nameof(drawXLine), true);
            drawYLine = EditorPrefs.GetBool(PrefId + nameof(drawYLine), true);
            drawZLine = EditorPrefs.GetBool(PrefId + nameof(drawZLine), true);
            precision = EditorPrefs.GetInt(PrefId + nameof(precision), 3);
            zeroThreshold = Pow(10, -precision) * 0.5f;

            windowPosition.x = EditorPrefs.GetFloat(PrefId + nameof(windowPosition) + "x", 60);
            windowPosition.y = EditorPrefs.GetFloat(PrefId + nameof(windowPosition) + "y", 0);
        }

        private string GetMeasureToolFolderPath()
        {
            string path = AssetDatabase.GetAssetPath(MonoScript.FromScriptableObject(this));
            for (int i = 0; i < 3; i++)
            {
                int j = path.LastIndexOf('/');
                if (j > 0) path = path.Substring(0, j);
            }
            return path;
        }
#endregion
    }

#region Helper classes and structs
    public struct CachedMeasure
    {
        public Vector3[] xLine;
        public Vector3[] yLine;
        public Vector3[] zLine;
        public Vector3 finalSize;

        public Vector3 globalExtents;
        public Vector3 globalCenter;
        public Vector3 transformPosition; // == transform.position

        public Vector3 right => (xLine[1] - xLine[0]).normalized;
        public Vector3 up => (yLine[1] - yLine[0]).normalized;
        public Vector3 forward => (zLine[1] - zLine[0]).normalized;
        public Vector3 center => (xLine[1] + xLine[0]) / 2f;
        public Vector3[] globalXLine => new Vector3[2]
        {
            globalCenter - Vector3.right * globalExtents.x, globalCenter + Vector3.right * globalExtents.x
        };
        public Vector3[] globalYLine => new Vector3[2]
        {
            globalCenter - Vector3.up * globalExtents.y, globalCenter + Vector3.up * globalExtents.y
        };
        public Vector3[] globalZLine => new Vector3[2]
        {
            globalCenter - Vector3.forward * globalExtents.z, globalCenter + Vector3.forward * globalExtents.z
        };

        public CachedMeasure(Vector3[] xLine, Vector3[] yLine, Vector3[] zLine, Vector3 finalSize, Vector3 globalExtents, Vector3 globalCenter, Vector3 transformPosition)
        {
            this.xLine = xLine;
            this.yLine = yLine;
            this.zLine = zLine;
            this.finalSize = finalSize;
            this.globalExtents = globalExtents;
            this.globalCenter = globalCenter;
            this.transformPosition = transformPosition;
        }

        public CachedMeasure(Vector3[] xLine, Vector3[] yLine, Vector3 finalSize, Vector3 globalExtents, Vector3 globalCenter, Vector3 transformPosition) :
            this(xLine, yLine, new Vector3[2] { (xLine[0] + xLine[1]) / 2f, (xLine[0] + xLine[1]) / 2f }, finalSize, globalExtents, globalCenter, transformPosition)
        {
        }
    }

    public static class Extensions
    {
        public static int Mod(int x, int m)
        {
            return (x % m + m) % m;
        }

        public static bool LineLineIntersection(out Vector3 intersection, Vector3 linePoint1, Vector3 lineVec1, Vector3 linePoint2, Vector3 lineVec2)
        {
            Vector3 lineVec3 = linePoint2 - linePoint1;
            Vector3 crossVec1and2 = Vector3.Cross(lineVec1, lineVec2);
            Vector3 crossVec3and2 = Vector3.Cross(lineVec3, lineVec2);

            float planarFactor = Vector3.Dot(lineVec3, crossVec1and2);

            // Is coplanar and not parallel
            if (Mathf.Abs(planarFactor) < 0.0001f && crossVec1and2.sqrMagnitude > 0.0001f)
            {
                float s = Vector3.Dot(crossVec3and2, crossVec1and2) / crossVec1and2.sqrMagnitude;
                intersection = linePoint1 + (lineVec1 * s);
                return true;
            }
            else
            {
                intersection = Vector3.zero;
                return false;
            }
        }

        public static Vector3 XY(this Vector3 v)
        {
            return new Vector3(v.x, v.y, 0);
        }

        public static Vector3[] TransformPointsUnscaled(this Transform transform, Vector3[] points)
        {
            var localToWorldMatrix = Matrix4x4.TRS(transform.position, transform.rotation, Vector3.one);
            Vector3[] vertices = new Vector3[points.Length];
            for (int i = 0; i < points.Length; i++)
            {
                vertices[i] = localToWorldMatrix.MultiplyPoint3x4(points[i]);
            }
            return vertices;
        }

        public static Vector3[] InverseTransformPointsArray(this Transform transform, Vector3[] points)
        {
            Vector3[] vertices = new Vector3[points.Length];
            for (int i = 0; i < points.Length; i++)
            {
                vertices[i] = transform.InverseTransformPoint(points[i]);
            }
            return vertices;
        }

        public static Vector3[] TransformPointsArray(this Transform transform, Vector3[] points)
        {
            Vector3[] vertices = new Vector3[points.Length];
            for (int i = 0; i < points.Length; i++)
            {
                vertices[i] = transform.TransformPoint(points[i]);
            }
            return vertices;
        }
    }

    public static class GUIExtensions
    {
        public static (bool toggle, bool foldout) ToggleFoldout(bool toggle, bool foldout, string text, GUIStyle foldoutStyle)
        {
            GUILayout.BeginHorizontal();
            toggle = GUILayout.Toggle(toggle, GUIContent.none, GUILayout.ExpandWidth(false));
            foldout = GUILayout.Toggle(foldout, text, foldoutStyle, GUILayout.ExpandWidth(true));
            GUILayout.EndHorizontal();
            return (toggle, foldout);
        }

        public static bool[] ToggleMenu(bool[] toggles, string[] texts, string[] tooltips = null)
        {
            GUILayout.BeginHorizontal();
            GUILayout.Space(20);
            GUILayout.BeginVertical();
            for(int i = 0; i < toggles.Length; i++)
            {
                GUIContent content = new GUIContent(texts[i], tooltips != null ? tooltips[i] : "");
                toggles[i] = GUILayout.Toggle(toggles[i], content);
            }
            GUILayout.EndVertical();
            GUILayout.EndHorizontal();
            return toggles;
        }
    }
#endregion
}
