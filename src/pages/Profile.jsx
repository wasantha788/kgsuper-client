import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Lock, MapPin, Phone, Loader2, Save, X, Trash2, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, axios } = useAppContext();
  
  // UI States
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [address, setAddress] = useState({
    firstName: '', lastName: '', email: '', street: '',
    city: '', state: '', zipcode: '', country: '', phone: ''
  });

  // Fetch Address Logic
  const getUserAddress = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get('/api/address/get');
      if (data.success) {
        if (data.address) {
          setAddress(data.address);
        } else if (data.addresses && data.addresses.length > 0) {
          setAddress(data.addresses[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  useEffect(() => {
    getUserAddress();
  }, [user]);

  // Actions
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post('/api/address/add', address);
      if (data.success) {
        toast.success("Address saved!");
        setIsEditingAddress(false);
        getUserAddress(); 
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save address");
    } finally { setLoading(false); }
  };

  const handleDeleteAddress = async () => {
    if (!address._id) return;
    if (!window.confirm("Are you sure you want to delete this address?")) return;

    setLoading(true);
    try {
      const { data } = await axios.delete(`/api/address/${address._id}`);
      if (data.success) {
        toast.success("Address deleted");
        setAddress({ firstName: '', lastName: '', email: '', street: '', city: '', state: '', zipcode: '', country: '', phone: '' });
      }
    } catch (error) {
      toast.error("Failed to delete address");
    } finally { setLoading(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) return toast.error("Passwords don't match");
    setLoading(true);
    try {
      const { data } = await axios.post('/api/user/update-password', passwords);
      if (data.success) {
        toast.success("Password updated!");
        setShowPasswordForm(false);
        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else { toast.error(data.message); }
    } catch (error) { 
      toast.error(error.response?.data?.message || "Error updating password"); 
    } finally { setLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      const { data } = await axios.delete('/api/user/delete-profile');
      if (data.success) {
        toast.success("Account deleted.");
        logout(); 
      }
    } catch (error) {
      toast.error("Could not delete account.");
    } finally { 
      setLoading(false); 
      setShowDeleteModal(false);
    }
  };

  if (!user) return <div className="mt-20 text-center text-main-text">Please login to view profile.</div>;

  return (
    <div className="mt-20 px-4 md:px-14 lg:px-28 pb-20 animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1">
          <div className="bg-card-bg rounded-3xl border border-main-border shadow-xl overflow-hidden sticky top-24">
            <div className="bg-primary p-8 text-center text-white">
              <div className="w-20 h-20 bg-white/20 rounded-full mx-auto flex items-center justify-center text-3xl font-bold backdrop-blur-md border-2 border-white/30">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <h2 className="mt-4 font-bold text-xl">{user.name}</h2>
              <p className="text-xs opacity-70 uppercase tracking-widest">{user.email}</p>
            </div>
            <div className="p-4 space-y-2">
              <button onClick={() => {setShowPasswordForm(true); setIsEditingAddress(false);}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${showPasswordForm ? 'bg-primary/10 text-primary' : 'text-main-text hover:bg-primary/5'}`}><Lock size={18} /> Security Settings</button>
              <button onClick={() => {setIsEditingAddress(true); setShowPasswordForm(false);}} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${isEditingAddress ? 'bg-primary/10 text-primary' : 'text-main-text hover:bg-primary/5'}`}><MapPin size={18} /> Delivery Address</button>
              <div className="pt-4 mt-2 border-t border-main-border">
                <button onClick={() => setShowDeleteModal(true)} className="w-full flex items-center gap-3 p-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all font-medium"><Trash2 size={18} /> Delete Account</button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card-bg rounded-3xl border border-main-border shadow-sm p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-main-text flex items-center gap-2"><MapPin className="text-primary" /> Shipping Details</h3>
              <div className="flex gap-4">
                {!isEditingAddress && address.street && (
                  <button onClick={handleDeleteAddress} className="text-red-500 hover:underline text-sm font-bold flex items-center gap-1"><Trash2 size={14}/> Delete</button>
                )}
                {!isEditingAddress && (
                  <button onClick={() => setIsEditingAddress(true)} className="text-primary text-sm font-bold hover:underline">{address.street ? 'Edit' : 'Add'}</button>
                )}
              </div>
            </div>

            {isEditingAddress ? (
              <form onSubmit={handleUpdateAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in zoom-in-95 duration-200">
                <input required placeholder="First Name" className="profile-input" value={address.firstName} onChange={(e)=>setAddress({...address, firstName: e.target.value})} />
                <input required placeholder="Last Name" className="profile-input" value={address.lastName} onChange={(e)=>setAddress({...address, lastName: e.target.value})} />
                <input required placeholder="Email" type="email" className="profile-input md:col-span-2" value={address.email} onChange={(e)=>setAddress({...address, email: e.target.value})} />
                <input required placeholder="Street Address" className="profile-input md:col-span-2" value={address.street} onChange={(e)=>setAddress({...address, street: e.target.value})} />
                <input required placeholder="City" className="profile-input" value={address.city} onChange={(e)=>setAddress({...address, city: e.target.value})} />
                <input required placeholder="State" className="profile-input" value={address.state} onChange={(e)=>setAddress({...address, state: e.target.value})} />
                <input required placeholder="Zipcode" type="text" className="profile-input" value={address.zipcode} onChange={(e)=>setAddress({...address, zipcode: e.target.value})} />
                <input required placeholder="Country" className="profile-input" value={address.country} onChange={(e)=>setAddress({...address, country: e.target.value})} />
                <input required placeholder="Phone Number" className="profile-input md:col-span-2" value={address.phone} onChange={(e)=>setAddress({...address, phone: e.target.value})} />
                <div className="md:col-span-2 flex gap-3 mt-4">
                  <button type="submit" disabled={loading} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={18}/> : <><Save size={18}/> Save Address</>}
                  </button>
                  <button type="button" onClick={()=>setIsEditingAddress(false)} className="px-6 py-3 border border-main-border rounded-xl text-gray-500 font-bold hover:bg-gray-50">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 text-main-text opacity-90">
                {address.street ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-main-bg/50 p-6 rounded-2xl border border-dashed border-main-border">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Receiver</p>
                      <p className="font-semibold text-lg">{address.firstName} {address.lastName}</p>
                      <p className="text-sm flex items-center gap-2 mt-1"><Phone size={14}/> {address.phone}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase">Address</p>
                      <p className="text-sm">{address.street}, {address.city}</p>
                      <p className="text-sm">{address.state}, {address.zipcode}</p>
                      <p className="text-sm font-bold text-primary">{address.country}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-400 italic">No address saved yet.</p>
                    <button onClick={() => setIsEditingAddress(true)} className="mt-2 text-primary font-bold">Add One Now</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {showPasswordForm && (
            <div className="bg-card-bg rounded-3xl border border-main-border shadow-sm p-6 md:p-8 animate-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-main-text flex items-center gap-2"><Lock className="text-primary" /> Security</h3>
                <button onClick={()=>setShowPasswordForm(false)}><X className="text-gray-400 hover:text-red-500"/></button>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <input type="password" required placeholder="Current Password" className="profile-input" value={passwords.oldPassword} onChange={(e)=>setPasswords({...passwords, oldPassword: e.target.value})} />
                <input type="password" required placeholder="New Password" className="profile-input" value={passwords.newPassword} onChange={(e)=>setPasswords({...passwords, newPassword: e.target.value})} />
                <input type="password" required placeholder="Confirm New Password" className="profile-input" value={passwords.confirmPassword} onChange={(e)=>setPasswords({...passwords, confirmPassword: e.target.value})} />
                <button type="submit" disabled={loading} className="w-full bg-primary text-white py-3 rounded-xl font-bold disabled:opacity-50">
                   {loading ? <Loader2 className="animate-spin mx-auto" size={20}/> : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* DELETE ACCOUNT MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card-bg w-full max-w-md p-8 rounded-3xl border border-main-border shadow-2xl animate-in zoom-in-95">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4"><AlertTriangle size={32} /></div>
              <h3 className="text-2xl font-bold text-main-text">Delete Account?</h3>
              <p className="text-gray-500 mt-2">This action is permanent. All history will be lost.</p>
            </div>
            <div className="flex flex-col gap-3 mt-8">
              <button onClick={handleDeleteAccount} disabled={loading} className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" /> : "Yes, Delete My Account"}
              </button>
              <button onClick={() => setShowDeleteModal(false)} className="w-full bg-gray-100 dark:bg-slate-800 text-main-text py-4 rounded-2xl font-bold">No, Keep It</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;