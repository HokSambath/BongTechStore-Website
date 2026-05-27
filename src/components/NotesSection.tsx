import React, { useState } from 'react';
import { useAuthOrder } from '../contexts/AuthOrderContext';
import { Note } from '../types';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  Sparkles, 
  AlertCircle, 
  X, 
  Lock, 
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function NotesSection() {
  const { 
    notes, 
    loadingNotes, 
    createNote, 
    updateNote, 
    deleteNote 
  } = useAuthOrder();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [working, setWorking] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Modal state for Upgrade to Pro alert
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Triggered when form is submitted (handles both edit and insert)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setWorking(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (editingId) {
        // Edit Mode
        await updateNote(editingId, title, content);
        setSuccessMsg('Note updated successfully!');
        setEditingId(null);
        setTitle('');
        setContent('');
      } else {
        // Insert mode
        // Check local limit first for speedy UI response
        if (notes.length >= 3) {
          setShowUpgradeModal(true);
          setWorking(false);
          return;
        }

        await createNote(title, content);
        setSuccessMsg('New note saved to cloud storage!');
        setTitle('');
        setContent('');
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || 'Failed to persist note.';
      // Check if limit error occurred (includes backend/trigger block errors)
      if (msg.toLowerCase().includes('limit') || msg.toLowerCase().includes('free plan')) {
        setShowUpgradeModal(true);
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setWorking(false);
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setErrorMsg('');
    setSuccessMsg('');
    // Scroll smoothly to form
    const elem = document.getElementById('note-editor-form');
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteNote(noteId);
      setSuccessMsg('Note removed.');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to delete note.');
    }
  };

  const handleNewNoteClick = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setErrorMsg('');
    setSuccessMsg('');
    
    // Explicit client-side early warning limit check
    if (notes.length >= 3) {
      setShowUpgradeModal(true);
    }
  };

  return (
    <div className="glass-card p-6 relative col-span-1 md:col-span-3">
      {/* Top Header Decorator Bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-zinc-700 via-white to-zinc-700" />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-6 mb-6 gap-4">
        <div>
          <h3 className="font-black text-xl text-white uppercase tracking-tight flex items-center gap-2">
            <FileText size={20} className="text-white" />
            <span>My Shopping & Gear Notes</span>
          </h3>
          <p className="text-xs text-text-dim mt-1">
            Store reminders, controller mapping drafts, or gaming PC setup configurations.
          </p>
        </div>
        
        {/* SaaS Tier Stats Display */}
        <div className="flex flex-col items-end gap-1 font-sans">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-zinc-800 text-zinc-300 border border-white/5 px-2.5 py-1 rounded">
              Plan: Free Tier
            </span>
            <span className="text-xs text-text-dim font-bold">
              {notes.length} / 3 Notes Used
            </span>
          </div>
          {/* Simple progress bar representation */}
          <div className="w-32 bg-zinc-900 border border-border h-2 rounded-full overflow-hidden mt-1">
            <div 
              className={`h-full transition-all duration-300 ${notes.length >= 3 ? 'bg-red-500' : 'bg-white'}`}
              style={{ width: `${Math.min((notes.length / 3) * 100, 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 text-xs text-green-400 border border-green-500/20 bg-green-500/10 rounded p-3.5 mb-6 font-bold">
          <CheckCircle size={14} />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 text-xs text-red-500 border border-red-500/20 bg-red-500/10 rounded p-3.5 mb-6 font-bold">
          <AlertCircle size={14} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid: Left/Right Content - Form Editor & Notes List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Column 1: Note Entry Form */}
        <div id="note-editor-form" className="lg:col-span-1 bg-zinc-900/50 p-5 rounded-xl border border-border flex flex-col h-fit">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              {editingId ? 'Edit Note' : 'Create New Note'}
            </h4>
            {editingId && (
              <button 
                onClick={handleNewNoteClick}
                className="text-[10px] text-text-dim hover:text-white underline uppercase font-bold"
              >
                Reset Form
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1.5">Note Title</label>
              <input
                id="note-input-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-field placeholder:text-zinc-600 font-medium"
                placeholder="e.g. My Nintendo Switch OLED Configs"
                required
                maxLength={80}
                disabled={working}
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-text-dim mb-1.5">Content Details</label>
              <textarea
                id="note-input-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="input-field placeholder:text-zinc-600 font-medium min-h-[120px] resize-y py-3"
                placeholder="Save custom controller mappings, build templates, or shipping addresses here..."
                required
                maxLength={1200}
                disabled={working}
              />
            </div>

            <button
              id="submit-note-button"
              type="submit"
              className={`w-full ${editingId ? 'bg-zinc-800 text-white border border-white/20 hover:bg-zinc-700' : 'btn-primary'} py-2.5 rounded-lg text-xs uppercase font-black tracking-widest mt-2 flex items-center justify-center gap-2`}
              disabled={working}
            >
              {!editingId && <Plus size={14} />}
              <span>{working ? 'Processing...' : (editingId ? 'Update Note' : 'Save Note')}</span>
            </button>
          </form>
        </div>

        {/* Column 2: Notes List Gallery */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Cloud Notes Registry
            </h4>
            {notes.length >= 3 && (
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1 bg-red-500/10 border border-red-500/20 px-2.5 py-1 rounded">
                <Lock size={10} />
                Limit Reached
              </span>
            )}
          </div>

          {loadingNotes ? (
            <div className="text-xs text-text-dim py-10 text-center">Loading system cloud notes...</div>
          ) : notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 border border-dashed border-border rounded-xl bg-zinc-900/20">
              <FileText size={32} className="text-zinc-700 mb-3" />
              <p className="text-xs text-text-dim font-bold">No tech notes found.</p>
              <p className="text-[11px] text-text-dim/60 mt-1 max-w-sm">
                Get started by creating your first note for devices, setups, or specs!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {notes.map((note) => (
                  <motion.div 
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    id={`note-card-${note.id}`}
                    className="bg-zinc-900/40 border border-border/80 rounded-xl p-4 hover:border-white/20 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h5 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-brand-secondary transition-colors">
                          {note.title}
                        </h5>
                        <div className="flex items-center gap-1 bg-zinc-800 px-1.5 py-0.5 rounded text-[9px] text-text-dim font-mono">
                          <Clock size={10} />
                          <span>{new Date(note.createdAt).toLocaleDateString(undefined, {month: 'numeric', day: 'numeric'})}</span>
                        </div>
                      </div>
                      <p className="text-xs text-text-dim leading-relaxed whitespace-pre-wrap break-words line-clamp-4 pr-1">
                        {note.content}
                      </p>
                    </div>

                    <div className="flex justify-end gap-3 mt-4 pt-3 border-t border-white/5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        id={`edit-note-btn-${note.id}`}
                        onClick={() => handleEditClick(note)}
                        className="text-[10px] uppercase font-black tracking-wider text-text-dim hover:text-white transition-colors flex items-center gap-1"
                        title="Edit Note"
                      >
                        <Edit3 size={11} />
                        <span>Edit</span>
                      </button>
                      <span className="text-zinc-800">|</span>
                      <button
                        id={`delete-note-btn-${note.id}`}
                        onClick={() => handleDelete(note.id)}
                        className="text-[10px] uppercase font-black tracking-wider text-red-400 hover:text-red-500 transition-colors flex items-center gap-1"
                        title="Delete Note"
                      >
                        <Trash2 size={11} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>

      {/* Upgrade SaaS Premium Pro Modal Overlay */}
      <AnimatePresence>
        {showUpgradeModal && (
          <div 
            id="premium-upgrade-modal-backdrop"
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              id="premium-upgrade-modal-content"
              className="bg-bg-dark border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl overflow-hidden"
            >
              {/* Gold glow top strip */}
              <div className="absolute top-0 left-0 w-full h-1 bg-white" />

              {/* Background gradient graphics for premium appearance */}
              <div className="absolute top-[-50%] right-[-50%] w-[100%] h-[100%] rounded-full bg-white/[0.03] blur-3xl" />
              
              {/* Close Button */}
              <button 
                id="close-upgrade-modal"
                onClick={() => setShowUpgradeModal(false)}
                className="absolute top-4 right-4 text-text-dim hover:text-white transition-colors border border-white/5 rounded-md p-1 bg-zinc-900"
              >
                <X size={16} />
              </button>

              <div className="flex flex-col items-center text-center mt-4">
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4 animate-bounce">
                  <Sparkles size={24} className="text-white" />
                </div>

                <h4 className="text-xl font-black uppercase text-white tracking-tight mb-2">
                  Upgrade to Note Pro
                </h4>
                
                <p className="text-sm font-bold text-white mb-2">
                  Free plan limit reached. Upgrade to Pro to create unlimited notes.
                </p>
                
                <p className="text-xs text-text-dim max-w-sm mb-6 leading-relaxed">
                  The Free Tier matches our SaaS model limiting users to <strong className="text-white">3 active notes</strong>. Pro Tier offers unlimited storage, collaborative workspaces, and full offline sync features.
                </p>

                {/* Price Display */}
                <div className="bg-zinc-900/80 border border-border p-3.5 rounded-xl w-full flex items-center justify-between mb-6">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase tracking-wider text-text-dim block">Pro Membership</span>
                    <span className="text-base font-black text-white">Full Access Plan</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-text-dim line-through block">$4.99</span>
                    <span className="text-base font-black text-white">$1.99/mo</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="w-full space-y-3">
                  <button 
                    id="upgrade-submit-draft"
                    onClick={() => {
                      alert('Thank you for your interest! Pro upgrades are coming soon in our upcoming release cycle.');
                      setShowUpgradeModal(false);
                    }}
                    className="btn-primary w-full py-3 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <span>Upgrade to Pro Now</span>
                    <ArrowRight size={14} />
                  </button>
                  
                  <button 
                    id="upgrade-cancel-btn"
                    onClick={() => setShowUpgradeModal(false)}
                    className="text-text-dim hover:text-white text-xs font-bold uppercase tracking-widest py-2 transition-colors block mx-auto"
                  >
                    Keep Using Free Tier
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
