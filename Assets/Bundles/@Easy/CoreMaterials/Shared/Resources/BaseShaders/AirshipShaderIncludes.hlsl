#ifndef AIRSHIPSHADER_INCLUDE
#define AIRSHIPSHADER_INCLUDE

#include "UnityCG.cginc"
#include "AirshipLightmappingInclude.hlsl"

float INSTANCE_DATA;//Instance of baked mesh
float4 _ColorInstanceData[16];//Instance data (for this material)

//Lighting variables
half3 globalSunDirection = normalize(half3(-1, -3, 1.5));
half globalSunShadow;   //Shadow transparency
half3 globalSunColor;   //Suns color
float globalSunBrightness;  //Suns brightness
half globalAmbientBrightness;
half3 globalAmbientLight[9];//Global ambient values
half3 globalAmbientTint;    //last second RGB tint of the ambient SH
half globalAmbientOcclusion; //For anything that calc's AO

float globalMaxLightingValue;

//Point Lights - these are propertyBlocked onto each material affected
int globalDynamicLightCount;
half4 globalDynamicLightColor[4];
float4 globalDynamicLightPos[4];
half globalDynamicLightRadius[4];

//Fog///////////////
float globalFogStart;
float globalFogEnd;
half3 globalFogColor;

//Rim lighting///
half _RimPower;
half _RimIntensity;
half4 _RimColor;

//Shadow stuff///////
float4 _AirshipShadowBias;
float4x4 _ShadowmapMatrix0;
float4x4 _ShadowmapMatrix1;
Texture2D _GlobalShadowTexture0;
Texture2D _GlobalShadowTexture1;
SamplerComparisonState sampler_GlobalShadowTexture0;
SamplerComparisonState sampler_GlobalShadowTexture1;
/////////////////////
half4 unity_LightData;
half4 unity_LightIndices[2];

//Unity Pixel light stuff
#define MAX_VISIBLE_PIXEL_LIGHTS 256
 
//This is our own custom mirror of the Unity dataset (they call it _AdditionalLights) but seeing we can set this ourselves, we do.
//CBUFFER_START(PixelLights)
float4 _PixelLightsPosition[MAX_VISIBLE_PIXEL_LIGHTS];
half4 _PixelLightsColor[MAX_VISIBLE_PIXEL_LIGHTS];
half4 _PixelLightsAttenuation[MAX_VISIBLE_PIXEL_LIGHTS];
half4 _PixelLightsSpotDir[MAX_VISIBLE_PIXEL_LIGHTS];
float _PixelLightsLayerMasks[MAX_VISIBLE_PIXEL_LIGHTS];
float _PixelLightsVisible[MAX_VISIBLE_PIXEL_LIGHTS];
//CBUFFER_END

half3 AS_SHEvalLinearL2(half3 N, half4 shBr, half4 shBg, half4 shBb, half4 shC)
{
    half3 x2;
    // 4 of the quadratic (L2) polynomials
    half4 vB = N.xyzz * N.yzzx;
    x2.r = dot(shBr, vB);
    x2.g = dot(shBg, vB);
    x2.b = dot(shBb, vB);

    // Final (5th) quadratic (L2) polynomial
    half vC = N.x * N.x - N.y * N.y;
    half3 x3 = shC.rgb * vC;

    return x2 + x3;
}

half3 AS_SHEvalLinearL0L1(half3 N, half4 shAr, half4 shAg, half4 shAb)
{
    half4 vA = half4(N, 1.0);

    half3 x1;
    // Linear (L1) + constant (L0) polynomial terms
    x1.r = dot(shAr, vA);
    x1.g = dot(shAg, vA);
    x1.b = dot(shAb, vA);

    return x1;
}

half3 SampleUnityLightProbe(half3 worldNormal) 
{
#ifdef LIGHTMAP_ON    
    return half3(0, 0, 0);
#else
    // Linear + constant polynomial terms
    half3 res = AS_SHEvalLinearL0L1(worldNormal, unity_SHAr, unity_SHAg, unity_SHAb);

    // Quadratic polynomials
    res += AS_SHEvalLinearL2(worldNormal, unity_SHBr, unity_SHBg, unity_SHBb, unity_SHC);

    return max(res,0);
#endif
}

half4 SRGBtoLinear(half4 srgb)
{
    return pow(srgb, 0.4545454545);
}
half4 LinearToSRGB(half4 srgb)
{
    return pow(srgb, 2.2);
}

