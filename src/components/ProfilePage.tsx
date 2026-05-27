import React, { useState } from 'react';
import { useAuthOrder } from '../contexts/AuthOrderContext';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Calendar, Shield, Edit3, Save, CheckCircle2, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../supabaseClient';
import NotesSection from './NotesSection';

export default function ProfilePage() {
  const { currentUser, orders, loading, logOutUser, uploadAvatar, deleteAvatar } = useAuthOrder();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [avatarWorking, setAvatarWorking] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 5MB.');
      return;
    }

    setAvatarWorking(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await uploadAvatar(file);
      setSuccessMsg('Profile picture uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to upload profile picture.');
    } finally {
      setAvatarWorking(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!window.confirm('Are you sure you want to remove your profile picture?')) return;
    setAvatarWorking(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      await deleteAvatar();
      setSuccessMsg('Profile picture removed!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to remove profile picture.');
    } finally {
      setAvatarWorking(false);
    }
  };

  React.useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
      }
    };
    checkAuthAndRedirect();
  }, [navigate]);

  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
    }
  }, [currentUser]);

  if (loading) {
    return (
      <div className="pt-32 pb-20 min-h-screen section-container flex items-center justify-center text-text-dim">
        Loading user profile...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="pt-32 pb-20 min-h-screen section-container flex flex-col items-center justify-center text-center">
        <User size={40} className="text-text-dim mb-4" />
        <h2 className="text-xl font-bold mb-2">Access Denied</h2>
        <p className="text-text-dim mb-6">Please log in to view and manage your profile settings.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">
          Log In Now
        </button>
      </div>
    );
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty.');
      return;
    }

    setUpdating(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: name.trim(),
          phone: phone.trim()
        }
      });

      if (error) throw error;

      // Update the local storage profile
      const updatedProfile = {
        ...currentUser,
        name: name.trim(),
        phone: phone.trim()
      };
      localStorage.setItem('bongtech_currentUser', JSON.stringify(updatedProfile));
      
      // Trigger update of state inside the context (reloads onAuthStateChange or reload page)
      setSuccessMsg('Your profile has been updated successfully!');
      setIsEditing(false);
      
      // Reload page to trigger context update or let it trigger.
      setTimeout(() => {
        window.location.reload();
      }, 1200);

    } catch (err: any) {
      console.error('Profile update error:', err);
      setErrorMsg(err.message || 'Failed to update user profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formattedDate = currentUser.createdAt 
    ? new Date(currentUser.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'N/A';

  return (
    <div className="pt-32 pb-20 min-h-screen section-container">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black mb-8 text-gradient uppercase tracking-tight flex items-center gap-3">
          <User size={28} className="text-brand-primary" />
          My Profile Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Avatar Profile Left Card */}
          <div className="glass-card p-6 flex flex-col items-center text-center h-fit relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-brand-primary" />
            
            <div className="relative group/avatar mb-4">
              {currentUser.avatarUrl ? (
                <img 
                  id="user-avatar-image"
                  referrerPolicy="no-referrer"
                  src={currentUser.avatarUrl} 
                  alt={currentUser.name} 
                  className={`w-24 h-24 rounded-full object-cover border-2 border-brand-primary/40 ${avatarWorking ? 'animate-pulse opacity-50' : ''}`}
                />
              ) : (
                <div className={`w-24 h-24 rounded-full bg-zinc-900 border-2 border-brand-primary/20 flex items-center justify-center text-brand-primary font-black text-3xl ${avatarWorking ? 'animate-pulse opacity-50' : ''}`}>
                  {currentUser.name.trim().charAt(0).toUpperCase()}
                </div>
              )}
              
              <label 
                id="avatar-upload-trigger"
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-[10px] uppercase font-black tracking-widest text-brand-primary cursor-pointer transition-opacity duration-200. select-none"
              >
                <span>{avatarWorking ? 'Saving...' : 'Upload'}</span>
                <input 
                  id="avatar-file-selector"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarUpload}
                  disabled={avatarWorking}
                />
              </label>
            </div>

            {currentUser.avatarUrl && !avatarWorking && (
              <button
                id="remove-avatar-trigger"
                onClick={handleAvatarDelete}
                className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-500 hover:underline transition-colors mb-3"
              >
                Remove Photo
              </button>
            )}
            
            <h2 className="text-xl font-bold text-white mb-1">{currentUser.name}</h2>
            <div className={`px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-zinc-800 text-brand-primary border border-white/5 mb-6 flex items-center gap-1.5`}>
              <Shield size={10} className="text-brand-primary" />
              <span>{currentUser.role} Account</span>
            </div>

            <div className="w-full space-y-4 border-t border-border pt-6 text-left">
              <div className="flex items-center gap-2.5 text-xs text-text-dim">
                <Calendar size={14} className="text-brand-primary/60" />
                <span>Joined on: <strong>{formattedDate}</strong></span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-text-dim">
                <ClipboardList size={14} className="text-brand-primary/60" />
                <span>Total Orders: <strong>{orders.length}</strong></span>
              </div>
            </div>

            <button 
              onClick={logOutUser}
              className="btn-outline w-full py-2 text-[10px] uppercase font-black tracking-widest mt-8 border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
            >
              Sign Out
            </button>
          </div>

          {/* User Details Details Panel */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-card p-8 relative">
              <div className="flex justify-between items-center border-b border-border pb-4 mb-6">
                <h3 className="font-black text-lg text-white uppercase tracking-wider flex items-center gap-2">
                  <span>General Information</span>
                </h3>

                {!isEditing && (
                  <button 
                    onClick={() => {
                      setName(currentUser.name);
                      setPhone(currentUser.phone);
                      setIsEditing(true);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-white transition-colors"
                  >
                    <Edit3 size={14} />
                    Edit Profile
                  </button>
                )}
              </div>

              {successMsg && (
                <div className="flex items-center gap-2 text-xs text-green-400 border border-green-500/20 bg-green-500/10 rounded p-3 mb-6 font-bold">
                  <CheckCircle2 size={14} />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="text-xs text-red-400 border border-red-500/20 bg-red-500/10 rounded p-3 mb-6 font-bold">
                  {errorMsg}
                </div>
              )}

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Full Display Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field pl-10"
                        placeholder="John Doe"
                        required
                        disabled={updating}
                      />
                      <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1">Mobile Hotline</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field pl-10"
                        placeholder="e.g. 012 345 678"
                        disabled={updating}
                      />
                      <Phone size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-dim" />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="btn-outline py-2 px-4"
                      disabled={updating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary py-2 px-4 flex items-center gap-1.5"
                      disabled={updating}
                    >
                      <Save size={14} />
                      {updating ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-dim block mb-1">Email Coordinates</span>
                      <div className="flex items-center gap-2 text-white">
                        <Mail size={14} className="text-brand-primary" />
                        <span className="font-mono text-sm">{currentUser.email}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-dim block mb-1">Administrative Level</span>
                      <div className="flex items-center gap-2 text-white capitalize text-sm font-semibold">
                        <Shield size={14} className="text-brand-primary" />
                        <span>{currentUser.role} User</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-dim block mb-1">Shipping Name</span>
                      <div className="flex items-center gap-2 text-white text-sm font-semibold">
                        <User size={14} className="text-brand-primary" />
                        <span>{currentUser.name}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-text-dim block mb-1">Saved Telephone Line</span>
                      <div className="flex items-center gap-2 text-white text-sm font-semibold">
                        <Phone size={14} className="text-brand-primary" />
                        <span>{currentUser.phone || 'No phone number provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Orders Integration Summary */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">Quick Order Coordinates</h4>
                <button 
                  onClick={() => navigate('/orders')} 
                  className="text-zinc-500 hover:text-brand-primary text-xs font-bold uppercase tracking-widest"
                >
                  View All Orders &rarr;
                </button>
              </div>

              {orders.length === 0 ? (
                <p className="text-xs text-text-dim">You haven't requested any custom gear setups. Start shopping to fill your setup!</p>
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 2).map((order) => (
                    <div key={order.id} className="flex justify-between items-center bg-white/5 border border-white/5 rounded p-3 text-xs">
                      <div>
                        <span className="font-mono font-bold text-zinc-300">ID: {order.id.substring(0, 8)}...</span>
                        <span className="text-text-dim ml-2">Total: {order.totalPrice}</span>
                      </div>
                      <span className="font-black uppercase text-[10px] tracking-wide text-brand-primary bg-brand-primary/10 border border-brand-primary/25 px-2 py-0.5 rounded">
                        {order.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Notes Section Integration */}
          <NotesSection />
        </div>
      </div>
    </div>
  );
}
