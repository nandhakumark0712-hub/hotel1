import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { Loader2, Users, Trash2, Search, Mail, Shield, ShieldAlert, ShieldCheck, UserCheck, UserX } from 'lucide-react';
import { toast } from 'react-hot-toast';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUsers = async () => {
    try {
      const { data } = await API.get('/api/admin/users');
      setUsers(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;
    try {
      await API.delete(`/api/admin/users/${userId}`);
      toast.success('User deleted successfully');
      setUsers(users.filter(u => u._id !== userId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error deleting user');
    }
  };

  const toggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'blocked' ? 'active' : 'blocked';
    try {
      await API.put(`/api/admin/users/${userId}`, { accountStatus: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`);
      setUsers(users.map(u => u._id === userId ? { ...u, accountStatus: newStatus } : u));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating user status');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-dark tracking-tight">User Management</h1>
          <p className="text-gray-500 mt-1">Manage global access, roles, and security of all registered accounts.</p>
        </div>
        <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center">
          <div className="text-xs text-gray-400 font-black uppercase tracking-widest mr-4">Total Capacity</div>
          <div className="text-2xl font-black text-dark">{users.length} <span className="text-sm font-medium text-gray-400">Users</span></div>
        </div>
      </div>

      <div className="flex gap-4 items-center bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by name, email or role..."
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 focus:bg-white border-none transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="premium-card overflow-hidden border-none shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none">Full Name & Email</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none text-center">Identity</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none text-center">Registration</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none text-center">Access Status</th>
                <th className="px-8 py-5 text-xs font-black text-gray-400 uppercase tracking-widest leading-none text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary font-black mr-4 shadow-inner border border-primary/5">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-dark flex items-center">
                          {u.name}
                          {u.role === 'admin' && <ShieldCheck size={14} className="ml-1.5 text-red-500" />}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center">
                          <Mail size={12} className="mr-1" /> {u.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      u.role === 'admin' ? 'bg-red-50 text-red-600 border-red-100' :
                      u.role === 'manager' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                      'bg-gray-50 text-gray-600 border-gray-100'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="text-xs font-bold text-gray-500">{new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-1 ${
                            u.accountStatus === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                            {u.accountStatus || 'active'}
                        </span>
                        {u.role !== 'admin' && (
                            <button 
                                onClick={() => toggleStatus(u._id, u.accountStatus)}
                                className={`text-[10px] font-bold p-1 underline ${u.accountStatus === 'blocked' ? 'text-green-600' : 'text-red-500'}`}
                            >
                                {u.accountStatus === 'blocked' ? 'Unblock Now' : 'Block User'}
                            </button>
                        )}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {u.role !== 'admin' ? (
                        <button 
                            onClick={() => handleDelete(u._id)}
                            className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all transform hover:scale-110 shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <div className="p-3 bg-gray-50 text-gray-300 rounded-2xl cursor-not-allowed">
                          <ShieldAlert size={18} />
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <Users size={40} />
            </div>
            <h3 className="text-xl font-bold text-gray-400">No matching accounts found</h3>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;