//Shadows require your vertex prog to have something akin to:
//output.shadowCasterPos0 = CalculateVertexShadowData0(worldPos, shadowNormal);
//output.shadowCasterPos1 = CalculateVertexShadowData1(worldPos, shadowNormal);

float4 CalculateVertexShadowData0(float4 worldspacePos, float3 worldspaceNormal)
{
    return mul(_ShadowmapMatrix0, worldspacePos + float4((worldspaceNormal * _AirshipShadowBias.x), 0));
}

float4 CalculateVertexShadowData1(float4 worldspacePos, float3 worldspaceNormal)
{
    return mul(_ShadowmapMatrix1, worldspacePos + float4((worldspaceNormal * _AirshipShadowBias.y), 0));
}

#define SAMPLE_TEXTURE2D_SHADOW(textureName, samplerName, coord3) textureName.SampleCmpLevelZero(samplerName, (coord3).xy, (coord3).z)

half GetShadowSampleOld(Texture2D tex, SamplerComparisonState textureSampler, half2 uv, half bias, half comparison)
{
    const float scale = (1.0 / 2048.0) * 0.5;
    half3 offset0 = half3(-1.5 * scale, 0 * scale, 0);
    half3 offset1 = half3(1.5 * scale, 0 * scale, 0);
    half3 offset2 = half3(0 * scale, 1.5 * scale, 0);
    half3 offset3 = half3(0 * scale, -1.5 * scale, 0);

    half3 input = half3(uv.x, 1 - uv.y, comparison + bias);

    half shadowDepth0 = SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, input + offset0).r;
    half shadowDepth1 = SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, input + offset1).r;
    half shadowDepth2 = SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, input + offset2).r;
    half shadowDepth3 = SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, input + offset3).r;

    return (shadowDepth0 + shadowDepth1 + shadowDepth2 + shadowDepth3) * 0.25;
}

float SampleShadow_GetTriangleTexelArea(float triangleHeight)
{
    return triangleHeight - 0.5;
}

void SampleShadow_GetTexelAreas_Tent_3x3(float offset, out float4 computedArea, out float4 computedAreaUncut)
{
    // Compute the exterior areas
    float offset01SquaredHalved = (offset + 0.5) * (offset + 0.5) * 0.5;
    computedAreaUncut.x = computedArea.x = offset01SquaredHalved - offset;
    computedAreaUncut.w = computedArea.w = offset01SquaredHalved;

    // Compute the middle areas
    // For Y : We find the area in Y of as if the left section of the isoceles triangle would
    // intersect the axis between Y and Z (ie where offset = 0).
    computedAreaUncut.y = SampleShadow_GetTriangleTexelArea(1.5 - offset);
    // This area is superior to the one we are looking for if (offset < 0) thus we need to
    // subtract the area of the triangle defined by (0,1.5-offset), (0,1.5+offset), (-offset,1.5).
    float clampedOffsetLeft = min(offset, 0);
    float areaOfSmallLeftTriangle = clampedOffsetLeft * clampedOffsetLeft;
    computedArea.y = computedAreaUncut.y - areaOfSmallLeftTriangle;

    // We do the same for the Z but with the right part of the isoceles triangle
    computedAreaUncut.z = SampleShadow_GetTriangleTexelArea(1.5 + offset);
    float clampedOffsetRight = max(offset, 0);
    float areaOfSmallRightTriangle = clampedOffsetRight * clampedOffsetRight;
    computedArea.z = computedAreaUncut.z - areaOfSmallRightTriangle;
}

void SampleShadow_GetTexelWeights_Tent_5x5(float offset, out float3 texelsWeightsA, out float3 texelsWeightsB)
{
    // See _UnityInternalGetAreaPerTexel_3TexelTriangleFilter for details.
    float4 computedArea_From3texelTriangle;
    float4 computedAreaUncut_From3texelTriangle;
    SampleShadow_GetTexelAreas_Tent_3x3(offset, computedArea_From3texelTriangle, computedAreaUncut_From3texelTriangle);

    // Triangle slope is 45 degree thus we can almost reuse the result of the 3 texel wide computation.
    // the 5 texel wide triangle can be seen as the 3 texel wide one but shifted up by one unit/texel.
    // 0.16 is 1/(the triangle area)
    texelsWeightsA.x = 0.16 * (computedArea_From3texelTriangle.x);
    texelsWeightsA.y = 0.16 * (computedAreaUncut_From3texelTriangle.y);
    texelsWeightsA.z = 0.16 * (computedArea_From3texelTriangle.y + 1);
    texelsWeightsB.x = 0.16 * (computedArea_From3texelTriangle.z + 1);
    texelsWeightsB.y = 0.16 * (computedAreaUncut_From3texelTriangle.z);
    texelsWeightsB.z = 0.16 * (computedArea_From3texelTriangle.w);
}

