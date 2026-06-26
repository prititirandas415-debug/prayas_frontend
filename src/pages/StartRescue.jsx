import { useState, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import SuccessPopup from '../components/SuccessPopup';
import api from '../api/axios';

const TREATMENT_MODES = [
  {
    id: 'On Call Treatment',
    label: 'On Call Treatment',
    emoji: '📞',
    desc: 'Animal treated remotely via phone guidance',
    color: 'border-amber-300 bg-amber-50 hover:bg-amber-100',
    activeColor: 'border-amber-500 bg-amber-50 ring-2 ring-amber-300',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    id: 'On Spot Treatment',
    label: 'On Spot Treatment',
    emoji: '🏥',
    desc: 'Rider physically present and treated animal',
    color: 'border-brand-300 bg-brand-50 hover:bg-brand-50',
    activeColor: 'border-brand-500 bg-brand-50 ring-2 ring-brand-300',
    iconBg: 'bg-brand-100 text-brand-600',
  },
  {
    id: 'Not Available',
    label: 'Not Available',
    emoji: '🚫',
    desc: 'Rider was unavailable for the rescue',
    color: 'border-gray-300 bg-gray-50 hover:bg-gray-100',
    activeColor: 'border-gray-500 bg-gray-50 ring-2 ring-gray-300',
    iconBg: 'bg-gray-100 text-gray-500',
  },
];

const CONDITIONS = ['Dead', 'Not Found', 'Treatment'];
const TREATMENT_TYPES = ['Bandage', 'Medicine', 'Rescue'];
const MEDICINE_TYPES = ['Antibiotic', 'Pain Relief', 'Antiseptic', 'Injection', 'Other'];

const initialForm = {
  rescue_id: '',
  treatment_mode: '',
  remark: '',
  start_meter: '',
  end_meter: '',
  condition: '',
  treatment_type: '',
  medicine_type: '',
  photo: null,
};

export default function StartRescue() {
  const [step, setStep] = useState(1); // 1 = Rescue ID, 2 = Form
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [savedRescueId, setSavedRescueId] = useState('');

  const distance =
    form.start_meter !== '' && form.end_meter !== ''
      ? Math.max(0, parseFloat(form.end_meter || 0) - parseFloat(form.start_meter || 0)).toFixed(2)
      : null;

  const set = (field, value) => {
    setForm((f) => {
      const next = { ...f, [field]: value };
      // Reset dependent fields
      if (field === 'treatment_mode') {
        next.remark = '';
        next.start_meter = '';
        next.end_meter = '';
        next.condition = '';
        next.treatment_type = '';
        next.medicine_type = '';
      }
      if (field === 'condition') {
        next.treatment_type = '';
        next.medicine_type = '';
      }
      if (field === 'treatment_type') {
        next.medicine_type = '';
      }
      return next;
    });
    setErrors((e) => ({ ...e, [field]: '' }));
  };

  const validateStep1 = () => {
    const errs = {};
    if (!form.rescue_id.trim()) errs.rescue_id = 'Rescue ID is required.';
    return errs;
  };

  const validateStep2 = () => {
    const errs = {};
    if (!form.treatment_mode) { errs.treatment_mode = 'Please select a treatment mode.'; return errs; }

    if (form.treatment_mode === 'On Spot Treatment') {
      if (!form.start_meter) errs.start_meter = 'Start meter reading is required.';
      if (!form.end_meter) errs.end_meter = 'End meter reading is required.';
      else if (parseFloat(form.end_meter) < parseFloat(form.start_meter)) {
        errs.end_meter = 'End meter must be ≥ start meter.';
      }
      if (!form.condition) errs.condition = 'Condition is required.';
      if (form.condition === 'Treatment' && !form.treatment_type) {
        errs.treatment_type = 'Treatment type is required.';
      }
      if (form.treatment_type === 'Medicine' && !form.medicine_type) {
        errs.medicine_type = 'Medicine type is required.';
      }
    }
    return errs;
  };

  const handleStep1Next = () => {
    const errs = validateStep1();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setStep(2);
  };

  const handleSubmit = async () => {
    const errs = validateStep2();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('rescue_id', form.rescue_id.trim());
      formData.append('treatment_mode', form.treatment_mode);
      if (form.remark) formData.append('remark', form.remark);

      if (form.treatment_mode === 'On Spot Treatment') {
        if (form.start_meter) formData.append('start_meter', form.start_meter);
        if (form.end_meter) formData.append('end_meter', form.end_meter);
        if (distance) formData.append('distance', distance);
        if (form.condition) formData.append('condition', form.condition);
        if (form.condition === 'Treatment' && form.treatment_type) {
          formData.append('treatment_type', form.treatment_type);
        }
        if (form.treatment_type === 'Medicine' && form.medicine_type) {
          formData.append('medicine_type', form.medicine_type);
        }
        if (form.photo) {
          formData.append('photo', form.photo);
        }
      }

      await api.post('/rescue', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      setSavedRescueId(form.rescue_id.trim());
      setShowSuccess(true);
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to save rescue. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = useCallback(() => {
    setShowSuccess(false);
    setForm(initialForm);
    setStep(1);
    setErrors({});
  }, []);

  return (
    <Sidebar>
      {showSuccess && (
        <SuccessPopup
          rescueId={savedRescueId}
          message="Rescue record has been saved successfully."
          onClose={handleSuccessClose}
        />
      )}

      <div className="p-4 md:p-8 max-w-2xl mx-auto">
        {/* Page Header */}
        <div className="mb-6 animate-slide-up">
          <div className="flex items-center gap-3 mb-1">
            <button
              id="back-to-dashboard"
              onClick={() => step === 2 ? setStep(1) : window.history.back()}
              className="p-2 rounded-xl text-gray-500 hover:bg-white/80 hover:text-gray-700 transition-colors"
              aria-label="Go back"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-gray-800">Start Rescue</h1>
              <p className="text-gray-500 text-sm">Log a new rescue operation</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step >= s
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : s}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step >= s ? 'text-brand-700' : 'text-gray-400'}`}>
                  {s === 1 ? 'Rescue ID' : 'Treatment Details'}
                </span>
                {s < 2 && <div className={`flex-1 h-0.5 w-8 ${step > s ? 'bg-brand-400' : 'bg-gray-200'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* ── Step 1: Rescue ID ─────────────────────────────────── */}
        {step === 1 && (
          <div className="glass-card p-6 animate-slide-up">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-brand-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-gray-800">Step 1 — Rescue ID</h2>
                <p className="text-xs text-gray-500">Paste or type the Rescue ID from your assignment</p>
              </div>
            </div>

            <div>
              <label htmlFor="rescue_id" className="form-label">Rescue ID <span className="text-red-400">*</span></label>
              <input
                id="rescue_id"
                type="text"
                value={form.rescue_id}
                onChange={(e) => set('rescue_id', e.target.value)}
                placeholder="e.g. RSC-2024-001"
                className={`form-input ${errors.rescue_id ? 'border-red-400' : ''}`}
                autoFocus
              />
              {errors.rescue_id && <p className="mt-1.5 text-xs text-red-500 font-medium">{errors.rescue_id}</p>}
            </div>

            <button
              id="step1-next-btn"
              onClick={handleStep1Next}
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
            >
              Continue
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        )}

        {/* ── Step 2: Treatment Mode & Details ─────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-slide-up">
            {/* Rescue ID Badge */}
            <div className="glass-card px-5 py-3 flex items-center gap-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Rescue ID</span>
              <span className="font-bold text-brand-700 text-sm">{form.rescue_id}</span>
            </div>

            {/* Treatment Mode Selection */}
            <div className="glass-card p-6">
              <h2 className="font-bold text-gray-800 mb-1">Step 2 — Treatment Mode</h2>
              <p className="text-xs text-gray-500 mb-4">Select the type of rescue treatment provided</p>

              <div className="space-y-3">
                {TREATMENT_MODES.map((mode) => (
                  <button
                    key={mode.id}
                    id={`mode-${mode.id.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => set('treatment_mode', mode.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                      form.treatment_mode === mode.id ? mode.activeColor : mode.color + ' border-2'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${mode.iconBg}`}>
                      {mode.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800 text-sm">{mode.label}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{mode.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
                      form.treatment_mode === mode.id ? 'border-brand-600 bg-brand-600' : 'border-gray-300'
                    }`}>
                      {form.treatment_mode === mode.id && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              {errors.treatment_mode && <p className="mt-2 text-xs text-red-500 font-medium">{errors.treatment_mode}</p>}
            </div>

            {/* ── On Call Treatment Fields ── */}
            {(form.treatment_mode === 'On Call Treatment' || form.treatment_mode === 'Not Available') && (
              <div className="glass-card p-6 animate-fade-in">
                <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <span>{form.treatment_mode === 'On Call Treatment' ? '📞' : '🚫'}</span>
                  {form.treatment_mode === 'On Call Treatment' ? 'On Call Details' : 'Not Available — Details'}
                </h3>
                <div>
                  <label htmlFor="remark" className="form-label">
                    Remark <span className="text-gray-400 text-xs">(optional)</span>
                  </label>
                  <textarea
                    id="remark"
                    rows={4}
                    value={form.remark}
                    onChange={(e) => set('remark', e.target.value)}
                    placeholder={
                      form.treatment_mode === 'On Call Treatment'
                        ? 'Describe the on-call guidance provided...'
                        : 'Reason for unavailability...'
                    }
                    className="form-textarea"
                  />
                </div>
              </div>
            )}

            {/* ── On Spot Treatment Fields ── */}
            {form.treatment_mode === 'On Spot Treatment' && (
              <div className="space-y-5 animate-fade-in">
                {/* Meter Readings */}
                <div className="glass-card p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🏍️</span> Bike Meter Readings
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="start_meter" className="form-label">
                        Start Meter (km) <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="start_meter"
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.start_meter}
                        onChange={(e) => set('start_meter', e.target.value)}
                        placeholder="e.g. 1200.0"
                        className={`form-input ${errors.start_meter ? 'border-red-400' : ''}`}
                      />
                      {errors.start_meter && <p className="mt-1 text-xs text-red-500">{errors.start_meter}</p>}
                    </div>
                    <div>
                      <label htmlFor="end_meter" className="form-label">
                        End Meter (km) <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="end_meter"
                        type="number"
                        min="0"
                        step="0.1"
                        value={form.end_meter}
                        onChange={(e) => set('end_meter', e.target.value)}
                        placeholder="e.g. 1215.5"
                        className={`form-input ${errors.end_meter ? 'border-red-400' : ''}`}
                      />
                      {errors.end_meter && <p className="mt-1 text-xs text-red-500">{errors.end_meter}</p>}
                    </div>
                  </div>

                  {/* Distance Auto-Calc */}
                  {distance !== null && (
                    <div className="mt-4 p-4 bg-gradient-to-r from-brand-50 to-ocean-50 border-2 border-brand-200 rounded-2xl flex items-center gap-3 animate-pop-in">
                      <div className="w-10 h-10 bg-brand-100 rounded-xl flex items-center justify-center text-xl">
                        📍
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Distance Travelled</p>
                        <p className="text-2xl font-extrabold text-brand-700">{distance} <span className="text-sm font-semibold">km</span></p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Condition */}
                <div className="glass-card p-6">
                  <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <span>🔍</span> Animal Condition
                  </h3>
                  <div>
                    <label htmlFor="condition" className="form-label">
                      Condition <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="condition"
                      value={form.condition}
                      onChange={(e) => set('condition', e.target.value)}
                      className={`form-select ${errors.condition ? 'border-red-400' : ''}`}
                    >
                      <option value="">-- Select condition --</option>
                      {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.condition && <p className="mt-1 text-xs text-red-500">{errors.condition}</p>}
                  </div>

                  {/* Condition badges */}
                  {form.condition && (
                    <div className="mt-3 flex gap-2 flex-wrap animate-fade-in">
                      {form.condition === 'Dead' && <span className="badge bg-red-100 text-red-700">⚠️ Animal Deceased</span>}
                      {form.condition === 'Not Found' && <span className="badge bg-yellow-100 text-yellow-700">🔎 Animal Not Located</span>}
                      {form.condition === 'Treatment' && <span className="badge bg-green-100 text-green-700">💊 Treatment Required</span>}
                    </div>
                  )}
                </div>

                {/* Treatment Type (only if condition = Treatment) */}
                {form.condition === 'Treatment' && (
                  <div className="glass-card p-6 animate-slide-up">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span>💊</span> Treatment Type
                    </h3>
                    <div>
                      <label htmlFor="treatment_type" className="form-label">
                        Treatment Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="treatment_type"
                        value={form.treatment_type}
                        onChange={(e) => set('treatment_type', e.target.value)}
                        className={`form-select ${errors.treatment_type ? 'border-red-400' : ''}`}
                      >
                        <option value="">-- Select treatment type --</option>
                        {TREATMENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.treatment_type && <p className="mt-1 text-xs text-red-500">{errors.treatment_type}</p>}
                    </div>
                  </div>
                )}

                {/* Medicine Type (only if treatment_type = Medicine) */}
                {form.condition === 'Treatment' && form.treatment_type === 'Medicine' && (
                  <div className="glass-card p-6 animate-slide-up">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span>💉</span> Medicine Type
                    </h3>
                    <div>
                      <label htmlFor="medicine_type" className="form-label">
                        Medicine Type <span className="text-red-400">*</span>
                      </label>
                      <select
                        id="medicine_type"
                        value={form.medicine_type}
                        onChange={(e) => set('medicine_type', e.target.value)}
                        className={`form-select ${errors.medicine_type ? 'border-red-400' : ''}`}
                      >
                        <option value="">-- Select medicine type --</option>
                        {MEDICINE_TYPES.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                      {errors.medicine_type && <p className="mt-1 text-xs text-red-500">{errors.medicine_type}</p>}
                    </div>
                  </div>
                )}

                {/* Photo Upload (only if condition = Treatment) */}
                {form.condition === 'Treatment' && (
                  <div className="glass-card p-6 animate-slide-up">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <span>📸</span> Treatment Photo <span className="text-gray-400 text-xs font-normal">(optional)</span>
                    </h3>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => set('photo', e.target.files[0])}
                        className="form-input"
                      />
                    </div>
                  </div>
                )}

                {/* Remark for On Spot */}
                <div className="glass-card p-6">
                  <label htmlFor="remark-spot" className="form-label flex items-center gap-2">
                    📝 Remark <span className="text-gray-400 text-xs font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="remark-spot"
                    rows={3}
                    value={form.remark}
                    onChange={(e) => set('remark', e.target.value)}
                    placeholder="Any additional notes about this rescue..."
                    className="form-textarea"
                  />
                </div>
              </div>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {errors.submit}
              </div>
            )}

            {/* Submit Button */}
            {form.treatment_mode && (
              <button
                id="complete-rescue-btn"
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 text-base py-4"
              >
                {loading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving Rescue...
                  </>
                ) : (
                  <>
                    {form.treatment_mode === 'On Spot Treatment' ? '✅ Complete Rescue' : '📤 Submit'}
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </Sidebar>
  );
}
