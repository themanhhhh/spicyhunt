import Address from '../models/Address.js';

// Create a new address
export const createAddress = async (req, res) => {
  try {
    const { addressDetail, addressIp, isDefault } = req.body;
    if (!addressDetail || !addressIp) {
      return res.status(400).json({ message: 'addressDetail and addressIp are required' });
    }
    const address = new Address({
      userId: req.userId,
      addressDetail,
      addressIp,
      isDefault: isDefault || false
    });
    await address.save();
    res.status(201).json({ message: 'Address created successfully', id: address._id, data: address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all addresses for current user
export const getUserAddresses = async (req, res) => {
  try {
    const { page = 0, size = 10 } = req.query;
    const addresses = await Address.find({ userId: req.userId })
      .skip(Number(page) * Number(size))
      .limit(Number(size));
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get address by ID
export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.userId });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update an address
export const updateAddress = async (req, res) => {
  try {
    const { addressDetail, isDefault } = req.body;
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { addressDetail, isDefault },
      { new: true }
    );
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address updated successfully', data: address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete an address
export const deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Address deleted successfully', data: address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    // Unset all user's default addresses
    await Address.updateMany({ userId: req.userId }, { isDefault: false });
    // Set the selected address as default
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDefault: true },
      { new: true }
    );
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json({ message: 'Default address updated successfully', data: address });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update address default - alternative endpoint (PUT /default/:id)
export const updateAddressDefault = async (req, res) => {
  try {
    // Unset all user's default addresses
    await Address.updateMany({ userId: req.userId }, { isDefault: false });
    // Set the selected address as default
    const address = await Address.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isDefault: true },
      { new: true }
    );
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: address
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
