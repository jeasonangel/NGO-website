import { useState } from 'react';
import { Mail, MapPin, Phone, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div>
      <section className="bg-white border-b border-ink-primary/10">
        <div className="container-page py-14">
          <p className="eyebrow mb-2">Contact</p>
          <h1 className="text-3xl md:text-4xl font-bold text-ink-primary max-w-2xl">
            Get in touch with the team.
          </h1>
          <p className="mt-4 text-ink-secondary max-w-2xl leading-relaxed">
            Questions about our programs, partnership inquiries, or interested in
            the census data we use? Reach out below.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container-page grid md:grid-cols-5 gap-8">
          <div className="md:col-span-2 space-y-4">
            <div className="card flex items-start gap-3">
              <MapPin className="w-5 h-5 text-ngo-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink-primary">Office</p>
                <p className="text-sm text-ink-secondary">Rue 1.234, Bastos, Yaoundé, Cameroon</p>
              </div>
            </div>
            <div className="card flex items-start gap-3">
              <Phone className="w-5 h-5 text-ngo-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink-primary">Phone</p>
                <p className="text-sm text-ink-secondary">+237 6xx xxx xxx</p>
              </div>
            </div>
            <div className="card flex items-start gap-3">
              <Mail className="w-5 h-5 text-ngo-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-ink-primary">Email</p>
                <p className="text-sm text-ink-secondary">contact@espoirsante.cm</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-3">
            <div className="card">
              {sent ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="w-10 h-10 text-ngo-primary mx-auto mb-3" />
                  <p className="font-semibold text-ink-primary">Message received</p>
                  <p className="text-sm text-ink-secondary mt-1">
                    Thanks for reaching out — our team will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Name</label>
                      <input required className="input" type="text" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="label">Email</label>
                      <input required className="input" type="email" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="label">Subject</label>
                    <input required className="input" type="text" placeholder="How can we help?" />
                  </div>
                  <div>
                    <label className="label">Message</label>
                    <textarea required className="input" rows={5} placeholder="Tell us more..." />
                  </div>
                  <button type="submit" className="btn-primary">
                    Send Message <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
