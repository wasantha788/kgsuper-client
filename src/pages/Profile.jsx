import React from 'react';
import { useAppContext } from '../context/AppContext';

const Profile = () => {
  const { user } = useAppContext();

  if (!user) return <div className="mt-20 text-center">Please login to view profile.</div>;

  return (
    <div className="mt-20 px-4 md:px-14 lg:px-28 pb-20">
      <div className="max-w-2xl mx-auto bg-card-bg rounded-2xl border border-main-border shadow-xl overflow-hidden">
        
        {/* Profile Header */}
        <div className="bg-primary p-8 text-center text-white">
          <div className="w-24 h-24 bg-white/20 rounded-full mx-auto flex items-center justify-center text-4xl font-bold backdrop-blur-md border-4 border-white/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="mt-4 text-2xl font-bold">{user.name}</h2>
          <p className="opacity-80">Store Member</p>
        </div>

        {/* Profile Details */}
        <div className="p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-main-border pb-4">
            <span className="text-gray-500 font-medium">Full Name</span>
            <span className="text-main-text font-semibold text-lg">{user.name}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-main-border pb-4">
            <span className="text-gray-500 font-medium">Email Address</span>
            <span className="text-main-text font-semibold">{user.email}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-main-border pb-4">
            <span className="text-gray-500 font-medium">User ID</span>
            <span className="text-xs font-mono text-gray-400">{user._id}</span>
          </div>

          <button className="w-full bg-primary/10 text-primary border border-primary/20 py-3 rounded-xl font-bold hover:bg-primary hover:text-white transition-all">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;