// 5x5 Tent filter (45 degree sloped triangles in U and V)
void SampleShadow_ComputeSamples_Tent_5x5(float4 shadowMapTexture_TexelSize, float2 coord, out float fetchesWeights[9], out float2 fetchesUV[9])
{
    // tent base is 5x5 base thus covering from 25 to 36 texels, thus we need 9 bilinear PCF fetches
    float2 tentCenterInTexelSpace = coord.xy * shadowMapTexture_TexelSize.zw;
    float2 centerOfFetchesInTexelSpace = floor(tentCenterInTexelSpace + 0.5);
    float2 offsetFromTentCenterToCenterOfFetches = tentCenterInTexelSpace - centerOfFetchesInTexelSpace;

    // find the weight of each texel based on the area of a 45 degree slop tent above each of them.
    float3 texelsWeightsU_A, texelsWeightsU_B;
    float3 texelsWeightsV_A, texelsWeightsV_B;
    SampleShadow_GetTexelWeights_Tent_5x5(offsetFromTentCenterToCenterOfFetches.x, texelsWeightsU_A, texelsWeightsU_B);
    SampleShadow_GetTexelWeights_Tent_5x5(offsetFromTentCenterToCenterOfFetches.y, texelsWeightsV_A, texelsWeightsV_B);

    // each fetch will cover a group of 2x2 texels, the weight of each group is the sum of the weights of the texels
    float3 fetchesWeightsU = float3(texelsWeightsU_A.xz, texelsWeightsU_B.y) + float3(texelsWeightsU_A.y, texelsWeightsU_B.xz);
    float3 fetchesWeightsV = float3(texelsWeightsV_A.xz, texelsWeightsV_B.y) + float3(texelsWeightsV_A.y, texelsWeightsV_B.xz);

    // move the PCF bilinear fetches to respect texels weights
    float3 fetchesOffsetsU = float3(texelsWeightsU_A.y, texelsWeightsU_B.xz) / fetchesWeightsU.xyz + float3(-2.5, -0.5, 1.5);
    float3 fetchesOffsetsV = float3(texelsWeightsV_A.y, texelsWeightsV_B.xz) / fetchesWeightsV.xyz + float3(-2.5, -0.5, 1.5);
    fetchesOffsetsU *= shadowMapTexture_TexelSize.xxx;
    fetchesOffsetsV *= shadowMapTexture_TexelSize.yyy;

    float2 bilinearFetchOrigin = centerOfFetchesInTexelSpace * shadowMapTexture_TexelSize.xy;
    fetchesUV[0] = bilinearFetchOrigin + float2(fetchesOffsetsU.x, fetchesOffsetsV.x);
    fetchesUV[1] = bilinearFetchOrigin + float2(fetchesOffsetsU.y, fetchesOffsetsV.x);
    fetchesUV[2] = bilinearFetchOrigin + float2(fetchesOffsetsU.z, fetchesOffsetsV.x);
    fetchesUV[3] = bilinearFetchOrigin + float2(fetchesOffsetsU.x, fetchesOffsetsV.y);
    fetchesUV[4] = bilinearFetchOrigin + float2(fetchesOffsetsU.y, fetchesOffsetsV.y);
    fetchesUV[5] = bilinearFetchOrigin + float2(fetchesOffsetsU.z, fetchesOffsetsV.y);
    fetchesUV[6] = bilinearFetchOrigin + float2(fetchesOffsetsU.x, fetchesOffsetsV.z);
    fetchesUV[7] = bilinearFetchOrigin + float2(fetchesOffsetsU.y, fetchesOffsetsV.z);
    fetchesUV[8] = bilinearFetchOrigin + float2(fetchesOffsetsU.z, fetchesOffsetsV.z);

    fetchesWeights[0] = fetchesWeightsU.x * fetchesWeightsV.x;
    fetchesWeights[1] = fetchesWeightsU.y * fetchesWeightsV.x;
    fetchesWeights[2] = fetchesWeightsU.z * fetchesWeightsV.x;
    fetchesWeights[3] = fetchesWeightsU.x * fetchesWeightsV.y;
    fetchesWeights[4] = fetchesWeightsU.y * fetchesWeightsV.y;
    fetchesWeights[5] = fetchesWeightsU.z * fetchesWeightsV.y;
    fetchesWeights[6] = fetchesWeightsU.x * fetchesWeightsV.z;
    fetchesWeights[7] = fetchesWeightsU.y * fetchesWeightsV.z;
    fetchesWeights[8] = fetchesWeightsU.z * fetchesWeightsV.z;
}


