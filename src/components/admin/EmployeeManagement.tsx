// Employee Management Component

import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../../types';
import { getUsers, saveUser, deleteUser } from '../../utils/database';
import { v4 as uuidv4 } from 'uuid';
import { UserPlus, Edit2, Trash2, X, Check, AlertCircle } from 'lucide-react';

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'wholesale' as UserRole,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = () => {
    const users = getUsers().filter(u => u.role !== 'admin');
    setEmployees(users);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.username || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    // Check for duplicate username
    const existingUsers = getUsers();
    const duplicate = existingUsers.find(
      u => u.username === formData.username && u.id !== editingUser?.id
    );
    if (duplicate) {
      setError('Username already exists');
      return;
    }

    const user: User = {
      id: editingUser?.id || uuidv4(),
      username: formData.username,
      password: formData.password,
      role: formData.role,
      createdAt: editingUser?.createdAt || new Date().toISOString(),
    };

    saveUser(user);
    loadEmployees();
    resetForm();
    setSuccess(editingUser ? 'Employee updated successfully' : 'Employee added successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role,
    });
    setShowForm(true);
  };

  const handleDelete = (userId: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      deleteUser(userId);
      loadEmployees();
      setSuccess('Employee deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    }
  };

  const resetForm = () => {
    setFormData({ username: '', password: '', role: 'wholesale' });
    setEditingUser(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-white">Employee Management</h3>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400">
          <Check className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-bold text-white">
                {editingUser ? 'Edit Employee' : 'Add New Employee'}
              </h4>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Enter username"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                  placeholder="Enter password"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="wholesale">Wholesale</option>
                  <option value="retail">Retail</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-colors"
                >
                  {editingUser ? 'Update' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Employees Table */}
      <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="text-left text-gray-300 font-medium p-4">Username</th>
              <th className="text-left text-gray-300 font-medium p-4">Role</th>
              <th className="text-left text-gray-300 font-medium p-4">Created</th>
              <th className="text-right text-gray-300 font-medium p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 p-8">
                  No employees found. Click "Add Employee" to create one.
                </td>
              </tr>
            ) : (
              employees.map((employee) => (
                <tr key={employee.id} className="border-t border-gray-700 hover:bg-gray-700/30">
                  <td className="p-4 text-white">{employee.username}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      employee.role === 'wholesale' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {employee.role}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(employee.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeManagement;
