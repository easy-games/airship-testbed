Shader "Airship/AirshipSmokePlanes"
{
    Properties
    {
        _Color("Tint", Color) = (1,1,1,1)
        _Emissive("Emissive", Range(0,1)) = 1
        _MaskTex ("Mask", 2D) = "white" {}
        _NoiseTex ("Noise", 2D) = "white" {}
       
       
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

            sampler2D _MaskTex;
            sampler2D _NoiseTex;
           
            float4 _Color;
            float _Emissive;
            

           

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                o.color = SRGBtoLinear(v.color);
                return o;
            }

            fixed4 frag(v2f i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1) : SV_Target2
            {


                float4 finalColor = tex2D(_NoiseTex, i.uv.xy).rgba * i.color;


               
                            
                finalColor.a = i.color.a * tex2D(_NoiseTex, i.uv.xy).a * tex2D(_MaskTex, i.uv.xy).r;
                MRT0 = finalColor;
				MRT1 = _Emissive * finalColor;
                return finalColor;
            }
            ENDCG
        }
    }
}