half GetShadowSample(Texture2D tex, SamplerComparisonState textureSampler, half2 shadowCoord, half bias, half comparison)
{

    //Improved shadow sampling
    float fetchesWeights[9];
    float2 fetchesUV[9];
    float size = 2048;

	shadowCoord = half2(shadowCoord.x, 1 - shadowCoord.y); //Flip Y, because RTT
	float4 shadowmapSize = float4(1.0 / size, 1.0 / size, size, size); // (xy: 1/width and 1/height, zw: width and height)
    SampleShadow_ComputeSamples_Tent_5x5(shadowmapSize, shadowCoord.xy, fetchesWeights, fetchesUV);

    half attenuation = 0;
    attenuation =  fetchesWeights[0] * SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, float3(fetchesUV[0].xy, comparison));
    attenuation += fetchesWeights[1] * SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, float3(fetchesUV[1].xy, comparison));
    attenuation += fetchesWeights[2] * SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, float3(fetchesUV[2].xy, comparison));
    attenuation += fetchesWeights[3] * SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, float3(fetchesUV[3].xy, comparison));
    attenuation += fetchesWeights[4] * SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, float3(fetchesUV[4].xy, comparison));
    attenuation += fetchesWeights[5] * SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, float3(fetchesUV[5].xy, comparison));
    attenuation += fetchesWeights[6] * SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, float3(fetchesUV[6].xy, comparison));
    attenuation += fetchesWeights[7] * SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, float3(fetchesUV[7].xy, comparison));
    attenuation += fetchesWeights[8] * SAMPLE_TEXTURE2D_SHADOW(tex, textureSampler, float3(fetchesUV[8].xy, comparison));

    return attenuation;
}

half CalculateShadowLightTerm(half3 worldNormal, half3 lightDir)
{
    //Do a small angle where shadows aggressively blend in based on incidence from the light - this stops shadows popping but they 
    //appear a little 'earlier' than strictly realistic
    const half lightFadeAngle = 0.1; //0.1 is about 6 degrees
    half lightTerm = dot(worldNormal, -lightDir);
    lightTerm = max(lightTerm, 0);
    half underFadeAngleFactor = lightTerm < lightFadeAngle ? 1.0 : 0.0;
    lightTerm = lerp(1.0, lightTerm / lightFadeAngle, underFadeAngleFactor);

    return lightTerm;
}

half GetShadow(float4 shadowCasterPos0, float4 shadowCasterPos1, half3 worldNormal, half3 lightDir)
{
    //Shadows
    half lightTerm = CalculateShadowLightTerm(worldNormal, lightDir);
    if (lightTerm < 0.001)//benchmark me
    {
        return 0;
    }

    half3 shadowPos0 = shadowCasterPos0.xyz / shadowCasterPos0.w;
    half2 shadowUV0 = shadowPos0.xy * 0.5 + 0.5;

    if (shadowUV0.x < 0 || shadowUV0.x > 1 || shadowUV0.y < 0 || shadowUV0.y > 1)
    {
        //Check the distant cascade
        half3 shadowPos1 = shadowCasterPos1.xyz / shadowCasterPos1.w;
        half2 shadowUV1 = shadowPos1.xy * 0.5 + 0.5;

        if (shadowUV1.x < 0 || shadowUV1.x > 1 || shadowUV1.y < 0 || shadowUV1.y > 1)
        {
            return lightTerm;
        }

        // Compare depths (shadow caster and current pixel)
        half sampleDepth1 = -shadowPos1.z * 0.5f + 0.5f;
        half3 inputPos = half3(shadowUV1.x, 1 - shadowUV1.y, sampleDepth1);
        half shadowFactor = SAMPLE_TEXTURE2D_SHADOW(_GlobalShadowTexture1, sampler_GlobalShadowTexture1, inputPos);

        return shadowFactor * lightTerm;
    }
    else
    {
        // Compare depths (shadow caster and current pixel)
        half sampleDepth0 = -shadowPos0.z * 0.5f + 0.5f;
        half shadowFactor0 = GetShadowSample(_GlobalShadowTexture0, sampler_GlobalShadowTexture0, shadowUV0, 0, sampleDepth0);

        return shadowFactor0 * lightTerm;
    }
}
 
