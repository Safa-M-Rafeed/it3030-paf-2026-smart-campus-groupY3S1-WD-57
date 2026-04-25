import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN', 'MANAGER'];

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [savingId, setSavingId] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const loadUsers = async () => {
      const res = await axios.get('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data || []);
    };
    loadUsers().catch((err) => console.error('Failed loading users', err));
  }, [token]);

  const changeRole = async (userId, newRole) => {
    setSavingId(userId);
    try {
      await axios.put(
        `/api/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Role update failed', err);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f5f0e8] p-6">
      <div className="max-w-5xl mx-auto bg-white border border-[#d8ccb8] rounded-lg shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#efe4d2] bg-[#fffaf3]">
          <h2 className="text-xl font-bold text-[#1f1a17]">Admin - User Role Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            Update roles based on workflow (USER / ADMIN / TECHNICIAN / MANAGER).
          </p>
        </div>

        <div className="divide-y divide-[#f1e8da]">
          {users.map((u) => (
            <div key={u.id} className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-[#fffdf9] transition">
              <div>
                <p className="font-medium text-[#1f1a17]">{u.name || 'Unnamed user'}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Role</span>
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, e.target.value)}
                  disabled={savingId === u.id}
                  className="border border-[#d6c8b2] rounded px-2 py-1 text-sm bg-white"
                >
                  {ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {users.length === 0 && (
            <div className="p-5 text-sm text-gray-500">No users available yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
