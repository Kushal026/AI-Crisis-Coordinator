import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

// Store connected users
const connectedUsers = new Map();

export const setupSocketHandlers = (io) => {
  // Authentication middleware for socket
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication required'));
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
      const user = await User.findById(decoded.id).populate('company');
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }
      
      socket.user = user;
      socket.companyId = user.company._id.toString();
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });
  
  io.on('connection', (socket) => {
    const { companyId, user } = socket;
    
    logger.info(`User connected: ${user.email} (Company: ${companyId})`);
    
    // Join company room
    socket.join(`company:${companyId}`);
    
    // Store user connection
    connectedUsers.set(socket.id, {
      userId: user._id,
      companyId,
      email: user.email,
      joinedAt: new Date()
    });
    
    // Handle joining crisis room
    socket.on('crisis:join', (crisisId) => {
      socket.join(`crisis:${crisisId}`);
      logger.info(`User ${user.email} joined crisis room: ${crisisId}`);
    });
    
    // Handle leaving crisis room
    socket.on('crisis:leave', (crisisId) => {
      socket.leave(`crisis:${crisisId}`);
    });
    
    // Handle crisis updates
    socket.on('crisis:update', async (data) => {
      socket.to(`company:${companyId}`).emit('crisis:updated', {
        crisisId: data.crisisId,
        updatedBy: user.fullName,
        updates: data.updates,
        timestamp: new Date()
      });
    });
    
    // Handle employee availability updates
    socket.on('employee:availability', (data) => {
      socket.to(`company:${companyId}`).emit('employee:availability', {
        employeeId: data.employeeId,
        availability: data.availability,
        updatedBy: user.fullName,
        timestamp: new Date()
      });
    });
    
    // Handle real-time notifications
    socket.on('notification:send', (data) => {
      io.to(`company:${companyId}`).emit('notification:new', {
        type: data.type,
        title: data.title,
        message: data.message,
        priority: data.priority || 'normal',
        createdBy: user.fullName,
        timestamp: new Date()
      });
    });
    
    // Handle typing indicators
    socket.on('typing:start', (data) => {
      socket.to(`crisis:${data.crisisId}`).emit('typing:indicator', {
        userId: user._id,
        userName: user.fullName,
        isTyping: true
      });
    });
    
    socket.on('typing:stop', (data) => {
      socket.to(`crisis:${data.crisisId}`).emit('typing:indicator', {
        userId: user._id,
        userName: user.fullName,
        isTyping: false
      });
    });
    
    // Handle location updates (for field employees)
    socket.on('location:update', (data) => {
      socket.to(`company:${companyId}`).emit('employee:location', {
        employeeId: user._id,
        coordinates: data.coordinates,
        timestamp: new Date()
      });
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      const userInfo = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);
      logger.info(`User disconnected: ${user?.email}`);
      
      // Notify others in company
      socket.to(`company:${companyId}`).emit('user:offline', {
        userId: user._id,
        timestamp: new Date()
      });
    });
    
    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to Crisis Command Center',
      userId: user._id,
      companyId,
      timestamp: new Date()
    });
    
    // Notify others in company
    socket.to(`company:${companyId}`).emit('user:online', {
      userId: user._id,
      userName: user.fullName,
      timestamp: new Date()
    });
  });
  
  // Helper functions for emitting events from controllers
  return {
    emitToCompany: (companyId, event, data) => {
      io.to(`company:${companyId}`).emit(event, data);
    },
    
    emitToCrisis: (crisisId, event, data) => {
      io.to(`crisis:${crisisId}`).emit(event, data);
    },
    
    getConnectedUsers: (companyId) => {
      const users = [];
      connectedUsers.forEach((info) => {
        if (info.companyId === companyId) {
          users.push(info);
        }
      });
      return users;
    }
  };
};

export default { setupSocketHandlers };
