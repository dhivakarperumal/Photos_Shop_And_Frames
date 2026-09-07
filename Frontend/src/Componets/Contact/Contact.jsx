import { useState } from "react";
import { Check, Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import PageContainer from "../../CommonComponents/PageContainer";
import PageHeader from "../../CommonComponents/PageHeader";

const infoCards = [
  {
    icon: MapPin,
    title: "Visit the studio",
    value: "123, MG Road\nCoimbatore, Tamil Nadu",
  },
  {
    icon: Phone,
    title: "Call us",
    value: "+91 98765 43210",
  },
  {
    icon: Mail,
    title: "Write to us",
    value: "info@pixelframe.com",
  },
  {
    icon: Clock3,
    title: "Studio hours",
    value: "Every day, 9:00 AM - 9:00 PM",
  },
];

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const update = (event) =>
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed] text-[#1d2925]">
      <PageHeader title="Contact Us" />

      <PageContainer className="py-12 sm:py-16 lg:py-20">
        <header className="grid gap-8 border-b border-[#e5d8c9] pb-12 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:pb-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#b07838]">
              Let’s make room for it
            </p>
            <h1 className="mt-4 max-w-2xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">
              Tell us what you’re imagining.
            </h1>
          </div>

          <p className="max-w-md text-base leading-7 text-[#69736e]">
            A custom frame, a gift, a question about your order, or simply a photograph
            you want to do justice to. We’re here.
          </p>
        </header>

        <div className="grid gap-8 py-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-10 lg:py-16">
          <aside className="space-y-8">
            <div className="overflow-hidden rounded-[28px] border border-[#e8dccb] bg-white p-3 shadow-[0_20px_60px_rgba(26,60,54,0.08)]">
              <div className="overflow-hidden rounded-[22px]">
                <img
                  src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85"
                  alt="Bright photo studio workspace"
                  className="h-[260px] w-full object-cover sm:h-[300px]"
                />
              </div>

              <div className="mt-6 space-y-4">
                {infoCards.map(({ icon: Icon, title, value }) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-2xl border border-[#f0e5d7] bg-[#faf7f3] p-4"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f3e0c7] text-[#1a3c36]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[#1d2925]">{title}</p>
                      <p className="mt-1 whitespace-pre-line text-sm leading-6 text-[#69736e]">
                        {value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-8">
            <div className="rounded-[30px] border border-[#eae1d5] bg-white p-6 shadow-[0_22px_55px_rgba(24,42,36,0.08)] sm:p-8 lg:p-10">
              {sent ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f2e9] text-[#1a3c36]">
                    <Check className="h-8 w-8" />
                  </div>
                  <h2 className="mt-6 text-3xl font-black text-[#1d2925]">Message received.</h2>
                  <p className="mt-3 max-w-sm text-sm leading-6 text-[#69736e]">
                    Thanks for reaching out, {form.name || "there"}. Our team will get back
                    to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSent(false);
                      setForm({ name: "", email: "", message: "" });
                    }}
                    className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-[#b07838] underline underline-offset-4"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={submit} className="space-y-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b07838]">
                      Contact form
                    </p>
                    <h2 className="mt-3 text-3xl font-black text-[#1d2925]">
                      Start a conversation.
                    </h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#42514d]">
                      Your name
                      <input
                        required
                        name="name"
                        value={form.name}
                        onChange={update}
                        className="mt-2 h-12 w-full rounded-xl border border-[#e0d4c1] bg-[#faf6f1] px-4 text-sm text-[#1d2925] outline-none transition focus:border-[#1a3c36] focus:bg-white"
                        placeholder="What should we call you?"
                      />
                    </label>

                    <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#42514d]">
                      Email address
                      <input
                        required
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={update}
                        className="mt-2 h-12 w-full rounded-xl border border-[#e0d4c1] bg-[#faf6f1] px-4 text-sm text-[#1d2925] outline-none transition focus:border-[#1a3c36] focus:bg-white"
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>

                  <label className="block text-xs font-bold uppercase tracking-[0.14em] text-[#42514d]">
                    How can we help?
                    <textarea
                      required
                      name="message"
                      value={form.message}
                      onChange={update}
                      rows="6"
                      className="mt-2 w-full resize-none rounded-2xl border border-[#e0d4c1] bg-[#faf6f1] px-4 py-3 text-sm text-[#1d2925] outline-none transition focus:border-[#1a3c36] focus:bg-white"
                      placeholder="Tell us a little about your idea..."
                    />
                  </label>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-full bg-[#1a3c36] px-6 py-3.5 text-xs font-black uppercase tracking-[0.18em] text-white shadow-[0_12px_24px_rgba(26,60,54,0.25)] transition hover:-translate-y-0.5 hover:bg-[#264a45]"
                  >
                    <Send className="h-4 w-4" />
                    Send message
                  </button>
                </form>
              )}
            </div>

            <div className="overflow-hidden rounded-[30px] border border-[#e5d8c9] bg-[#1a3c36] p-3 shadow-[0_22px_55px_rgba(26,60,54,0.18)]">
              <div className="overflow-hidden rounded-[24px] border border-white/10">
                <iframe
                  title="Studio location map"
                  src="https://www.google.com/maps?q=MG%20Road%20Coimbatore%20Tamil%20Nadu&z=14&output=embed"
                  className="h-[280px] w-full border-0 grayscale contrast-125"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="mt-4 flex flex-col gap-3 px-2 pb-2 text-white sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d9c3a3]">
                    Find us
                  </p>
                  <h3 className="mt-2 text-xl font-black">Q Frame Studio</h3>
                </div>

                <a
                  href="https://maps.google.com/?q=MG+Road+Coimbatore+Tamil+Nadu"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:bg-white/10"
                >
                  Get directions
                </a>
              </div>
            </div>
          </section>
        </div>
      </PageContainer>
    </main>
  );
};

export default Contact;
