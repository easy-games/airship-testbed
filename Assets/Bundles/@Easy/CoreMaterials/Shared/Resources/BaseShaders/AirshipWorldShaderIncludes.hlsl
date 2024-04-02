#ifndef WORLDSHADER_INCLUDE
#define WORLDSHADER_INCLUDE

    #include "AirshipShaderIncludes.hlsl"
    
    //Main programs
    #pragma vertex vertFunction
    #pragma fragment fragFunction

    //Multi shader vars (you need these even if you're not using them, so that material properties can survive editor script reloads)
    float SLIDER_OVERRIDE;
    float EXPLICIT_MAPS;
    float EMISSIVE;
    float RIM_LIGHT;
    float SHADOW_COLOR;
    
        
    //Unity stuff
    float4x4 unity_MatrixVP;
    float4x4 unity_ObjectToWorld;
    float4x4 unity_WorldToObject;
    float4 unity_WorldTransformParams;
    float3 _WorldSpaceCameraPos;

    //SamplerState sampler_MainTex;
    SamplerState my_sampler_point_repeat;
    SamplerState my_sampler_trilinear_repeat;
    
    Texture2D _MainTex;
    float4 _MainTex_TexelSize;
    Texture2D _NormalTex;
    Texture2D _MetalTex;
    Texture2D _RoughTex;
    Texture2D _EmissiveMaskTex;
    
    samplerCUBE _CubeTex;

    float  _Alpha;
    float4 _Color;
    float4 _ShadowColor;
    float4 _SpecularColor;
    float4 _OverrideColor;
    float _OverrideStrength;
    float4 _EmissiveColor;
    half _EmissiveMix;
    float4 _Time;
    float4 _MainTex_ST;

    half _MetalOverride;
    half _RoughOverride;
    half _SliderOverrideMix;

    half _TriplanarScale;

    static const float maxMips = 12;//This is how many miplevels the cubemaps have

    struct Attributes
    {
        float4 positionOS   : POSITION;
        float4 color   : COLOR;
        float3 normal : NORMAL;
        float4 tangent: TANGENT;
        float4 uv_MainTex : TEXCOORD0;

        float2 instanceIndex : TEXCOORD7;
    };

    struct vertToFrag
    {
        float4 positionCS : SV_POSITION;

        float4 color      : COLOR;
        float4 baseColor : TEXCOORD0;
        float4 uv_MainTex : TEXCOORD1;
        float3 worldPos   : TEXCOORD2;

        half3  tspace0 : TEXCOORD3;
        half3  tspace1 : TEXCOORD4;
        half3  tspace2 : TEXCOORD5;

        half3 triplanarBlend : TEXCOORD7;
        float3 triplanarPos : TEXCOORD8;

        float4 shadowCasterPos0 :TEXCOORD9;
        float4 shadowCasterPos1 :TEXCOORD10;

        half3 worldNormal : TEXCOORD11;
    };

    vertToFrag vertFunction(Attributes input)
    {
        vertToFrag output;
        float4 worldPos = mul(unity_ObjectToWorld, input.positionOS);
        output.positionCS = mul(unity_MatrixVP, worldPos);

        // Transform the normal to world space and normalize it
        float3 shadowNormal = normalize(mul(float4(input.normal, 0.0), unity_WorldToObject).xyz);

#if SHADOWS_ON        
        //Calc shadow data
        output.shadowCasterPos0 = CalculateVertexShadowData0(worldPos, shadowNormal);
        output.shadowCasterPos1 = CalculateVertexShadowData1(worldPos, shadowNormal);
#endif
        
        output.uv_MainTex = input.uv_MainTex;
        output.uv_MainTex = float4((input.uv_MainTex * _MainTex_ST.xy + _MainTex_ST.zw).xy, 1, 1);

    //Local triplanar
#ifdef TRIPLANAR_STYLE_LOCAL
        float3 scale;
        scale.x = length(float3(unity_ObjectToWorld._m00, unity_ObjectToWorld._m10, unity_ObjectToWorld._m20));
        scale.y = length(float3(unity_ObjectToWorld._m01, unity_ObjectToWorld._m11, unity_ObjectToWorld._m21));
        scale.z = length(float3(unity_ObjectToWorld._m02, unity_ObjectToWorld._m12, unity_ObjectToWorld._m22));
        output.triplanarPos = float4((input.positionOS * _TriplanarScale + _MainTex_ST.zzz).xyz * scale, 1);
#endif

        //World triplanar
#ifdef TRIPLANAR_STYLE_WORLD
        output.triplanarPos = float4((worldPos * _TriplanarScale + _MainTex_ST.zzz).xyz, 1);
#endif

        output.worldPos = worldPos;
        output.color = input.color;

        output.baseColor = lerp(_Color, _OverrideColor, _OverrideStrength);
        
#if INSTANCE_DATA_ON
		float4 instanceColor = _ColorInstanceData[input.instanceIndex.x];
        output.color *= instanceColor;
#endif

        float3 normalWorld = normalize(mul(float4(input.normal, 0.0), unity_WorldToObject).xyz);
        float3 tangentWorld = normalize(mul(unity_ObjectToWorld, input.tangent.xyz));

        half tangentSign = input.tangent.w * unity_WorldTransformParams.w;
        float3 binormalWorld = cross(normalWorld, tangentWorld) * tangentSign;

        output.tspace0 = half3(tangentWorld.x, binormalWorld.x, normalWorld.x);
        output.tspace1 = half3(tangentWorld.y, binormalWorld.y, normalWorld.y);
        output.tspace2 = half3(tangentWorld.z, binormalWorld.z, normalWorld.z);

        output.worldNormal = normalWorld;

        //calculate the triplanar blend based on the local normal
#ifdef TRIPLANAR_STYLE_LOCAL
        //Localspace triplanar
        output.triplanarBlend = normalize(abs(input.normal));
        output.triplanarBlend /= dot(output.triplanarBlend, (half3)1);


#endif

#ifdef TRIPLANAR_STYLE_WORLD
        //Worldspace triplanar
        output.triplanarBlend = normalize(abs(normalWorld));
        output.triplanarBlend /= dot(output.triplanarBlend, (half3)1);

#endif
        return output;
    }

    half3 DecodeNormal(half3 norm)
    {
        return norm * 2.0 - 1.0;
    }

    half3 EncodeNormal(half3 norm)
    {
        return norm * 0.5 + 0.5;
    }

    //Two channel packed normals (assumes never negative z)
    half3 TextureDecodeNormal(half3 norm)
    {
        half3 n;
        n.xy = norm.xy * 2 - 1;
        n.z = sqrt(1 - dot(n.xy, n.xy));
        return n;
    }

    static float4 color1 = float4(1, 0, 0, 1); // red
    static float4 color2 = float4(1, 0.5, 0, 1); // orange
    static float4 color3 = float4(1, 1, 0, 1); // yellow
    static float4 color4 = float4(0, 1, 0, 1); // green
    static float4 color5 = float4(0, 0, 1, 1); // blue
    static float4 color6 = float4(0.5, 0, 1, 1); // purple
    static float4 color7 = float4(1, 0, 1, 1); // pink
    static float4 color8 = float4(0, 1, 1, 1);  // teal
    static float4 color9 = float4(1, 0, 1, 1); //more purple
    static float4 color10 = float4(0, 1, 0.5, 1); // ,0. 5,1); //more green
    static float4 color11 = float4(1, 1, 1, 1); // white

    float4 debugColor(float blendValue)
    {
        float4 color;
        if (blendValue < 1)
            color = color1;
        else if (blendValue < 2)
            color = lerp(color2, color3, blendValue - 1);
        else if (blendValue < 3)
            color = lerp(color3, color4, blendValue - 2);
        else if (blendValue < 4)
            color = lerp(color4, color5, blendValue - 3);
        else if (blendValue < 5)
            color = lerp(color5, color6, blendValue - 4);
        else if (blendValue < 6)
            color = lerp(color6, color7, blendValue - 5);
        else if (blendValue < 7)
            color = lerp(color7, color8, blendValue - 6);
        else if (blendValue < 8)
            color = lerp(color8, color9, blendValue - 7);
        else if (blendValue < 9)
            color = lerp(color9, color10, blendValue - 8);
        else
            color = color11;
        return color;
    }
    
    struct Coordinates
    {
        half2 ddx;
        half2 ddy;
        half lod;
        half2 uvs;
        float3 pos;
        half3 triplanarBlend;
    };

    //Fancy filter that blends between point sampling and bilinear sampling
    half4 Tex2DSampleTexture(Texture2D tex, Coordinates coords)
    {
#if defined(TRIPLANAR_STYLE_LOCAL) || defined(TRIPLANAR_STYLE_WORLD)
		//float2 tx = coords.pos.yz; --Why is zy correct here for some things, and yz for others??
        //
        float2 tx = coords.pos.zy;
        float2 ty = coords.pos.xz;
        float2 tz = coords.pos.xy;

        half4 cx = tex.Sample(my_sampler_trilinear_repeat, tx) * coords.triplanarBlend.x;
        half4 cy = tex.Sample(my_sampler_trilinear_repeat, ty) * coords.triplanarBlend.y;
        half4 cz = tex.Sample(my_sampler_trilinear_repeat, tz) * coords.triplanarBlend.z;
        half4 color = (cx + cy + cz);
        return color;
#endif

#ifdef POINT_FILTER_ON

        const half bias = 0.0;//magic number, bigger value pushes the transition back further
        half blendValue = saturate((coords.lod) - bias);
        half4 pixelSample = tex.Sample(my_sampler_point_repeat, coords.uvs);

        float mipMap = coords.lod;
        mipMap = min(mipMap, 5); //clamp it because metal doesnt support partial mipmap chains (also possibly others)

        half4 filteredSample = tex.SampleLevel(my_sampler_trilinear_repeat, coords.uvs, mipMap);

        half4 blend = lerp(pixelSample, filteredSample, blendValue);

        //return half4(blend.x, blend.y, blendValue ,1);
        return blend;
        
#elif !defined(EXPLICIT_MAPS_ON) && defined(SHADER_API_METAL) //Metal specific fix
        float mipMap = coords.lod;
        mipMap = min(mipMap, 5); //clamp it because metal doesnt support partial mipmap chains (also possibly others)

        half4 filteredSample = tex.SampleLevel(my_sampler_trilinear_repeat, coords.uvs, mipMap);
        return filteredSample;
#else
        return tex.Sample(my_sampler_trilinear_repeat, coords.uvs);
#endif
    }
    //Unity encoded normals (the pink ones)
    half3 UnpackNormalmapRGorAG(half4 packednormal)
    {
        packednormal.x *= packednormal.w;

        half3 normal;
        normal.xy = packednormal.xy * 2 - 1;
        normal.z = sqrt(1 - saturate(dot(normal.xy, normal.xy)));

        return normal;
    }

    float3 BlendTriplanarNormal(float3 mappedNormal, float3 surfaceNormal)
    {
        float3 n;
        n.xy = mappedNormal.xy + surfaceNormal.xy;
        n.z = mappedNormal.z * surfaceNormal.z;
        return n;
    }

    half4 TriplanarMapNormal(Texture2D tex, Coordinates coords, half3 worldNormal)
    {
        //The trick here is to realize we can just swizzle the normals to get the correct X Y or Z transform
        half2 triUVx = coords.pos.zy;
        half2 triUVy = coords.pos.xz;
        half2 triUVz = coords.pos.xy;

        //Todo: Flip for the negative faces?
        half3 tangentNormalX = UnpackNormalmapRGorAG(tex.Sample(my_sampler_trilinear_repeat, triUVx));
        half3 tangentNormalY = UnpackNormalmapRGorAG(tex.Sample(my_sampler_trilinear_repeat, triUVy));
        half3 tangentNormalZ = UnpackNormalmapRGorAG(tex.Sample(my_sampler_trilinear_repeat, triUVz));

        //Blend with the
        half3 worldNormalX = BlendTriplanarNormal(tangentNormalX, worldNormal.zyx).zyx * coords.triplanarBlend.x;
        half3 worldNormalY = BlendTriplanarNormal(tangentNormalY, worldNormal.xzy).xzy * coords.triplanarBlend.y;
        half3 worldNormalZ = BlendTriplanarNormal(tangentNormalZ, worldNormal) * coords.triplanarBlend.z;

        return half4(normalize(worldNormalX + worldNormalY + worldNormalZ),1);
    }


    half4 Tex2DSampleTextureUV(Texture2D tex, float4 uvs)
    {
        half4 cx = tex.Sample(my_sampler_trilinear_repeat, uvs);
        return cx;
    }

    half4 Tex2DSampleTextureDebug(Texture2D tex, Coordinates coords)
    {
        return debugColor(coords.lod);
    }

    half UnpackMetal(float metal)
    {
        return metal / 2.0;
    }

    half UnpackEmission(float metal)
    {
        float result = metal > 0.5;
        return result;
    }

    void fragFunction(vertToFrag input, out half4 MRT0 : SV_Target0, out half4 MRT1 : SV_Target1)
    {
        Coordinates coords;
        coords.uvs = input.uv_MainTex.xy;
#ifdef POINT_FILTER_ON
        float2 texture_coordinate = input.uv_MainTex.xy * _MainTex_TexelSize.zw;
        coords.ddx = ddx(texture_coordinate);
        coords.ddy = ddy(texture_coordinate);
        float delta_max_sqr = max(dot(coords.ddx, coords.ddx), dot(coords.ddy, coords.ddy));
        coords.lod = 0.5 * log2(delta_max_sqr);
#elif !defined(EXPLICIT_MAPS_ON) && defined(SHADER_API_METAL) //Metal specific fix
        float2 texture_coordinate = input.uv_MainTex.xy * _MainTex_TexelSize.zw;
        coords.ddx = ddx(texture_coordinate);
        coords.ddy = ddy(texture_coordinate);
        float delta_max_sqr = max(dot(coords.ddx, coords.ddx), dot(coords.ddy, coords.ddy));
        coords.lod = 0.5 * log2(delta_max_sqr);
#else
        coords.ddx = half2(0, 0);
        coords.ddy = half2(0, 0);
        coords.lod = 0;
#endif

#if defined(TRIPLANAR_STYLE_LOCAL) || defined(TRIPLANAR_STYLE_WORLD)
        coords.pos = input.triplanarPos;
        coords.triplanarBlend = input.triplanarBlend;
#endif
        half4 texSample = Tex2DSampleTexture(_MainTex, coords);

        half3 textureNormal;
        half3 worldNormal;
        
        half metallicLevel;
        half roughnessLevel;
        half emissiveLevel = 0;
        half4 reflectedCubeSample;
        half3 worldReflect;
        half alpha = _Alpha;
     
        half3 viewVector = _WorldSpaceCameraPos.xyz - input.worldPos;
        float viewDistance = length(viewVector);
        half3 viewDirection = normalize(viewVector);

#if EXPLICIT_MAPS_ON //Path used by anything passing in explicit maps like triplanar materials
        half4 metalSample = Tex2DSampleTexture(_MetalTex, coords);
        //metalSample = pow(metalSample, 0.45454545); //Match Substance painter? However we should do this at the importer!
        half4 roughSample = Tex2DSampleTexture(_RoughTex, coords);
        //roughSample = pow(roughSample, 0.45454545); //Match Substance painter? However we should do this at the importer!


    #if defined(TRIPLANAR_STYLE_LOCAL) || defined(TRIPLANAR_STYLE_WORLD)
        worldNormal = TriplanarMapNormal(_NormalTex, coords, input.worldNormal);
    #else
        half4 normalSample = (Tex2DSampleTexture(_NormalTex, coords));
        textureNormal = (UnpackNormalmapRGorAG(normalSample));
        textureNormal = normalize(textureNormal);

        worldNormal.x = dot(input.tspace0, textureNormal);
        worldNormal.y = dot(input.tspace1, textureNormal);
        worldNormal.z = dot(input.tspace2, textureNormal);
    #endif
        alpha = texSample.a * _Alpha;

        worldNormal = normalize(worldNormal); //Normalize?
        worldReflect = reflect(-viewDirection, worldNormal);
        
        //Note to self: should try and sample reflectedCubeSample as early as possible
        roughnessLevel = max(roughSample.r, 0.04);
        metallicLevel = metalSample.r;
    #if EMISSIVE_ON
        emissiveLevel = Tex2DSampleTexture(_EmissiveMaskTex, coords).r;
    #else
		emissiveLevel = 0;
    #endif

#else   //Path used by atlas rendering

    #if defined(TRIPLANAR_STYLE_LOCAL) || defined(TRIPLANAR_STYLE_WORLD)
        worldNormal = TriplanarMapNormal(_NormalTex, coords, input.worldNormal);
        half4 specialSample = Tex2DSampleTexture(_NormalTex, coords);
    #else
        //Path used by atlas rendering
        half4 specialSample = Tex2DSampleTexture(_NormalTex, coords);
        textureNormal = (TextureDecodeNormal(specialSample.xyz));
        textureNormal = normalize(textureNormal);

        worldNormal.x = dot(input.tspace0, textureNormal);
        worldNormal.y = dot(input.tspace1, textureNormal);
        worldNormal.z = dot(input.tspace2, textureNormal);
        //#else
    #endif
        worldReflect = reflect(-viewDirection, worldNormal);

        //Note to self: should try and sample reflectedCubeSample as early as possible
        roughnessLevel = max(specialSample.a, 0.04);

        //metallic is packed
        metallicLevel = UnpackMetal(specialSample.b);
    #if EMISSIVE_ON
        emissiveLevel = UnpackEmission(specialSample.b);
        _EmissiveMix = 0;
    #endif

#endif

        // Finish doing ALU calcs while the cubemap fetches in
#ifdef SLIDER_OVERRIDE_ON
        metallicLevel = lerp(_MetalOverride, metallicLevel, _SliderOverrideMix);
        roughnessLevel = lerp(_RoughOverride, roughnessLevel, _SliderOverrideMix);
        roughnessLevel = max(roughnessLevel, 0.04);
        
#endif
        reflectedCubeSample = texCUBElod(_CubeTex, half4(worldReflect, roughnessLevel * maxMips));
        
        half3 complexAmbientSample = SampleAmbientSphericalHarmonics(worldNormal);
        
        //Shadows and light masks
#if SHADOWS_ON        
        half sunShadowMask = GetShadow(input.shadowCasterPos0, input.shadowCasterPos1, worldNormal, globalSunDirection);
#else
        half sunShadowMask = 0;
#endif
       
        
        //Sun
        half RoL = max(0, dot(worldReflect, -globalSunDirection));
        half NoV = max(dot(viewDirection, worldNormal), 0);
        half NoL = dot(-globalSunDirection, worldNormal); // -1 to 1

        /////////////////////////////////////////////////////
        //If you want to use half lambert
        //NoL = saturate((NoL + 1)*.5);
        /////////////////////////////////////////////////////
                
        half3 albedo = texSample.xyz * input.baseColor.rgb;
  
        //Specular
        half3 imageSpecular = reflectedCubeSample.xyz;
        half3 specularColor;
        half3 diffuseColor;
        half dielectricSpecular = 0.08 * 0.3; //0.3 is the industry standard
        diffuseColor = albedo - albedo * metallicLevel;	 
        specularColor = (dielectricSpecular - dielectricSpecular * metallicLevel) + albedo * metallicLevel;
        specularColor = EnvBRDFApprox(specularColor, roughnessLevel, NoV) * _SpecularColor;

        //modify the albedo now
        //albedo = lerp(imageSpecular, albedo, roughnessLevel);
        /*//Alternate material for when metal is totally ignored
            diffuseColor = albedo;
            half specLevel = EnvBRDFApproxNonmetal(roughnessLevel, NoV);
            specularColor = half3(specLevel, specLevel, specLevel);
        */
      

        //Start compositing it all now
        half3 finalColor = half3(0, 0, 0);
        half3 sunIntensity = half3(0, 0, 0);
         
        //Direct sun + specular
        half3 sunColor = (globalSunColor * globalSunBrightness);

        //Sun Term
        half3 sunShine = (sunColor * NoL);
 
        //Sun Specular
        half res = PhongApprox(roughnessLevel, RoL) * globalSunBrightness;
    
        half3 sunSpecular = specularColor * res;
        
        //Final sun term
        half3 sunComposite = (sunShine * diffuseColor) + (sunSpecular);
        //Mask the sun based on the shadows
        half3 finalSun = lerp(sunComposite, sunComposite * sunShadowMask, globalSunShadow);
        
        //SH ambient
        half3 ambientLight = (complexAmbientSample * globalAmbientTint * albedo);
        
        //If we're using separate shadow tints NPR
#ifdef USE_SHADOW_COLOR_ON
        half3 finalAmbient = lerp((ambientLight * _ShadowColor), (ambientLight * albedo), sunShadowMask);
#else
        half3 finalAmbient = ambientLight * albedo;
#endif

        //Sun Rim
        half3 sunRim = ((1 - NoV) * imageSpecular * specularColor);

        
        finalColor = finalSun + finalAmbient + sunRim;

        //finalColor = diffuseColor;
        //@@
        //finalColor = reflectedCubeSample;// sunComposite + sunRim;
        
  

        //Start messing with the final color in fun ways
        
        //Do point lighting
        finalColor.xyz += CalculatePointLightsForPoint(input.worldPos, worldNormal, diffuseColor, roughnessLevel, specularColor, worldReflect);

        //Rim light
#ifdef RIM_LIGHT_ON
        finalColor.xyz += RimLightSimple(worldNormal, viewDirection);
#endif
        //Mix in fog
		finalColor = CalculateAtmosphericFog(finalColor, viewDistance);

        //Final color 
        half brightness = max(max(finalColor.r, finalColor.g), finalColor.b) * alpha;

#ifdef EMISSIVE_ON
        if (emissiveLevel > 0)
        {
            float3 colorMix = lerp(finalColor, albedo, _EmissiveMix);
            MRT0 = half4(colorMix.r, colorMix.g, colorMix.b, alpha);

            float3 emissiveMix = lerp(diffuseColor.rgb, _EmissiveColor.rgb, _EmissiveMix);
            MRT1 = half4(emissiveMix * _EmissiveColor.a, alpha);
        }
        else
        {
            MRT0 = half4(finalColor.r, finalColor.g, finalColor.b, alpha);
 
            ///if (brightness > globalSunBrightness + globalAmbientBrightness)
            if (brightness > 2)
            {
                MRT1 = half4(finalColor.r, finalColor.g, finalColor.b, alpha);
            }
            else
            {
                MRT1 = half4(0, 0, 0, alpha);
            }

        }
#else
        MRT0 = half4(finalColor.r, finalColor.g, finalColor.b, alpha);

        //Choose emissive based on brightness values
        //half brightness = max(max(finalColor.r, finalColor.g), finalColor.b) * (1 - roughnessLevel) * alpha;
      
        ///if (brightness > globalSunBrightness + globalAmbientBrightness)
        if (brightness > 2)
        {
            MRT1 = half4(finalColor.r, finalColor.g, finalColor.b, alpha);
        }
        else
        {
            MRT1 = half4(0, 0, 0, alpha);
        }
#endif
    }

#endif