float rcp(float r)
{
    return 1.0 / r;
}

float3 EnvBRDFApprox(float3 SpecularColor, float Roughness, float NoV)
{
    // [ Lazarov 2013, "Getting More Physical in Call of Duty: Black Ops II" ]
    // Adaptation to fit our G term.
    const float4 c0 = float4(-1, -0.0275, -0.572, 0.022);
    const float4 c1 = float4(1, 0.0425, 1.04, -0.04);
    float4 r = Roughness * c0 + c1;
    float a004 = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
    float2 AB = float2(-1.04, 1.04) * a004 + r.zw;

    return SpecularColor * AB.x + AB.y;
}

float PhongApprox(float Roughness, float RoL)
{
    float a = Roughness * Roughness;			// 1 mul
    //!! Ronin Hack?
    a = max(a, 0.008);						// avoid underflow in FP16, next sqr should be bigger than 6.1e-5
    float a2 = a * a;						// 1 mul
    float rcp_a2 = rcp(a2);					// 1 rcp
    //float rcp_a2 = exp2(-6.88886882 * Roughness + 6.88886882);

    // Spherical Gaussian approximation: pow( x, n ) ~= exp( (n + 0.775) * (x - 1) )
    // Phong: n = 0.5 / a2 - 0.5
    // 0.5 / ln(2), 0.275 / ln(2)
    float c = 0.72134752 * rcp_a2 + 0.39674113;	// 1 mad
    float p = rcp_a2 * exp2(c * RoL - c);		// 2 mad, 1 exp2, 1 mul
    // Total 7 instr
    return min(p, rcp_a2);						// Avoid overflow/underflow on Mali GPUs
}

uint GetLightsCount()
{
    return (uint)unity_LightData.y;
}

uint GetGlobalLightIndex(uint index)
{
    //float4 tmp = unity_LightIndices[index / 4];
    //return int(tmp[index % 4]);
    int lightIndex = unity_LightIndices[(uint)index / 4][(uint)index % 4];
    return lightIndex;
}

struct LightStruct {
    float3 position;
    half3 lightColor;
    half3 lightDirection;
	half intensity;
    half attenuation;
    half visible;
};

float DistanceAttenuation(float distanceSqr, half2 distanceAttenuation)
{
    // We use a shared distance attenuation for additional directional and puctual lights
    // for directional lights attenuation will be 1
    float lightAtten = rcp(distanceSqr);
    float2 distanceAttenuationFloat = float2(distanceAttenuation);

    // Use the smoothing factor also used in the Unity lightmapper.
    half factor = half(distanceSqr * distanceAttenuationFloat.x);
    half smoothFactor = saturate(half(1.0) - factor * factor);
    smoothFactor = smoothFactor * smoothFactor;

    return lightAtten * smoothFactor;
}

half AngleAttenuation(half3 spotDirection, half3 lightDirection, half2 spotAttenuation)
{
    // Spot Attenuation with a linear falloff can be defined as
    // (SdotL - cosOuterAngle) / (cosInnerAngle - cosOuterAngle)
    // This can be rewritten as
    // invAngleRange = 1.0 / (cosInnerAngle - cosOuterAngle)
    // SdotL * invAngleRange + (-cosOuterAngle * invAngleRange)
    // SdotL * spotAttenuation.x + spotAttenuation.y

    // If we precompute the terms in a MAD instruction
    half SdotL = dot(spotDirection, lightDirection);
    half atten = saturate(SdotL * spotAttenuation.x + spotAttenuation.y);
    return atten * atten;
}

