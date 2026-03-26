"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Shield, User as UserIcon, MoreVertical, Trash2, UserPlus, Mail } from "lucide-react";
import toast from "react-hot-toast";

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("role", { ascending: true });
    
    if (error) {
      toast.error("Failed to load users");
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  }

  async function handleToggleRole(id: string, currentRole: string) {
    const newRole = currentRole === 'admin' ? 'agent' : 'admin';
    const { error } = await supabase
      .from("users")
      .update({ role: newRole })
      .eq("id", id);

    if (error) {
       toast.error(error.message);
    } else {
       toast.success(`User updated to ${newRole}`);
       setUsers(users.map(u => u.id === id ? { ...u, role: newRole } : u));
    }
  }

  async function handleInvite() {
    if (!newEmail) return;
    toast("Invite logic (Phase 6.1) requires production SMTP secrets.", { icon: "📧" });
    setIsAdding(false);
    setNewEmail("");
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">User Management</h3>
          <p className="text-sm text-[var(--text-secondary)]">Manage team members and their administrative roles.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-blue)] text-white rounded-md text-sm font-semibold hover:bg-[var(--accent-blue-hover)] transition-colors shadow-sm"
        >
          <UserPlus size={16} />
          Invite User
        </button>
      </div>

      {isAdding && (
         <div className="p-4 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-tertiary)] flex gap-4 items-end animate-fade-in">
            <div className="flex-1">
               <label className="block text-xs font-bold text-[var(--text-secondary)] mb-1 uppercase">Email Address</label>
               <input 
                 type="email" 
                 value={newEmail}
                 onChange={(e) => setNewEmail(e.target.value)}
                 placeholder="colleague@domain.com"
                 className="w-full h-10 px-3 border border-[var(--border-primary)] rounded bg-white text-sm outline-none focus:border-[var(--accent-blue)]"
               />
            </div>
            <div className="flex gap-2">
               <button onClick={() => setIsAdding(false)} className="px-4 h-10 text-sm font-semibold text-[var(--text-secondary)]">Cancel</button>
               <button onClick={handleInvite} className="px-6 h-10 bg-[var(--accent-blue)] text-white text-sm font-semibold rounded hover:bg-[var(--accent-blue-hover)]">Send Invite</button>
            </div>
         </div>
      )}

      <div className="border border-[var(--border-primary)] rounded-lg overflow-hidden bg-white shadow-md">
        <table className="w-full text-sm text-left">
          <thead className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-b border-[var(--border-primary)]">
            <tr>
              <th className="px-6 py-4 font-bold uppercase tracking-wider">User</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 font-bold uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-secondary)]">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-[var(--bg-tertiary)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[var(--accent-blue)] to-purple-500 flex items-center justify-center text-white font-bold text-xs uppercase">
                       {u.full_name?.substring(0,2) || u.email.substring(0,2)}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--text-primary)]">{u.full_name || "New User"}</div>
                      <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1"><Mail size={10} /> {u.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {u.role === 'admin' ? <Shield size={10} /> : <UserIcon size={10} />}
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-[var(--text-tertiary)]">
                   {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                     <button 
                       onClick={() => handleToggleRole(u.id, u.role)}
                       className="p-2 text-[var(--text-tertiary)] hover:text-[var(--accent-blue)] hover:bg-white rounded border border-transparent hover:border-[var(--border-primary)] transition-all"
                       title={`Make ${u.role === 'admin' ? 'Agent' : 'Admin'}`}
                     >
                        <Shield size={16} />
                     </button>
                     <button className="p-2 text-[var(--text-tertiary)] hover:text-red-500 hover:bg-white rounded border border-transparent hover:border-[var(--border-primary)] transition-all">
                        <Trash2 size={16} />
                     </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
