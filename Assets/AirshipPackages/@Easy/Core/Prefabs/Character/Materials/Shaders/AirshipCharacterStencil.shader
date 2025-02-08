Shader "Airship/AirshipCharacterStencil"
{
    Properties
    {
        _BaseColor ("Color", Color) = (1,1,1,1)
        _ColorDelta ("Use Sceen Color", Range(0,1)) = 1
        _Transparency ("Transparency", Range(0,1)) = 1.0
        _FresnelStrength ("Fresnel Strength", Range(0,2)) = 1.0
        _DitherSize ("Dither Size", float) = 1.0
    }
    SubShader
    {
        Tags { "RenderType"="Geometry-1" "RenderPipeline" = "UniversalRenderPipeline"}
        ZWrite On

        Pass
        {
            Name "Depth Only"
            Tags {"LightMode" = "CharacterDepth"}
            ColorMask 0
        }

        Pass
        {
            Name "Alpha Only"
            Tags {"LightMode" = "CharacterAlpha"}
            //ColorMask 0
            
            HLSLPROGRAM
            #pragma vertex vert
            #pragma fragment frag

            //#include "UnityCG.cginc"
            // The Core.hlsl file contains definitions of frequently used HLSL
            // macros and functions, and also contains #include references to other
            // HLSL files (for example, Common.hlsl, SpaceTransforms.hlsl, etc.).
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"

            struct ModelInputData 
            {
                float4 vertexPos: POSITION;
                float4 normal: NORMAL;
                float4 color: COLOR;
            };
        
            struct VertToFrag
            {
                float4 vertexPos      : SV_POSITION;
                float4 color      : COLOR;
                float4 screenPos     : TEXCOORD1;
                float4 worldPos     : TEXCOORD2;
                float4 fresnelDelta : TEXCOORD3;
            };

            float4 _BaseColor;
            float _FresnelStrength;
            float _Transparency;
            float _DitherSize;

            VertToFrag vert(ModelInputData modelData)
            {
                VertToFrag output;

                //Positions
                output.vertexPos = TransformObjectToHClip(modelData.vertexPos.xyz);
                output.screenPos = ComputeScreenPos(output.vertexPos);
                output.worldPos = mul(unity_ObjectToWorld, modelData.vertexPos);
            
                //Vectors
                float3 worldNormal = TransformObjectToWorldNormal(modelData.normal);
                float3 viewDir = normalize(GetWorldSpaceViewDir(output.worldPos));
                output.fresnelDelta = (1-dot(viewDir, worldNormal)) * _FresnelStrength;
                output.color = modelData.color;

                return output;
            }

            half4 frag(VertToFrag input) : SV_Target
            {
                //return half4(1,0,0,1);
                float4 col = _BaseColor * float4(input.color.rgb, 1);
                float alpha = saturate(_Transparency + (input.fresnelDelta * input.fresnelDelta));
                //alpha = _Transparency;
                //return input.fresnelDelta;

                float DITHER_THRESHOLDS[16] =
                {
                    1.0 / 17.0,  9.0 / 17.0,  3.0 / 17.0, 11.0 / 17.0,
                    13.0 / 17.0,  5.0 / 17.0, 15.0 / 17.0,  7.0 / 17.0,
                    4.0 / 17.0, 12.0 / 17.0,  2.0 / 17.0, 10.0 / 17.0,
                    16.0 / 17.0,  8.0 / 17.0, 14.0 / 17.0,  6.0 / 17.0
                };
            
                float2 uv = input.vertexPos.xy / _ScaledScreenParams.xy;
                uv *= _ScreenParams.xy / _DitherSize;   
                uint index = (uint(uv.x) % 4) * 4 + uint(uv.y) % 4;

                //return alpha;
                // Returns > 0 if not clipped, < 0 if clipped based
                // on the dither
                clip(alpha * col.a - DITHER_THRESHOLDS[index]);

            
                //return input.fresnelDelta;
                return col;
            }
            ENDHLSL
        }

        Pass
        {
            Name "BehindObject"
            Tags{"LightMode" = "CharacterBehindOpaque"}

            HLSLPROGRAM

            #pragma vertex vert
            #pragma fragment frag

            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/Core.hlsl"
            #include "Packages/com.unity.render-pipelines.universal/ShaderLibrary/DeclareOpaqueTexture.hlsl"
            
            float4 _BaseColor;
            float _ColorDelta;

            struct ModelInputData 
            {
                float4 vertexPos: POSITION;
            };
            
            struct VertToFrag
            {
                float4 vertexPos : SV_POSITION;
            };

            VertToFrag vert(ModelInputData modelData)
            {
                VertToFrag output;
                
                //Positions
                output.vertexPos = TransformObjectToHClip(modelData.vertexPos.xyz);

                return output;
            }

            half4 frag(VertToFrag input) : SV_Target
            {
                float2 color_sample_uv = GetNormalizedScreenSpaceUV(input.vertexPos);
                float4 screenColor = float4(SampleSceneColor(color_sample_uv), 1);
                return lerp(_BaseColor, screenColor * screenColor, _ColorDelta);
            }
            ENDHLSL
        }

        

    }

    //Fallback "Universal Render Pipeline/Unlit"
}