LightStruct GetLight(uint localIndex, float3 worldPos)
{
    //Largely lifted directly from unity
	uint globalIndex = GetGlobalLightIndex(localIndex);
    
    //Grab the light object out of the structs
    LightStruct result;

    result.visible = _PixelLightsVisible[globalIndex];

    half4 lightPositionWS = _PixelLightsPosition[globalIndex];
    result.position = lightPositionWS.xyz;
	result.lightColor = _PixelLightsColor[globalIndex].rgb;
    result.intensity = _PixelLightsColor[globalIndex].a;

    half4 distanceAndSpotAttenuation = _PixelLightsAttenuation[globalIndex];
    half4 spotDirection = _PixelLightsSpotDir[globalIndex];
    
    // Directional lights store direction in lightPosition.xyz and have .w set to 0.0.
    // This way the following code will work for both directional and punctual lights.
    float3 lightVector = lightPositionWS.xyz - worldPos * lightPositionWS.w;
    float distanceSqr = max(dot(lightVector, lightVector), 6.103515625e-5); //HALF_MIN

    half3 lightDirection = half3(lightVector * rsqrt(distanceSqr));
    result.lightDirection = lightDirection;
    // full-float precision required on some platforms
    result.attenuation = DistanceAttenuation(distanceSqr, distanceAndSpotAttenuation.xy) * AngleAttenuation(spotDirection.xyz, lightDirection, distanceAndSpotAttenuation.zw);
    
    //result.layerMasl = _PixelLightsLayerMasks[MAX_VISIBLE_PIXEL_LIGHTS];

	return result;
}

half3 IntToDebugColor(int input)
{
	//Return distinctive colors for 0,1,2 etc
	if (input == 0)
	{
		return float3(1, 0, 0); //red
	}
	else if (input == 1)
	{
		return float3(0, 1, 0); //green
	}
	else if (input == 2)
	{
		return float3(0, 0, 1); //blue
	}
	else if (input == 3)
	{
		return float3(1, 1, 0); //yellow
	}
	else if (input == 4)
	{
		return float3(1, 0, 1); //purple
	}
	else if (input == 5)
	{
		return float3(0, 1, 1); //teal
	}
	else if (input == 6)
	{
		return float3(1, 1, 1); //white
	}
	else
	{
		return float3(0, 0, 0); //black
	}

}

half3 CalculatePointLightsForPoint(float3 worldPos, half3 normal, half3 albedo, half roughness, half metallic, half3 specularColor, half3 reflectionVector, half3 cubemapSample)
{
    uint pixelLightCount = GetLightsCount();
    half3 results = half3(0, 0, 0);
   
    for (uint lightIndex = 0; lightIndex < min(8,pixelLightCount); lightIndex++) //min here to tell the compiler its 8 max
    {
        LightStruct light = GetLight(lightIndex, worldPos);
      
        if (light.visible > 0) { //Lights can be marked as assigned to this object even if they didnt pass the visibility test. So we doublecheck it here with our own visibility list

#ifdef _LIGHT_LAYERS
            if (IsMatchingLightLayer(light.layerMask, meshRenderingLayers)) //todo
#endif
            {
                float RoL = max(0, dot(reflectionVector, light.lightDirection));
                float NoL = max(0, dot(normal, light.lightDirection));

                half falloff = max(light.attenuation * NoL * light.intensity,0);

                half phong = PhongApprox(roughness, RoL);
                half3 localSpecularColor = specularColor * light.lightColor.rgb;
                half3 lightContribution = (albedo * light.lightColor.rgb) + (phong * localSpecularColor) + (cubemapSample * localSpecularColor);

                results += max(lightContribution * falloff,0);
            }
        }
       
    }
    
    return results;
}


half3 CalculatePointLightsForPointOld(float3 worldPos, half3 normal, half3 albedo, half roughness, half metallic, half3 specularColor, half3 reflectionVector, half3 cubemapSample)
{
	half3 result = half3(0, 0, 0);
    
    for (int i = 0; i < globalDynamicLightCount; i++)
    {
        float3 lightPos = globalDynamicLightPos[i].xyz;
        half4 lightColor = globalDynamicLightColor[i];
        half lightRange = globalDynamicLightRadius[i];

        float3 lightVec = lightPos - worldPos;
        half distance = length(lightVec);
        half3 lightDir = normalize(lightVec);
        
        float RoL = max(0, dot(reflectionVector, lightDir));
        float NoL = max(0, dot(normal, lightDir));

        float distanceNorm = saturate(distance / lightRange);
        float falloff = pow(distanceNorm, 2.0);
        falloff = 1.0 - falloff;

        falloff *= NoL;

        half phong = PhongApprox(roughness, RoL) ;
        
		half3 lightContribution = (albedo * lightColor.rgb) + (phong * specularColor) + (cubemapSample * specularColor);

        result += lightContribution * falloff * lightColor.a;
    }
    return result;
}

 

