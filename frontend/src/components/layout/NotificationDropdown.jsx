import React, { useState, useEffect } from 'react';
import { Bell, Heart, Calendar, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Get icon and styling based on notification type
  const getNotificationStyle = (type) => {
    switch (type) {
      case 'adoption_request':
        return {
          icon: <Bell className="w-4 h-4 text-blue-500" />,
          bgColor: 'bg-blue-50',
          borderColor: 'border-l-blue-500'
        };
      case 'adoption_accepted':
        return {
          icon: <CheckCircle className="w-4 h-4 text-green-500" />,
          bgColor: 'bg-green-50',
          borderColor: 'border-l-green-500'
        };
      case 'adoption_rejected':
        return {
          icon: <X className="w-4 h-4 text-red-500" />,
          bgColor: 'bg-red-50',
          borderColor: 'border-l-red-500'
        };
      case 'meeting_scheduled':
        return {
          icon: <Calendar className="w-4 h-4 text-purple-500" />,
          bgColor: 'bg-purple-50',
          borderColor: 'border-l-purple-500'
        };
      default:
        return {
          icon: <Bell className="w-4 h-4 text-gray-500" />,
          bgColor: 'bg-gray-50',
          borderColor: 'border-l-gray-500'
        };
    }
  };

  // Get notifications from backend
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch((import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || 'http://localhost:7000')) + '/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Mark notification as read and handle navigation based on type
  const handleClick = async (notification) => {
    try {
      console.log('Notification clicked:', notification.type); // Debug log
      
      const token = localStorage.getItem('token');
      
      // Mark as read
      await fetch(`${import.meta.env.VITE_API_URL || (import.meta.env.VITE_API_URL || "http://localhost:7000")}/notifications/${notification._id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setIsOpen(false);

      // Only navigate to adoption posts page for adoption_request notifications
      if (notification.type === 'adoption_request') {
        console.log('Navigating to adoption posts page'); // Debug log
        navigate('/adopt/post');
      } else {
        console.log('No navigation for notification type:', notification.type); // Debug log
      }
      // For other notification types, just mark as read without navigation
      
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Load notifications when opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Load notifications when component mounts (to show notification count)
  useEffect(() => {
    fetchNotifications();
    
    // Check for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 rounded-full"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border">
          <div className="p-4 border-b">
            <h3 className="font-semibold">Notifications</h3>
          </div>
          
          <div className="max-h-60 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map((notification) => {
                const style = getNotificationStyle(notification.type);
                const isClickable = notification.type === 'adoption_request';
                
                return (
                  <div
                    key={notification._id}
                    onClick={() => handleClick(notification)}
                    className={`p-4 border-b border-l-4 ${style.borderColor} ${
                      isClickable ? 'cursor-pointer hover:bg-gray-50' : 'cursor-default'
                    } ${
                      !notification.read ? style.bgColor : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {style.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{notification.message}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                          {isClickable && (
                            <span className="text-xs text-blue-500 font-medium">
                              Click to view
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationDropdown;
