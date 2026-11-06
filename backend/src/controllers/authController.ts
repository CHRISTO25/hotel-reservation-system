import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { UserRole } from '../types';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: 'Name, email, and password are required.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({ message: 'An account with this email already exists.' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === UserRole.STAFF ? UserRole.STAFF : UserRole.GUEST;

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: assignedRole,
    });

    const token = jwt.sign(
      { userId: newUser._id.toString(), email: newUser.email, role: newUser.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Registration failed.', error: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Login failed.', error: error.message });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching profile.' });
  }
};