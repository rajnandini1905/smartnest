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

const ResidentDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [visitorRequests, setVisitorRequests] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // New complaint form state
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [complaintForm, setComplaintForm] = useState({ title: '', description: '' });
  const [complaintErrors, setComplaintErrors] = useState({});
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Updating visitor request state
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoadingComplaints(true);
    try {
      const { data } = await api.get('/complaints');
      setComplaints(data.complaints || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoadingComplaints(false);
    }
  }, []);

  const fetchVisitorRequests = useCallback(async () => {
    setLoadingRequests(true);
    try {
      const { data } = await api.get('/visitors');
      setVisitorRequests(data.requests || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch visitor requests');
    } finally {
      setLoadingRequests(false);
    }
  }, []);

  useEffect(() => {
    fetchComplaints();
    fetchVisitorRequests();
  }, [fetchComplaints, fetchVisitorRequests]);

  const validateComplaint = () => {
    const errs = {};
    if (!complaintForm.title.trim()) {
      errs.title = 'Title is required';
    } else if (complaintForm.title.trim().length > 100) {
      errs.title = 'Title cannot exceed 100 characters';
    }

    if (!complaintForm.description.trim()) {
      errs.description = 'Description is required';
    } else if (complaintForm.description.trim().length > 1000) {
      errs.description = 'Description cannot exceed 1000 characters';
    }
    return errs;
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    const errs = validateComplaint();
    if (Object.keys(errs).length > 0) {
      setComplaintErrors(errs);
      return;
    }

    setSubmittingComplaint(true);
    try {
      const { data } = await api.post('/complaints', {
        title: complaintForm.title.trim(),
        description: complaintForm.description.trim(),
      });
      toast.success(`Complaint registered! Categorized as ${data.complaint.category}`);
      setComplaintForm({ title: '', description: '' });
      setComplaintErrors({});
      setShowComplaintForm(false);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit complaint');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const handleRequestAction = async (requestId, status) => {
    setUpdatingRequestId(requestId);
    try {
      await api.patch(`/visitors/${requestId}/status`, { status });
      toast.success(`Visitor request has been ${status.toLowerCase()}`);
      fetchVisitorRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${status.toLowerCase()} request`);
    } finally {
      setUpdatingRequestId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 mb-2">
                Resident Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome home, {user?.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Apartment <strong className="text-slate-700 font-semibold">{user?.apartmentNumber}</strong> • Registered email: {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveTab('complaints');
                  setShowComplaintForm(true);
                }}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                <span className="mr-1.5 text-base">+</span> New Complaint
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
              <div className="text-xs font-medium text-slate-500">My Complaints</div>
              <div className="text-xl font-bold text-slate-900 mt-0.5">{complaints.length}</div>
            </div>
            <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-200/60">
              <div className="text-xs font-medium text-amber-700">Pending Issues</div>
              <div className="text-xl font-bold text-amber-900 mt-0.5">
                {complaints.filter((c) => c.status === 'Pending').length}
              </div>
            </div>
            <div className="bg-emerald-50/50 rounded-xl p-3 border border-emerald-200/60">
              <div className="text-xs font-medium text-emerald-700">Resolved Issues</div>
              <div className="text-xl font-bold text-emerald-900 mt-0.5">
                {complaints.filter((c) => c.status === 'Resolved').length}
              </div>
            </div>
            <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-200/60">
              <div className="text-xs font-medium text-indigo-700">Visitor Requests</div>
              <div className="text-xl font-bold text-indigo-900 mt-0.5">{visitorRequests.length}</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => setActiveTab('complaints')}
            className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'complaints'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>🛠</span> My Complaints
            <span className="ml-1.5 py-0.5 px-2 bg-slate-200 text-slate-700 rounded-full text-xs font-medium">
              {complaints.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('visitors')}
            className={`pb-3 px-4 font-semibold text-sm border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'visitors'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>👤</span> Visitor Approvals
            <span className="ml-1.5 py-0.5 px-2 bg-slate-200 text-slate-700 rounded-full text-xs font-medium">
              {visitorRequests.length}
            </span>
          </button>
        </div>

        {/* COMPLAINTS TAB */}
        {activeTab === 'complaints' && (
          <div>
            {/* Create Complaint Form */}
            {showComplaintForm && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-8 transition-all">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">File a New Complaint</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Our system automatically classifies your issue as Plumbing, Electrical, Cleaning, or General.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowComplaintForm(false);
                      setComplaintErrors({});
                    }}
                    className="text-slate-400 hover:text-slate-600 text-sm font-medium p-1"
                  >
                    ✕ Close
                  </button>
                </div>

                <form onSubmit={handleComplaintSubmit} noValidate className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Issue Title</label>
                    <input
                      type="text"
                      value={complaintForm.title}
                      onChange={(e) => {
                        setComplaintForm({ ...complaintForm, title: e.target.value });
                        if (complaintErrors.title) setComplaintErrors({ ...complaintErrors, title: '' });
                      }}
                      placeholder="e.g. Water leak under bathroom sink"
                      disabled={submittingComplaint}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        complaintErrors.title ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                    {complaintErrors.title && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{complaintErrors.title}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Detailed Description</label>
                    <textarea
                      rows={3}
                      value={complaintForm.description}
                      onChange={(e) => {
                        setComplaintForm({ ...complaintForm, description: e.target.value });
                        if (complaintErrors.description) setComplaintErrors({ ...complaintErrors, description: '' });
                      }}
                      placeholder="Describe the issue in detail (e.g. location, urgency, severity)..."
                      disabled={submittingComplaint}
                      className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                        complaintErrors.description ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                      }`}
                    />
                    {complaintErrors.description && (
                      <p className="mt-1 text-xs text-rose-600 font-medium">{complaintErrors.description}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-400">
                      💡 Keywords like <code className="bg-slate-100 px-1 py-0.5 rounded">leak, light, trash</code> determine category
                    </span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowComplaintForm(false)}
                        disabled={submittingComplaint}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingComplaint}
                        className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 flex items-center gap-1.5"
                      >
                        {submittingComplaint ? (
                          <>
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Submitting...
                          </>
                        ) : (
                          'Submit Complaint'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* Complaint List */}
            {loadingComplaints ? (
              <LoadingSpinner />
            ) : complaints.length === 0 ? (
              <EmptyState
                icon="🛠"
                title="No complaints filed yet"
                description="Everything in your apartment looks good! Click '+ New Complaint' above whenever you need maintenance assistance."
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
                        Filed on {new Date(c.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mb-1.5">{c.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-3">{c.description}</p>

                    {/* Resolution Note if present */}
                    {c.resolutionNote && (
                      <div className="mt-3 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
                        <div className="font-semibold flex items-center gap-1.5 text-emerald-800 mb-0.5">
                          <span>✅</span> Maintenance Resolution Note:
                        </div>
                        <p className="text-emerald-900/90">{c.resolutionNote}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISITOR REQUESTS TAB */}
        {activeTab === 'visitors' && (
          <div>
            <div className="mb-4">
              <h2 className="text-base font-bold text-slate-900">
                Visitor Access Requests for Apt {user?.apartmentNumber}
              </h2>
              <p className="text-xs text-slate-500">
                Approve or reject guests who requested entry to your apartment.
              </p>
            </div>

            {loadingRequests ? (
              <LoadingSpinner />
            ) : visitorRequests.length === 0 ? (
              <EmptyState
                icon="👤"
                title="No visitor requests"
                description="When visitors request access to your apartment number, their approval requests will appear here."
              />
            ) : (
              <div className="space-y-4">
                {visitorRequests.map((r) => (
                  <div
                    key={r._id}
                    className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{r.visitorName}</h3>
                          <StatusBadge status={r.status} />
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Requested visit date:{' '}
                          <span className="font-medium text-slate-700">
                            {new Date(r.visitDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
                          </span>
                        </p>
                      </div>
                      <span className="text-xs text-slate-400">
                        Submitted: {new Date(r.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60 text-xs text-slate-700 mb-4">
                      <span className="font-semibold text-slate-800">Visit Purpose: </span>
                      {r.purpose}
                    </div>

                    {r.status === 'Pending' ? (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleRequestAction(r._id, 'Approved')}
                          disabled={updatingRequestId === r._id}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-60"
                        >
                          {updatingRequestId === r._id ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <span>✓</span>
                          )}
                          Approve Entry
                        </button>
                        <button
                          onClick={() => handleRequestAction(r._id, 'Rejected')}
                          disabled={updatingRequestId === r._id}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 disabled:opacity-60"
                        >
                          {updatingRequestId === r._id ? (
                            <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            <span>✕</span>
                          )}
                          Reject
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
                        {r.status === 'Approved' ? (
                          <span className="text-emerald-600 font-semibold">✓ You approved this visit request</span>
                        ) : (
                          <span className="text-rose-600 font-semibold">✕ You rejected this visit request</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ResidentDashboard;
