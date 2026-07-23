import { User, Dog } from 'lucide-react';

const ProfileTabs = ({ activeTab, setActiveTab, petsCount }) => (
  <div className="bg-white rounded-2xl shadow-xl mb-6">
    <div className="flex border-b">
      <button
        onClick={() => setActiveTab('profile')}
        className={`px-6 py-4 font-medium transition ${
          activeTab === 'profile'
            ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        <User className="w-5 h-5 inline mr-2" />
        My Profile
      </button>
      <button
        onClick={() => setActiveTab('pets')}
        className={`px-6 py-4 font-medium transition ${
          activeTab === 'pets'
            ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
            : 'text-gray-600 hover:text-blue-600'
        }`}
      >
        <Dog className="w-5 h-5 inline mr-2" />
        My Pets ({petsCount})
      </button>
    </div>
  </div>
);

export default ProfileTabs;
