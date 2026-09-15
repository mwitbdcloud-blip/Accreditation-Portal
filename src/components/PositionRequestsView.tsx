import React from 'react';
import { Award, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { PositionAccessRequest } from '../types';
import { formatDate } from '../utils/dateFormatter';

interface PositionRequestsViewProps {
  requests: PositionAccessRequest[];
  onReviewRequest: (id: string, action: 'Approve' | 'Reject') => void;
  currentUserRole: string;
}

export const PositionRequestsView: React.FC<PositionRequestsViewProps> = ({
  requests,
  onReviewRequest,
  currentUserRole,
}) => {
  return (
    <div id="position-requests-view" className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 bg-blue-100 text-blue-900 rounded-lg">
            <Award className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-bold text-slate-900">Position Access Requests</h2>
        </div>
        <p className="text-xs text-slate-500">
          Marketing Manager and Marketing Director positions require authorization by BD Staff or Admin. Approved applicants gain access to the respective accreditation forms.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Affiliate Code</th>
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Current Position</th>
                <th className="py-3 px-4">Requested Position</th>
                <th className="py-3 px-4">Region</th>
                <th className="py-3 px-4">Request Date</th>
                <th className="py-3 px-4">Justification</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 text-xs">
                    No position access requests currently pending.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-950">{req.affiliateCode}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900">{req.fullName}</td>
                    <td className="py-3.5 px-4 text-slate-600">{req.currentPosition}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-900">{req.requestedPosition}</td>
                    <td className="py-3.5 px-4 text-slate-600">{req.region}</td>
                    <td className="py-3.5 px-4 text-slate-500">{formatDate(req.requestDate)}</td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          req.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'Pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {req.status === 'Pending' ? (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onReviewRequest(req.id, 'Approve')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => onReviewRequest(req.id, 'Reject')}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-lg transition"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
