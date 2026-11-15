import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';

const VisitorDashboard = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // New visit request form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ residentApartment: '', purpose: '', visitDate: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/visitors');
      setRequests(data.requests || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load visit requests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const validate = () => {
    const errs = {};
    if (!form.residentApartment.trim()) {
      errs.residentApartment = 'Resident apartment number is required';
    }
    if (!form.visitDate) {
      errs.visitDate = 'Visit date is required';
    } else {
      const selected = new Date(form.visitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        errs.visitDate = 'Visit date cannot be in the past';
      }
    }
    if (!form.purpose.trim()) {
      errs.purpose = 'Purpose of visit is required';
    } else if (form.purpose.trim().length > 500) {
      errs.purpose = 'Purpose cannot exceed 500 characters';
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/visitors', {
        residentApartment: form.residentApartment.trim(),
        visitDate: new Date(form.visitDate).toISOString(),
        purpose: form.purpose.trim(),
      });
      toast.success('Visit request submitted! Awaiting resident approval.');
      setForm({ residentApartment: '', purpose: '', visitDate: '' });
      setErrors({});
      setShowForm(false);
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit visit request');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200 mb-2">
                Visitor Portal
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Welcome, {user?.name}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Request entry permissions and track the status of your apartment visits in real-time.
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowForm(!showForm)}
                className="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
              >
                {showForm ? '✕ Close Form' : '+ New Visit Request'}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-8 transition-all">
            <div className="pb-4 mb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Request Apartment Visit</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  The resident of the targeted apartment will receive your request for approval.
                </p>
              </div>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-medium"
              >
                ✕ Cancel
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Resident's Apartment Number
                  </label>
                  <input
                    type="text"
                    value={form.residentApartment}
                    onChange={(e) => {
                      setForm({ ...form, residentApartment: e.target.value });
                      if (errors.residentApartment) setErrors({ ...errors, residentApartment: '' });
                    }}
                    placeholder="e.g. A101, B202"
                    disabled={submitting}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.residentApartment ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                  {errors.residentApartment && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.residentApartment}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Intended Visit Date</label>
                  <input
                    type="date"
                    min={todayStr}
                    value={form.visitDate}
                    onChange={(e) => {
                      setForm({ ...form, visitDate: e.target.value });
                      if (errors.visitDate) setErrors({ ...errors, visitDate: '' });
                    }}
                    disabled={submitting}
                    className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.visitDate ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                    }`}
                  />
                  {errors.visitDate && (
                    <p className="mt-1 text-xs text-rose-600 font-medium">{errors.visitDate}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purpose of Visit</label>
                <textarea
                  rows={3}
                  value={form.purpose}
                  onChange={(e) => {
                    setForm({ ...form, purpose: e.target.value });
                    if (errors.purpose) setErrors({ ...errors, purpose: '' });
                  }}
                  placeholder="e.g. Visiting family, parcel delivery, furniture assembly..."
                  disabled={submitting}
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.purpose ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                  }`}
                />
                {errors.purpose && <p className="mt-1 text-xs text-rose-600 font-medium">{errors.purpose}</p>}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  disabled={submitting}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold disabled:opacity-60 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            My Visit History ({requests.length})
          </h2>
          <button
            onClick={fetchRequests}
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
          >
            <span>🔄</span> Refresh Status
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : requests.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No visit requests submitted"
            description="Planning to visit a resident? Click '+ New Visit Request' to notify the apartment resident for pre-clearance."
          />
        ) : (
          <div className="space-y-4">
            {requests.map((r) => (
              <div
                key={r._id}
                className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-base">
                      Apartment {r.residentApartment}
                    </span>
                    <StatusBadge status={r.status} />
                  </div>
                  <span className="text-xs text-slate-400">
                    Requested on {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 mb-3 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="font-semibold text-slate-700">Scheduled Visit Date: </span>
                    {new Date(r.visitDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Purpose: </span>
                    {r.purpose}
                  </div>
                </div>

                {/* Status Callout Box */}
                {r.status === 'Pending' && (
                  <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 font-medium flex items-center gap-2">
                    <span>⏳</span> Awaiting approval from resident of Apt {r.residentApartment}
                  </div>
                )}
                {r.status === 'Approved' && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
                    <span>✅</span> Your visit request has been approved by the resident!
                  </div>
                )}
                {r.status === 'Rejected' && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 font-medium flex items-center gap-2">
                    <span>❌</span> Your visit request was declined by the resident.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VisitorDashboard;