inline half3 CalculateAtmosphericFog(half3 currentFragColor, float viewDistance)
{
    // Calculate fog factor
    float fogFactor = saturate((globalFogEnd - viewDistance) / (globalFogEnd - globalFogStart));

    fogFactor = pow(fogFactor, 2);

    // Mix current fragment color with fog color
    half3 finalColor = lerp(globalFogColor, currentFragColor, fogFactor);

    return finalColor;
}


half3 RimLight(half3 normal, half3 viewDir, half3 lightDir)
{
    float rim = 1 - dot(normal, lightDir);
    rim = pow(rim, _RimPower);
    rim *= _RimIntensity;
    rim = saturate(rim);

    return _RimColor.rgb * rim;
}

half3 RimLightSimple(half3 normal, half3 viewDir)
{
    float rim = 1 - dot(normal, viewDir);
    rim = pow(rim, _RimPower);
    rim *= _RimIntensity;
    rim = saturate(rim);

    return _RimColor.rgb * rim;
}

float RimLightDelta(half3 normal, half3 viewDir, float power, float intensity)
{
    float rim = 1 - dot(normal, viewDir);
    rim = pow(rim, power);
    rim *= intensity;
    rim = saturate(rim);
    return rim;
}

inline half3 SampleAmbientSphericalHarmonics(half3 nor)
{
    const float c1 = 0.429043;
    const float c2 = 0.511664;
    const float c3 = 0.743125;
    const float c4 = 0.886227;
    const float c5 = 0.247708;
    return (
        c1 * globalAmbientLight[8].xyz * (nor.x * nor.x - nor.y * nor.y) +
        c3 * globalAmbientLight[6].xyz * nor.z * nor.z +
        c4 * globalAmbientLight[0].xyz -
        c5 * globalAmbientLight[6].xyz +
        2.0 * c1 * globalAmbientLight[4].xyz * nor.x * nor.y +
        2.0 * c1 * globalAmbientLight[7].xyz * nor.x * nor.z +
        2.0 * c1 * globalAmbientLight[5].xyz * nor.y * nor.z +
        2.0 * c2 * globalAmbientLight[3].xyz * nor.x +
        2.0 * c2 * globalAmbientLight[1].xyz * nor.y +
        2.0 * c2 * globalAmbientLight[2].xyz * nor.z
        ) * globalAmbientBrightness;
}

float ConvertFromNormalizedRange(float normalizedNumber)
{
    return normalizedNumber * 2 - 1;
}

float ConvertToNormalizedRange(float negativeRangeNumber)
{
    return (negativeRangeNumber + 1) / 2;
}

 
 
//Insert exposure controls here
void DoFinalColorWrite(float4 inputRGBA, float3 emissive, out half4 MRT0, out half4 MRT1)
{
    //half4 rgbm = EncodeRGBM(inputRGBA.rgb);
    
	//MRT0 = half4(rgbm.r, rgbm.g, rgbm.b, inputRGBA.a);
	//MRT1 = half4(rgbm.a, rgbm.a, rgbm.a, rgbm.a);
    MRT0 = inputRGBA;
    MRT1 = float4(emissive, 1);
}


float3 CalculateSimpleSpecularLight(float3 lightDir, float3 viewDir, float3 normal, float specPow)
{
    float3 reflectDir = reflect(lightDir, normal);
    float specFactor = pow(max(dot(reflectDir, viewDir), 0.0), specPow);
    return float3(specFactor, specFactor, specFactor);
}

half4 DoBloomCutoff(half3 inputColor, half alpha, half cutoff)
{
	half luminance = max(max(inputColor.r, inputColor.g), inputColor.b);
    half bloomFactor = smoothstep(cutoff, cutoff + 0.05, luminance);
    bloomFactor *= luminance;
  
	return half4(inputColor * bloomFactor, alpha);
}



#endif