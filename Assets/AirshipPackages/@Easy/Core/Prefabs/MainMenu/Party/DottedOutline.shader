Shader "Unlit/DottedOutline"
{
    Properties
    {
        _BorderColor ("Border Color", Color) = (1,1,1,1)
        _BorderSpeed ("Border Speed", float) = 1
    }
    SubShader
    {
        Tags {"Queue"="Transparent" "RenderType"="Transparent" "RenderPipeline" = "UniversalPipeline" "PreviewType" = "Plane"}
        LOD 100

        Pass
        {
            Blend SrcAlpha OneMinusSrcAlpha
            Cull Off
            ZWrite Off
            ZTest LEqual

            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
            };

            half4 _BorderColor;
            float _BorderSpeed;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = TransformObjectToHClip(v.vertex);
                o.uv = v.uv;
                return o;
            }

            half4 frag (v2f i) : SV_Target
            {
                float offset = i.uv.x - _Time.x * _BorderSpeed;
                float a = min(pow(sin(offset * 100), 8) * 1000, 1);
                return half4(_BorderColor.rgb, _BorderColor.a * a);
            }
            ENDHLSL
        }
    }
}