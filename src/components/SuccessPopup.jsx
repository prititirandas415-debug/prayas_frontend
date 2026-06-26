import { useEffect } from 'react';

export default function SuccessPopup({ message, onClose, rescueId }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup Card */}
      <div className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full animate-pop-in text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {/* Paw icon row */}
        <div className="flex justify-center gap-2 mb-4">
          {['🐾', '🚑', '🐾'].map((e, i) => (
            <span key={i} className="text-2xl">{e}</span>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Rescue Saved!</h2>
        <p className="text-gray-500 text-sm mb-1">{message || 'Rescue record has been saved successfully.'}</p>
        {rescueId && (
          <div className="mt-3 inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-xl px-4 py-2">
            <span className="text-xs font-semibold text-brand-700">Rescue ID:</span>
            <span className="text-sm font-bold text-brand-600">{rescueId}</span>
          </div>
        )}

        <button
          id="success-popup-close"
          onClick={onClose}
          className="mt-6 w-full btn-primary"
        >
          Done
        </button>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
            style={{ animation: 'shrink 4s linear forwards' }}
          />
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
    </div>
  );
}
