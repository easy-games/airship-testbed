Shader "Airship/AirshipSpriteOpaque"
{
    Properties
    {
        [HDR] _Color("Tint", Color) = (1,1,1,1)
        _MainTex ("Texture", 2D) = "white" {} 
    }
    SubShader
    {
        Name "Forward"
        Tags { 
            "RenderType"="Opaque"  
            "Queue"="Geometry"
            "LightMode" = "AirshipForwardPass"
        }

		ZWrite on
		Cull off
        
        Pass
        {
            CGPROGRAM

            #pragma vertex vert
            #pragma fragment frag

            #include "UnityCG.cginc"
            #include "../AirshipShaderIncludes.hlsl"

            struct appdata
            {
                float4 vertex : POSITION;
                float2 uv : TEXCOORD0;
                fixed4 color : COLOR;
            };

            struct v2f
            {
                float2 uv : TEXCOORD0;
                float4 vertex : SV_POSITION;
                fixed4 color : COLOR;
            };

            sampler2D _MainTex;
            float4 _MainTex_ST;
            float4 _Color;

            v2f vert (appdata v)
            {
                v2f o;
                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = TRANSFORM_TEX(v.uv, _MainTex);
                o.color = SRGBtoLinear(v.color);
                return o;
            }

            void frag (v2f i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1)
            {
                float4 finalColor = tex2D(_MainTex, i.uv) * _Color * i.color;
                finalColor.a = 1;

				MRT0 = finalColor;
				MRT1 = float4(0,0,0,1);
            }
            ENDCG
        }
    }
}
