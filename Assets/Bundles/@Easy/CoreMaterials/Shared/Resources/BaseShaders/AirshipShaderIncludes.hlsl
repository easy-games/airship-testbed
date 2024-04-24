#ifndef AIRSHIPSHADER_INCLUDE
#define AIRSHIPSHADER_INCLUDE

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
float4 _ShadowBias;
float4x4 _ShadowmapMatrix0;
float4x4 _ShadowmapMatrix1;
Texture2D _GlobalShadowTexture0;
Texture2D _GlobalShadowTexture1;
SamplerComparisonState sampler_GlobalShadowTexture0;
SamplerComparisonState sampler_GlobalShadowTexture1;
/////////////////////



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
    return mul(_ShadowmapMatrix0, worldspacePos + float4((worldspaceNormal * _ShadowBias.x), 0));
}

float4 CalculateVertexShadowData1(float4 worldspacePos, float3 worldspaceNormal)
{
    return mul(_ShadowmapMatrix1, worldspacePos + float4((worldspaceNormal * _ShadowBias.y), 0));
}

#define SAMPLE_TEXTURE2D_SHADOW(textureName, samplerName, coord3) textureName.SampleCmpLevelZero(samplerName, (coord3).xy, (coord3).z)

half GetShadowSample(Texture2D tex, SamplerComparisonState textureSampler, half2 uv, half bias, half comparison)
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


half3 CalculatePointLightsForPoint(float3 worldPos, half3 normal, half3 albedo, half roughness, half metallic, half3 specularColor, half3 reflectionVector)
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

        half phong = PhongApprox(roughness, RoL);
        specularColor = lerp(specularColor, specularColor * lightColor.rgb, metallic); //approx

        result += falloff* (albedo * lightColor.rgb + (phong * specularColor) * lightColor.a);
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

#endif