 

Shader "Hidden/AirshipErrorShader"
{

    Properties
    {
        // Blending state
      [HideInInspector] _ZWrite("__zw", Float) = 1.0
    }
    
    SubShader
    {
        Pass
        {
            // The value of the LightMode Pass tag must match the ShaderTagId in ScriptableRenderContext.DrawRenderers
            Name "Error"
            Tags { "LightMode" = "AirshipForwardPass" "Queue" = "Opaque"}
        
            ZWrite[_ZWrite]

            HLSLPROGRAM
            #pragma vertex vertFunction
            #pragma fragment fragFunction

            float4x4 unity_MatrixVP;
            float4x4 unity_ObjectToWorld;

            float4 _RealTime;
 
        
            struct Attributes
            {
                float4 positionOS   : POSITION;
                float3 normal   : NORMAL;
            };

            struct vertToFrag
            {
                float4 positionCS : SV_POSITION;
                float4 localPos : TEXCOORD1;
                float4 worldPos : TEXCOORD2;
				float3 color: COLOR;
            };

            float3 DoLight(float3 direction, float3 color, float3 normal)
            {
                
                return clamp(dot(-normalize(direction), normal), 0, 1) * color;
            }

            vertToFrag vertFunction(Attributes input)
            {
                vertToFrag output;
                float4 worldPos = mul(unity_ObjectToWorld, input.positionOS);

                output.positionCS = mul(unity_MatrixVP, worldPos);
			    
                
                //do a couple fake lights
                float3 lighting = float3(0.2, 0.2, 0.2);

                //Ambient
                lighting += DoLight(float3(-1.5, -1, -1), float3(0.25, 0.25, 0.25), input.normal);
                lighting += DoLight(float3(1.5, -1, 1), float3(0.25, 0.25, 0.25), input.normal);
                lighting += DoLight(float3(1, 1.5, 1), float3(0.25, 0.25, 0.25), input.normal);

                //top
				lighting += DoLight(float3(0, 0, -1), float3(1,1,1), input.normal);
                
                

                output.color = lighting;
                output.localPos = float4(input.positionOS.xyz,0);

				output.worldPos = worldPos;
                return output;
            }

        
        
             
            float4 fragFunction(vertToFrag input) : SV_TARGET
            {
                float3 color = input.color;

                // Adjusting the scale factor to control the size of the checkers
                float scale = 2.0;
                // Apply a smooth continuous animation by using a sine function or similar
                // This avoids abrupt changes in the checker pattern's parity
                float3 animatedOffset = float3(_RealTime.x, _RealTime.x, _RealTime.x) * 0.5; // Example animation
                float3 coord = (input.worldPos.xyz + animatedOffset) * scale;

                // Checker calculation
                uint checkerX = uint(floor(coord.x)) % 2;
                uint checkerY = uint(floor(coord.y)) % 2;
                uint checkerZ = uint(floor(coord.z)) % 2;

                // Compute the checker pattern based on XOR operations to ensure consistent volumes
                bool isChecker = (checkerX ^ checkerY ^ checkerZ) == 0;

                // Use the checker pattern to blend between the original color and a magenta color
                float checkerMask = isChecker ? 1.0 : 0.0;
                color = lerp(color * 0.2, color * float3(1, 0, 1), checkerMask);

                return float4(color, 1);
            }

            ENDHLSL
        }
    }
}