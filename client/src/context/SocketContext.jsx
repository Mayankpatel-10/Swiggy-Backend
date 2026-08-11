import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [activeAlerts, setActiveAlerts] = useState([]);

  useEffect(() => {
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      // Join User Notification Room
      socket.emit('join:user', user.id || user._id);

      if (user.role === 'admin') {
        socket.emit('join:admin');
      }

      socket.on('notification:new', (notification) => {
        setActiveAlerts((prev) => [notification, ...prev]);
      });

      socket.on('fraud:flagged', (fraudAlert) => {
        if (user.role === 'admin') {
          setActiveAlerts((prev) => [
            {
              title: `SECURITY RISK FLAGGED (${fraudAlert.riskLevel})`,
              message: `Order #${fraudAlert.orderId.slice(-6)} flagged for ${fraudAlert.reasons.join(', ')}`,
              type: 'FRAUD_ALERT',
              id: Date.now(),
            },
            ...prev,
          ]);
        }
      });
    }

    return () => {
      if (socket) {
        socket.off('notification:new');
        socket.off('fraud:flagged');
      }
    };
  }, [socket, user]);

  const joinOrderRoom = (orderId) => {
    if (socket && orderId) {
      socket.emit('join:order', orderId);
    }
  };

  const removeAlert = (index) => {
    setActiveAlerts((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <SocketContext.Provider value={{ socket, activeAlerts, removeAlert, joinOrderRoom }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
