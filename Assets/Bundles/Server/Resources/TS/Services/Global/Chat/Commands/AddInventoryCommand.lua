-- Compiled with unity-ts v2.1.0-75
local ItemStack = require("Shared/TS/Inventory/ItemStack").ItemStack
local IsItemType = require("Shared/TS/Item/ItemDefinitions").IsItemType
local ChatCommand = require("Server/TS/Services/Global/Chat/Commands/ChatCommand").ChatCommand
local AddInventoryCommand
do
	local super = ChatCommand
	AddInventoryCommand = setmetatable({}, {
		__tostring = function()
			return "AddInventoryCommand"
		end,
		__index = super,
	})
	AddInventoryCommand.__index = AddInventoryCommand
	function AddInventoryCommand.new(...)
		local self = setmetatable({}, AddInventoryCommand)
		return self:constructor(...) or self
	end
	function AddInventoryCommand:constructor()
		super.constructor(self, "addInventory", { "add", "i" })
	end
	function AddInventoryCommand:Execute(player, args)
		if #args < 1 then
			player:SendMessage("Invalid arguments. Usage: /i <item_type> [amount]")
			return nil
		end
		if not IsItemType(string.upper(args[1])) then
			player:SendMessage("Invalid item type: " .. args[1])
			return nil
		end
		local itemType = string.upper(args[1])
		local amount = 1
		if #args >= 2 then
			local num = tonumber(args[2])
			if num ~= nil and num > 0 then
				amount = num
			end
		end
		local itemStack = ItemStack.new(itemType, amount)
		if not player.Character then
			return nil
		end
		player.Character:GetInventory():AddItem(itemStack)
		player:SendMessage("Given " .. (tostring(amount) .. (" " .. itemStack:GetItemMeta().displayName)))
	end
end
return {
	AddInventoryCommand = AddInventoryCommand,
}
-- ----------------------------------
-- ----------------------------------
