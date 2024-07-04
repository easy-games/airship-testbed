--[[
    Why hello you pesky peeker - this is the registry for AirshipSingletons!

    :-)
]]
local AirshipSingletons = {}
local registry = {}

type AirshipSingleton = {}
type AirshipBehaviour = {}


function AirshipSingletons.Resolve(typeName: string): AirshipSingleton
    local dependencyObject = registry[typeName]
    
    -- If the dependency doesn't exist, create it
    if dependencyObject ~= nil then
        return dependencyObject
    end

    -- Get or create the Singletons GameObject
    local singletonsGo = GameObject:Find("Singletons")
    if not singletonsGo then
        singletonsGo = GameObject:Create("Singletons")
    end

    -- Create a singleton instance
    local singletonGo = GameObject:Create(typeName)
    singletonGo.transform:SetParent(singletonsGo.transform); -- parent to singletons transform
    
    -- Create the singleton
    local singleton = singletonGo:AddAirshipComponent(typeName)
    -- Add it to the registry
    registry[typeName] = singleton
    -- & Return!
    return singleton
end

function AirshipSingletons.Register(typeName: string, behaviour: AirshipBehaviour): boolean
    -- local component: AirshipBehaviour? = gameObject:GetAirshipComponent(typeName)
    -- if component == nil then
    --     return
    -- end

    if registry[typeName] ~= nil then
        error(`{typeName} already exists in the singleton registry`)
    end

    registry[typeName] = behaviour
    return true
end

function AirshipSingletons.Find(typeName: string)
    return registry[typeName] ~= nil
end

return AirshipSingletons