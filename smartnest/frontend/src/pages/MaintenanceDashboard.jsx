import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const categoryColors = {
  Plumbing: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  Electrical: 'bg-amber-100 text-amber-800 border-amber-200',
  Cleaning: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  General: 'bg-slate-100 text-slate-800 border-slate-200',
};

const categoryIcons = {
  Plumbing: '🚰',
  Electrical: '⚡',
  Cleaning: '🧹',
  General: '📋',
};

const MaintenanceDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Status update modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [newStatus, setNewStatus] = useState('Pending');
  const [resolutionNote, setResolutionNote] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;

      const { data } = await api.get('/complaints', { params });
      setComplaints(data.complaints || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setResolutionNote(complaint.resolutionNote || '');
  };

  const closeUpdateModal = () => {
    setSelectedComplaint(null);
    setNewStatus('Pending');
    setResolutionNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setUpdating(true);
    try {
      await api.patch(`/complaints/${selectedComplaint._id}/status`, {
        status: newStatus,
        resolutionNote: resolutionNote.trim(),
      });
      toast.success(`Complaint status updated to ${newStatus}`);
      closeUpdateModal();
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setUpdating(false);
    }
  };

  // Metrics
  const totalCount = complaints.length;
  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200 mb-2">
                Maintenance Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Operations & Maintenance Console
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Signed in as <strong className="text-slate-700 font-semibold">{user?.name}</strong> • Dispatch resolutions across all building units
              </p>
            </div>
            <div>
              <button
                onClick={fetchComplaints}
                className="inline-flex items-center px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-colors"
              >
                <span className="mr-1.5">🔄</span> Refresh Feed
              </button>
            </div>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filtered Items</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">{totalCount}</div>
            </div>
            <div className="bg-amber-50/60 rounded-xl p-4 border border-amber-200/60">
              <div className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Needs Action</div>
              <div className="text-2xl font-extrabold text-amber-900 mt-1">{pendingCount}</div>
            </div>
            <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200/60">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wider">In Progress</div>
              <div className="text-2xl font-extrabold text-blue-900 mt-1">{inProgressCount}</div>
            </div>
            <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/60">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Resolved</div>
              <div className="text-2xl font-extrabold text-emerald-900 mt-1">{resolvedCount}</div>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200/80 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending Only</option>
                <option value="In Progress">In Progress Only</option>
                <option value="Resolved">Resolved Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Category Filter</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="Plumbing">🚰 Plumbing</option>
                <option value="Electrical">⚡ Electrical</option>
                <option value="Cleaning">🧹 Cleaning</option>
                <option value="General">📋 General</option>
              </select>
            </div>

            {(statusFilter || categoryFilter) && (
              <button
                onClick={() => {
                  setStatusFilter('');
                  setCategoryFilter('');
                }}
                className="self-end mb-1 text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1"
              >
                ✕ Clear filters
              </button>
            )}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{complaints.length}</strong> complaints
          </div>
        </div>

        {/* Complaint Feed */}
        {loading ? (
          <LoadingSpinner />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon="🛠"
            title="No complaints matching your criteria"
            description="All systems normal! Try adjusting or clearing your filters to see more entries."
          />
        ) : (
          <div className="space-y-4">
            {complaints.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                        categoryColors[c.category] || categoryColors.General
                      }`}
                    >
                      <span className="mr-1">{categoryIcons[c.category] || '📋'}</span>
                      {c.category}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <span className="text-xs text-slate-400">
                    Logged: {new Date(c.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-1">{c.title}</h3>
                    <p className="text-xs text-slate-500 mb-2">
                      Reported by: <strong className="text-slate-700">{c.residentName}</strong>
                    </p>
                    <p className="text-sm text-slate-600 leading-relaxed">{c.description}</p>
                  </div>

                  <button
                    onClick={() => openUpdateModal(c)}
                    className="self-start sm:self-center shrink-0 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <span>✏️</span> Update Status
                  </button>
                </div>

                {/* Resolution note */}
                {c.resolutionNote && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                    <span className="font-semibold text-emerald-800">Resolution Note: </span>
                    {c.resolutionNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Modal for Status Update */}
        {selectedComplaint && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Update Complaint Status</h3>
                  <p className="text-xs text-slate-500 truncate max-w-sm">{selectedComplaint.title}</p>
                </div>
                <button
                  onClick={closeUpdateModal}
                  disabled={updating}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    disabled={updating}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">⏳ Pending (Under Review)</option>
                    <option value="In Progress">🛠 In Progress (Technician Dispatched)</option>
                    <option value="Resolved">✅ Resolved (Work Complete)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resolution / Progress Note
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    placeholder="Describe actions taken, replaced components, or instructions for the resident..."
                    disabled={updating}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    This note will be visible to the resident on their dashboard.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeUpdateModal}
                    disabled={updating}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {updating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MaintenanceDashboard;
