import React, { useState } from 'react';
import { Send, CheckCircle2, AlertCircle, Loader2, RotateCcw, ArrowUpRight } from 'lucide-react';

interface ContactSectionProps {
  onReplay?: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onReplay }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });

  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validate = () => {
    const nextErrors: { name?: string; email?: string; message?: string } = {};

    if (!formData.name.trim()) {
      nextErrors.name = 'Full Name is required';
    } else if (formData.name.trim().length < 2) {
      nextErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      nextErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      nextErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 5) {
      nextErrors.message = 'Message must be at least 5 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name as keyof typeof touched]) {
      setErrors((prev) => {
        const next = { ...prev };
        if (name === 'name') {
          if (!value.trim()) next.name = 'Full Name is required';
          else if (value.trim().length < 2) next.name = 'Name must be at least 2 characters';
          else delete next.name;
        } else if (name === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!value.trim()) next.email = 'Email is required';
          else if (!emailRegex.test(value.trim())) next.email = 'Please enter a valid email address';
          else delete next.email;
        } else if (name === 'message') {
          if (!value.trim()) next.message = 'Message is required';
          else if (value.trim().length < 5) next.message = 'Message must be at least 5 characters';
          else delete next.message;
        }
        return next;
      });
    }
  };

  const handleBlur = (field: 'name' | 'email' | 'message') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });

    if (!validate()) {
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message. Please try again.');
      }

      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      setTouched({ name: false, email: false, message: false });
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Network error occurred. Please try again.');
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="w-full flex flex-col items-center gap-12 sm:gap-16 pt-4 pb-8 pointer-events-auto select-auto">
      {/* ========================================================================= */}
      {/* 1. COLLABORATE WITH US SECTION */}
      {/* ========================================================================= */}
      <section
        id="collaborate"
        className="w-full max-w-[700px] mx-auto text-center"
      >
        <div className="rounded-2xl sm:rounded-3xl bg-neutral-950/90 border border-white/15 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
          {/* Header */}
          <div className="space-y-3 mb-8">
            <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-light tracking-tight text-white uppercase">
              COLLABORATE WITH US
            </h2>
            <p className="font-body text-sm sm:text-base text-neutral-400 font-light max-w-lg mx-auto leading-relaxed">
              Interested in collaborating with The House of Future? Send us a message.
            </p>
          </div>

          {/* Form Content / Success State */}
          {status === 'success' ? (
            <div className="py-8 px-4 text-center space-y-6 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="font-heading text-xl font-light text-white">Message Sent</h3>
                <p className="font-body text-sm text-neutral-300 font-light max-w-md mx-auto leading-relaxed">
                  Thank you for reaching out. We have received your message and will be in touch shortly.
                </p>
              </div>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-white/30 hover:border-white text-xs font-mono tracking-wider text-white hover:bg-white hover:text-black transition-all duration-200 cursor-pointer"
              >
                <span>SEND ANOTHER MESSAGE</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 text-left">
              {/* Error Banner */}
              {status === 'error' && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-500/40 text-red-200 text-xs font-mono flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-300">Unable to send message</div>
                    <div className="text-[11px]">{errorMessage}</div>
                  </div>
                </div>
              )}

              {/* 1. Full Name Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-fullname"
                  className="font-mono text-xs uppercase tracking-wider text-neutral-300 font-medium"
                >
                  Full Name <span className="text-white">*</span>
                </label>
                <input
                  id="contact-fullname"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur('name')}
                  placeholder="Your full name"
                  disabled={status === 'submitting'}
                  className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white/[0.04] text-base sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all duration-200 ${
                    touched.name && errors.name
                      ? 'border border-red-500 focus:border-red-400'
                      : 'border border-white/15 hover:border-white/30 focus:border-white focus:bg-white/[0.07]'
                  }`}
                />
                {touched.name && errors.name && (
                  <span className="text-xs font-mono text-red-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {errors.name}
                  </span>
                )}
              </div>

              {/* 2. Email Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-email"
                  className="font-mono text-xs uppercase tracking-wider text-neutral-300 font-medium"
                >
                  Email <span className="text-white">*</span>
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur('email')}
                  placeholder="Your email address"
                  disabled={status === 'submitting'}
                  className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white/[0.04] text-base sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all duration-200 ${
                    touched.email && errors.email
                      ? 'border border-red-500 focus:border-red-400'
                      : 'border border-white/15 hover:border-white/30 focus:border-white focus:bg-white/[0.07]'
                  }`}
                />
                {touched.email && errors.email && (
                  <span className="text-xs font-mono text-red-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {errors.email}
                  </span>
                )}
              </div>

              {/* 3. Message Textarea */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="contact-message"
                  className="font-mono text-xs uppercase tracking-wider text-neutral-300 font-medium"
                >
                  Message <span className="text-white">*</span>
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={() => handleBlur('message')}
                  placeholder="How can we collaborate?"
                  disabled={status === 'submitting'}
                  className={`w-full px-4 py-3 sm:py-3.5 rounded-xl bg-white/[0.04] text-base sm:text-sm text-white placeholder-neutral-500 focus:outline-none transition-all duration-200 resize-none ${
                    touched.message && errors.message
                      ? 'border border-red-500 focus:border-red-400'
                      : 'border border-white/15 hover:border-white/30 focus:border-white focus:bg-white/[0.07]'
                  }`}
                />
                {touched.message && errors.message && (
                  <span className="text-xs font-mono text-red-400 flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                    {errors.message}
                  </span>
                )}
              </div>

              {/* 4. Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="w-full py-4 px-6 rounded-xl bg-white text-black font-mono text-xs uppercase tracking-widest font-semibold hover:bg-neutral-200 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {status === 'submitting' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-black" />
                      <span>SENDING MESSAGE...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. CONNECT SECTION */}
      {/* ========================================================================= */}
      <section
        id="connect"
        className="w-full max-w-[700px] mx-auto text-center space-y-6"
      >
        <div className="space-y-2">
          <h3 className="font-heading text-xl sm:text-2xl lg:text-3xl font-light tracking-tight text-white uppercase">
            CONNECT
          </h3>
          <p className="font-body text-xs sm:text-sm text-neutral-400 font-light">
            Follow our transmissions across social channels.
          </p>
        </div>

        {/* Social Links Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left">
          {/* Instagram Button */}
          <a
            href="https://www.instagram.com/thehouseoffuture.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 rounded-2xl bg-neutral-950/80 hover:bg-neutral-900 border border-white/15 hover:border-white/40 transition-all duration-300 backdrop-blur-xl shadow-lg flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-white group-hover:bg-white group-hover:text-black transition-all duration-300 group-hover:scale-105">
                <svg
                  className="w-4 h-4 fill-current transition-transform duration-300"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </div>
              <div className="space-y-0.5">
                <div className="font-heading text-base font-normal text-white group-hover:text-white">
                  Instagram
                </div>
                <div className="font-mono text-[11px] text-neutral-400">@thehouseoffuture.ai</div>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>

          {/* LinkedIn Button (Inactive placeholder) */}
          <div
            className="p-5 rounded-2xl bg-neutral-950/50 border border-white/10 backdrop-blur-xl shadow-lg flex items-center justify-between select-none opacity-80"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-neutral-400">
                <svg
                  className="w-4 h-4 fill-current"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </div>
              <div className="space-y-0.5 text-left">
                <div className="font-heading text-base font-normal text-neutral-300">
                  LinkedIn
                </div>
                <div className="font-mono text-[11px] text-neutral-500">Coming Soon</div>
              </div>
            </div>
            <span className="font-mono text-[10px] uppercase tracking-wider text-neutral-500 border border-white/10 px-2 py-0.5 rounded">
              Soon
            </span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. FOOTER */}
      {/* ========================================================================= */}
      <footer className="w-full max-w-[700px] mx-auto flex flex-col items-center gap-6 pt-8 border-t border-white/10">
        {onReplay && (
          <button
            onClick={onReplay}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs tracking-wider uppercase font-semibold hover:bg-neutral-200 transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>REPLAY THE JOURNEY</span>
          </button>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-3 text-neutral-400 font-mono text-[11px] tracking-wider text-center sm:text-left">
          <div>THE HOUSE OF FUTURE &bull; AN AI ECOSYSTEM</div>
          <div className="flex items-center gap-3 text-neutral-500">
            <span>&copy; {new Date().getFullYear()}</span>
            <span>&bull;</span>
            <span>ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
