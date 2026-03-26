"use client";

import { useState } from "react";
import { Phone, MessageSquare, Mail, Edit3, Loader2 } from "lucide-react";
import { createActivity } from "@/app/actions/activities";
import { toast } from "react-hot-toast";

type ComposeBarProps = {
  leadId: string;
};

type TabType = 'call' | 'sms' | 'email' | 'note';

export function ComposeBar({ leadId }: ComposeBarProps) {
  const [activeTab, setActiveTab] = useState<TabType>('call');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [direction, setDirection] = useState<'outbound' | 'inbound'>('outbound');
  const [result, setResult] = useState('');
  const [spokeWith, setSpokeWith] = useState('');
  const [duration, setDuration] = useState('');
  const [ownerMotivation, setOwnerMotivation] = useState('');
  const [offerAsk, setOfferAsk] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [nextStep, setNextStep] = useState('');
  const [body, setBody] = useState('');
  const [subject, setSubject] = useState('');
  const [recipient, setRecipient] = useState('');

  const submitActivity = async () => {
    setIsSubmitting(true);
    let payload: any = { body };
    let finalActivityType = activeTab;

    if (activeTab === 'call') {
      let durationSeconds = 0;
      if (duration) {
        const parts = duration.split(':');
        if (parts.length === 2) {
          durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1]);
        }
      }
      payload = {
        direction,
        result,
        spoke_with: spokeWith,
        duration_seconds: durationSeconds,
        owner_motivation: ownerMotivation,
        offer_ask: offerAsk,
        follow_up_date: followUpDate || null,
        next_step: nextStep,
        body
      };
    } else if (activeTab === 'sms') {
      payload = {
        direction,
        body,
        recipient
      };
    } else if (activeTab === 'email') {
      payload = {
        subject,
        body,
        recipient
      };
    }

    const { error } = await createActivity(leadId, finalActivityType, payload);
    setIsSubmitting(false);

    if (error) {
      toast.error('Failed to save activity');
    } else {
      toast.success('Activity saved');
      resetForm();
    }
  };

  const resetForm = () => {
    setBody('');
    setDuration('');
    setSubject('');
    setRecipient('');
    setResult('');
    setSpokeWith('');
    setOwnerMotivation('');
    setOfferAsk('');
    setFollowUpDate('');
    setNextStep('');
  };

  return (
    <div className="glass-card mb-6 overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
        <button
          onClick={() => setActiveTab('call')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'call'
              ? 'border-b-2 border-[var(--accent-blue)] text-[var(--accent-blue)] bg-[var(--bg-secondary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }`}
        >
          <Phone size={16} />
          Log Call
        </button>
        <button
          onClick={() => setActiveTab('sms')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'sms'
              ? 'border-b-2 border-[var(--accent-blue)] text-[var(--accent-blue)] bg-[var(--bg-secondary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }`}
        >
          <MessageSquare size={16} />
          SMS
        </button>
        <button
          onClick={() => setActiveTab('email')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'email'
              ? 'border-b-2 border-[var(--accent-blue)] text-[var(--accent-blue)] bg-[var(--bg-secondary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }`}
        >
          <Mail size={16} />
          Email
        </button>
        <button
          onClick={() => setActiveTab('note')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
            activeTab === 'note'
              ? 'border-b-2 border-[var(--accent-blue)] text-[var(--accent-blue)] bg-[var(--bg-secondary)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
          }`}
        >
          <Edit3 size={16} />
          Note
        </button>
      </div>

      {/* Form Area */}
      <div className="p-4 bg-[var(--bg-secondary)]">
        {activeTab === 'call' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Direction</label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as any)}
                  className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
                >
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Result</label>
                <select
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
                >
                  <option value="">Select Result...</option>
                  <option value="No answer">No answer</option>
                  <option value="Left VM">Left VM</option>
                  <option value="Spoke with owner">Spoke with owner</option>
                  <option value="Wrong number">Wrong number</option>
                  <option value="Disconnected">Disconnected</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Duration (mm:ss)</label>
                <input
                  type="text"
                  placeholder="00:00"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Spoke With</label>
                <input
                  type="text"
                  placeholder="e.g., John Doe"
                  value={spokeWith}
                  onChange={(e) => setSpokeWith(e.target.value)}
                  className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Owner Motivation</label>
                <input
                  type="text"
                  placeholder="Describe motivation..."
                  value={ownerMotivation}
                  onChange={(e) => setOwnerMotivation(e.target.value)}
                  className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Offer / Ask</label>
                <input
                  type="text"
                  placeholder="$ amounts or details"
                  value={offerAsk}
                  onChange={(e) => setOfferAsk(e.target.value)}
                  className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Next Step</label>
              <input
                type="text"
                placeholder="What happens next?"
                value={nextStep}
                onChange={(e) => setNextStep(e.target.value)}
                className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Call Notes</label>
              <textarea
                rows={3}
                placeholder="Detailed call notes..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none resize-y"
              />
            </div>
          </div>
        )}

        {activeTab === 'sms' && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/3">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Direction</label>
                <select
                  value={direction}
                  onChange={(e) => setDirection(e.target.value as any)}
                  className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
                >
                  <option value="outbound">Outbound</option>
                  <option value="inbound">Inbound</option>
                </select>
              </div>
              <div className="w-2/3">
                <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Recipient Number</label>
                <input
                  type="text"
                  placeholder="(555) 123-4567"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Message</label>
              <textarea
                rows={3}
                placeholder="Type your message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none resize-y"
              />
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">To</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Subject</label>
              <input
                type="text"
                placeholder="Email Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1 uppercase tracking-wider">Body</label>
              <textarea
                rows={4}
                placeholder="Type your email..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full text-sm p-2 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none resize-y"
              />
            </div>
          </div>
        )}

        {activeTab === 'note' && (
          <div className="space-y-4">
             <div>
              <textarea
                rows={4}
                placeholder="Type a new note..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full text-sm p-3 border border-[var(--border-primary)] rounded bg-[var(--bg-secondary)] focus:border-[var(--accent-blue)] focus:outline-none resize-y"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-primary)]">
          <div className="text-xs text-[var(--text-tertiary)]">
            Activities are automatically timestamped.
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={submitActivity}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-[var(--accent-blue)] hover:bg-[var(--accent-blue-hover)] text-white text-sm font-semibold rounded shadow-sm transition-colors disabled:opacity-50"
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
