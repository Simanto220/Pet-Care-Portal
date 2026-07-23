import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Heart,
  Camera,
  Bell,
  User,
  Settings,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: <Home size={16} />, label: "Feed", path: "/dashboard" },
    { icon: <Star size={16} />, label: "Favorites", path: "/favorites" },
    { icon: <Camera size={16} />, label: "My Posts", path: "/my-posts" },
    {
      icon: <Heart size={16} />,
      label: "View Adoption Requests",
      path: "/adopt/post",
    },
    {
      icon: <Bell size={16} />,
      label: "Notifications",
      path: "/notifications",
    },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const adoptionStats = [
    { label: "Pets Adopted", value: "2,847", change: "+12%" },
    { label: "Active Posts", value: "156", change: "+5%" },
    { label: "Happy Families", value: "1,924", change: "+8%" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Navigation Menu */}
      <Card className="bg-white/80 backdrop-blur-md shadow-md">
        <CardContent className="py-4 px-3 flex flex-col gap-1">
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <Button
                key={index}
                variant={isActive ? "default" : "ghost"}
                className={`justify-start ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-pink-500 text-white"
                    : "text-muted-foreground hover:bg-purple-50"
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </Button>
            );
          })}
        </CardContent>
      </Card>

    </div>
  );
};

export default Sidebar;
