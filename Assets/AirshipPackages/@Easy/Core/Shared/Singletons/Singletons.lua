local AirshipSingletons = {}

local registry = {}

function AirshipSingletons.Resolve(typeName: string, timeout: number): AirshipSingleton
    -- required to ensure singletons run before resolve is ran
    local dependencyObject = registry[typeName]

    if not dependencyObject then
        -- delay a frame just in case it's in the midst of loading (unfortunately doing this for now)
        task.unscaledWait()
        dependencyObject = registry[typeName]
    else
        return dependencyObject
    end
    
    -- If it exists after the frame wait, then return it
    if dependencyObject then
        return dependencyObject
    end

    -- If still not found, we're creating it...
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


local exports = {
    SingletonRegistry = AirshipSingletons
}
table.freeze(exports)
return exports