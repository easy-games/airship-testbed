Shader "Airship/AirshipSmoke3d"
{
    Properties
    {
        [HDR] _Color1("Color1", Color) = (1,1,1,1)
        _MaskTex("MaskTex", 2D) = "white" {}
        _MainTex("MainTex", 2D) = "white" {}
        _Emissive("Emissive", Range(0,1)) = 1      
        _Scalen("Scalen", Vector) = (1,1,0,0)
        _Vertex("Vertex", Float) = 1
        [KeywordEnum(Zero, One, DstColor, SrcColor, OneMinusDstColor, SrcAlpha, OneMinusSrcColor, DstAlpha, OneMinusDstAlpha, SrcAlphaSaturate, OneMinusSrcAlpha)] _SrcBlend("SourceBlend", Float) = 1.0
		[KeywordEnum(Zero, One, DstColor, SrcColor, OneMinusDstColor, SrcAlpha, OneMinusSrcColor, DstAlpha, OneMinusDstAlpha, SrcAlphaSaturate, OneMinusSrcAlpha)] _DstBlend("DestBlend", Float) = 10.0
    }
    SubShader
    {
        // The value of the LightMode Pass tag must match the ShaderTagId in ScriptableRenderContext.DrawRenderers
        Name "Forward"
        Tags { "RenderType"="Opaque"  
            "LightMode" = "AirshipForwardPass"
			"Queue"="Geometry"}
        Blend[_SrcBlend][_DstBlend]


		ZWrite on
        Cull Back
        
        Pass
        {
            
            CGPROGRAM
            #pragma vertex vert
            #pragma fragment frag
            // make fog work
            #pragma multi_compile_fog

            #include "UnityCG.cginc"
            #include "Assets/AirshipPackages/@Easy/CoreMaterials//BaseShaders/AirshipShaderIncludes.hlsl"

            struct appdata
            {
                float4 vertex : POSITION;
                float4 uv : TEXCOORD0;
                fixed4 color : COLOR;
                float3 normal : NORMAL;
            };

            struct v2f
            {
                float4 uv : TEXCOORD0;
                UNITY_FOG_COORDS(1)
                float4 vertex : SV_POSITION;
                fixed4 color : COLOR;
                float3 viewDir : TEXCOORD1;
                half3 worldNormal :TEXCOORD2;
            };

            
            
            float _Emissive;
            sampler2D _MainTex;
            sampler2D _MaskTex;
            float2 _Scalen;
            float _Vertex;
            float4 _Color1;
            
            

           

            v2f vert (appdata v)
            {
                v2f o;
                v.vertex.xyz += v.normal * (_Vertex + v.uv.w) * tex2Dlod(_MaskTex, float4(v.uv.xy, 0, 0.0)).xxx  * tex2Dlod(_MainTex, float4(v.uv.xy * _Scalen + v.uv.z, 0, 0.0)).xxx;

                o.vertex = UnityObjectToClipPos(v.vertex);
                o.uv = v.uv;
                o.color = SRGBtoLinear(v.color);
                float4 worldPos = mul(unity_ObjectToWorld, v.vertex);
                o.viewDir = normalize(UnityWorldSpaceViewDir(worldPos));
                half3 wNormal = UnityObjectToWorldNormal(v.normal);
                o.worldNormal = wNormal;
                //o.vertex.xyz += o.worldNormal * (_Vertex +  v.uv.w);
                return o;
            }

            fixed4 frag(v2f i, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1) : SV_Target2
            {
               
                float4 finalColor = SRGBtoLinear(_Color1)* tex2D(_MainTex, i.uv*_Scalen + i.uv.z);

                //finalColor.a = pow(rim, _PowerFresnel)*(_Alpha + i.uv.w );
                MRT0 = finalColor;
				MRT1 = _Emissive * finalColor;
                return finalColor;
            }
            ENDCG
        }
    }
}
