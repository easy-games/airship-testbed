Shader "Airship/AirshipSpritedoubleColor"
{
    Properties
    {
        [HDR] _Color1("Color1", Color) = (1,1,1,1)
        [HDR] _Color2("Color2", Color) = (1,1,1,1)
        _Emissive("Emissive", Range(0,1)) = 1
        _MainTex ("Texture", 2D) = "white" {}
        _PowerAlpha ("PowerAlpha;", Float) = 0
        
        _SmoothColor("SmoothColor", Vector) = (0,1,0,0)
       
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
            #include "Packages/gg.easy.airship/Runtime/Code/Airship/Resources/BaseShaders/AirshipShaderIncludes.cginc"

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
            float2 _SmoothColor;
            float4 _Color1;
            float4 _Color2;
            float _Emissive;
           
            float _PowerAlpha;

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
               float2 uv_MainTex = i.uv.xy * _MainTex_ST.xy + _MainTex_ST.zw;

                float smoothstepCol = smoothstep(_SmoothColor.x, _SmoothColor.y, tex2D(_MainTex, uv_MainTex).r);
                float4 finalColor = lerp(SRGBtoLinear(_Color1), SRGBtoLinear(_Color2), smoothstepCol) * i.color;
                finalColor.a = pow(tex2D(_MainTex, uv_MainTex).a, _PowerAlpha) * i.color.a;
                    

               
               
                MRT0 = finalColor;
				MRT1 = _Emissive * finalColor;
                return finalColor;
            }
            ENDCG
        }
    }
}
