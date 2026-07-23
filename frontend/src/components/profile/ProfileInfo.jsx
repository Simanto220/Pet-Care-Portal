import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Mail, MapPin, Edit, Save, X, Camera } from "lucide-react";

const ProfileInfo = ({
  userProfile,
  setUserProfile,
  editingProfile,
  setEditingProfile,
  handleProfileUpdate,
}) => (
  <div className="bg-white rounded-2xl shadow-xl p-6">
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-800">Profile Information</h2>
      <Button
        onClick={() => setEditingProfile(!editingProfile)}
        className="flex items-center gap-2"
        variant={editingProfile ? "destructive" : "default"}
      >
        <Edit className="w-4 h-4" />
        {editingProfile ? "Cancel" : "Edit Profile"}
      </Button>
    </div>
    <div className="grid md:grid-cols-1 gap-6">
      {" "}
      {/* Changed to 1 column */}
      <div className="space-y-4">
        {" "}
        {/* Removed md:col-span-2 */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            {editingProfile ? (
              <Input
                value={userProfile.name}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, name: e.target.value })
                }
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <User className="w-4 h-4 text-gray-500" />
                {userProfile.name}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            {editingProfile ? (
              <Input
                type="tel"
                value={userProfile.phone}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, phone: e.target.value })
                }
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Phone className="w-4 h-4 text-gray-500" />
                {userProfile.phone}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            {editingProfile ? (
              <Input
                type="email"
                value={userProfile.email}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, email: e.target.value })
                }
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <Mail className="w-4 h-4 text-gray-500" />
                {userProfile.email}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            {editingProfile ? (
              <Input
                value={userProfile.location}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, location: e.target.value })
                }
              />
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-4 h-4 text-gray-500" />
                {userProfile.location}
              </div>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          {editingProfile ? (
            <Textarea
              value={userProfile.bio}
              onChange={(e) =>
                setUserProfile({ ...userProfile, bio: e.target.value })
              }
              rows={4}
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-lg">{userProfile.bio}</div>
          )}
        </div>
        {editingProfile && (
          <div className="flex gap-3">
            <Button
              onClick={handleProfileUpdate}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Changes
            </Button>
            <Button
              onClick={() => setEditingProfile(false)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ProfileInfo;
