Shader "Airship/AirshipSpriteDissolve"
{
    Properties
    {
        [HDR] _Color("Tint", Color) = (1,1,1,1)
        [HDR] _Emissive("Emissive", Range(0,1)) = 1
        _MainTex ("Texture", 2D) = "white" {}
        _Noise ("Noise", 2D) = "white" {}
        _Step ("Step", Float) = 0
       
        [KeywordEnum(Zero, One, DstColor, SrcColor, OneMinusDstColor, SrcAlpha, OneMinusSrcColor, DstAlpha, OneMinusDstAlpha, SrcAlphaSaturate, OneMinusSrcAlpha)] _SrcBlend("SourceBlend", Float) = 1.0
		[KeywordEnum(Zero, One, DstColor, SrcColor, OneMinusDstColor, SrcAlpha, OneMinusSrcColor, DstAlpha, OneMinusDstAlpha, SrcAlphaSaturate, OneMinusSrcAlpha)] _DstBlend("DestBlend", Float) = 10.0
    }
    SubShader
    {
        // The value of the LightMode Pass tag must match the ShaderTagId in ScriptableRenderContext.DrawRenderers
        Name "Forward"
        Tags { "RenderType"="Transparent"  
            "LightMode" = "AirshipForwardPass"
			"Queue"="Transparent"}
        Blend[_SrcBlend][_DstBlend]

		ZWrite off
		Cull off
        
        Pass
        {
            
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            // make fog work
            #pragma multi_compile_fog

            #include "UnityCG.cginc"
            #include "Assets/Bundles/@Easy/CoreMaterials/Shared/Resources/BaseShaders/AirshipShaderIncludes.hlsl"

            struct appdata
            {
                float4 vertex : POSITION;
                float4 uv : TEXCOORD0;
                fixed4 color : COLOR;
            };

            struct v2f
            {
                float4 uv : TEXCOORD0;
                UNITY_FOG_COORDS(1)
                float4 vertex : SV_POSITION;
                fixed4 color : COLOR;
            };

            sampler2D _MainTex;
            sampler2D _Noise;
            float4 _MainTex_ST;
            float4 _Noise_ST;
            float4 _Color;
            float _Emissive;
            float _Step;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                o.color = SRGBtoLinear(v.color);
                return o;
            }

            fixed4 frag (v2f i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1) : SV_Target2
            {
                float2 uv_Noise = i.uv.xy * _Noise_ST.xy + _Noise_ST.zw;


                float4 finalColor = tex2D(_MainTex, i.uv) * _Color * i.color;
                finalColor.a = finalColor.a * step(     (i.uv.z + _Step)    , tex2D(_Noise, (uv_Noise + i.uv.w)).r );
                MRT0 = finalColor;
				MRT1 = _Emissive * finalColor;
                return finalColor;
            }
            ENDCG
        }
    }
}
