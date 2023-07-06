-- Compiled with unity-ts v2.1.0-75
local GetItemMeta = require("Shared/TS/Item/ItemDefinitions").GetItemMeta
local Signal = require("Shared/TS/Util/Signal").Signal
local ItemStack
do
	ItemStack = setmetatable({}, {
		__tostring = function()
			return "ItemStack"
		end,
	})
	ItemStack.__index = ItemStack
	function ItemStack.new(...)
		local self = setmetatable({}, ItemStack)
		return self:constructor(...) or self
	end
	function ItemStack:constructor(itemType, amount)
		self.Changed = Signal.new()
		self.ItemTypeChanged = Signal.new()
		self.AmountChanged = Signal.new()
		self.Destroyed = Signal.new()
		self.hasBeenDestroyed = false
		self.MaxStackSize = 100
		self.itemType = itemType
		self.amount = amount
	end
	function ItemStack:GetItemType()
		return self.itemType
	end
	function ItemStack:GetItemMeta()
		return GetItemMeta(self.itemType)
	end
	function ItemStack:SetItemType(itemType)
		self.itemType = itemType
		self.ItemTypeChanged:Fire({
			ItemStack = self,
			ItemType = itemType,
			NoNetwork = false,
		})
		self.Changed:Fire()
	end
	function ItemStack:GetAmount()
		return self.amount
	end
	function ItemStack:SetAmount(val, config)
		self.amount = val
		local _fn = self.AmountChanged
		local _object = {
			ItemStack = self,
		}
		local _left = "NoNetwork"
		local _result = config
		if _result ~= nil then
			_result = _result.noNetwork
		end
		local _condition = _result
		if _condition == nil then
			_condition = false
		end
		_object[_left] = _condition
		_object.Amount = val
		_fn:Fire(_object)
		self.Changed:Fire()
		if self.amount <= 0 then
			self:Destroy()
		end
	end
	function ItemStack:CanMerge(other)
		if other:GetItemType() ~= self:GetItemType() then
			return false
		end
		if other:GetAmount() + self:GetAmount() > self.MaxStackSize then
			return false
		end
		return true
	end
	function ItemStack:Encode()
		return {
			i = self.itemType,
			a = self.amount,
		}
	end
	function ItemStack:Decode(dto)
		local item = ItemStack.new(dto.i, dto.a)
		return item
	end
	function ItemStack:GetMeta()
		return GetItemMeta(self.itemType)
	end
	function ItemStack:Decrement(amount, config)
		local _fn = self
		local _exp = math.max(self.amount - amount, 0)
		local _object = {}
		local _left = "noNetwork"
		local _result = config
		if _result ~= nil then
			_result = _result.noNetwork
		end
		_object[_left] = _result
		_fn:SetAmount(_exp, _object)
	end
	function ItemStack:Destroy()
		if self.hasBeenDestroyed then
			return nil
		end
		self.hasBeenDestroyed = true
		self.ItemTypeChanged:DisconnectAll()
		self.AmountChanged:DisconnectAll()
		self.Destroyed:Fire(self)
		self.Destroyed:DisconnectAll()
	end
	function ItemStack:GetMaxStackSize()
		return self.MaxStackSize
	end
	function ItemStack:Clone()
		local clone = ItemStack.new(self.itemType, self.amount)
		return clone
	end
	function ItemStack:IsDestroyed()
		return self.hasBeenDestroyed
	end
end
return {
	ItemStack = ItemStack,
}
-- ----------------------------------
-- ----------------------------------
