import Kitchen from '../models/Kitchen.js';
import bcrypt from 'bcryptjs';

const kitchenRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Kitchen.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const kitchen = await Kitchen.create({
      name,
      email,
      password: hashed,
      status: 'pending'
    });

    res.status(201).json({ success: true, message: 'Registration successful, pending admin approval' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export default kitchenRegister