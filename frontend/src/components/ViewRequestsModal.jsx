import React, { useState } from "react";
import { X, User, Mail, Phone, Calendar, FileText, UserCheck, UserX, Clock } from "lucide-react";

const ViewRequestsModal = ({ 
  requests, 
  onClose, 
  onReject, 
  onScheduleMeeting, 
  onDealCompleted, 
  adoptionId 
}) => {
  const [confirming, setConfirming] = useState(null); // { type: 'reject' | 'complete', requestId }
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
      "meet scheduled": { color: "bg-blue-100 text-blue-800", icon: Calendar },
      approved: { color: "bg-green-100 text-green-800", icon: UserCheck },
      rejected: { color: "bg-red-100 text-red-800", icon: UserX }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Adoption Requests</h2>
            <p className="text-gray-600 mt-1">{requests.length} request(s) received</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📬</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No requests yet</h3>
              <p className="text-gray-500">Adoption requests will appear here when received.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Requester Information */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">
                            {request.requesterId.name}
                          </h3>
                          {getStatusBadge(request.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4" />
                          <span className="text-sm">{request.requesterId.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4" />
                          <span className="text-sm">{request.requesterId.phone}</span>
                        </div>
                      </div>

                      {/* Meeting Details */}
                      {request.meetingDate && (
                        <div className="bg-white p-4 rounded-lg mb-4">
                          <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">Scheduled Meeting</span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            {formatDate(request.meetingDate)}
                          </p>
                        </div>
                      )}

                      {/* Notes */}
                      {request.notes && (
                        <div className="bg-white p-4 rounded-lg">
                          <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium text-sm">Notes</span>
                          </div>
                          <p className="text-gray-700 text-sm">{request.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:w-48">
                      <button
                        onClick={() => setConfirming({ type: "reject", requestId: request._id })}
                        className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        <UserX className="h-4 w-4" />
                        Reject
                      </button>
                      
                      <button
                        onClick={() => onScheduleMeeting(request)}
                        className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium text-white ${
                          request.status === "meet scheduled"
                            ? "bg-orange-600 hover:bg-orange-700"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                      >
                        <Calendar className="h-4 w-4" />
                        {request.status === "meet scheduled" ? "Edit Meeting" : "Schedule Meeting"}
                      </button>
                      
                      <button
                        onClick={() => setConfirming({ type: "complete", requestId: request._id })}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        <UserCheck className="h-4 w-4" />
                        Complete Deal
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>

      {/* Beautiful Custom Confirmation Dialog Overlay */}
      {confirming && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center border border-gray-100 transform scale-100 transition-all duration-300">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              confirming.type === "reject" ? "bg-red-100" : "bg-green-100"
            }`}>
              {confirming.type === "reject" ? (
                <UserX className="h-8 w-8 text-red-600" />
              ) : (
                <UserCheck className="h-8 w-8 text-green-600" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {confirming.type === "reject" ? "Reject Request?" : "Complete Deal?"}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirming.type === "reject"
                ? "Are you sure you want to reject this adoption request? This action cannot be undone."
                : "Are you sure you want to complete this deal? This will finalize the adoption."}
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setConfirming(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium text-sm w-full"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirming.type === "reject") {
                    onReject(confirming.requestId);
                  } else {
                    onDealCompleted(confirming.requestId, adoptionId);
                  }
                  setConfirming(null);
                }}
                className={`px-4 py-2 text-white rounded-xl transition font-medium text-sm w-full ${
                  confirming.type === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Yes, Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewRequestsModal;
