import { useState } from "react";
import { Check, Clock3, Mail, MapPin, Phone, Send } from "lucide-react";
import PageContainer from "../../CommonComponents/PageContainer";

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const submit = (event) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="min-h-screen bg-[#f7f3ed] text-[#1d2925]">
      <PageContainer className="py-12 sm:py-16 lg:py-20">
        <header className="grid gap-8 border-b border-[#e5d8c9] pb-12 lg:grid-cols-[1fr_0.8fr] lg:items-end lg:pb-16">
          <div><p className="text-xs font-bold uppercase tracking-[0.28em] text-[#b07838]">Let’s make room for it</p><h1 className="mt-4 max-w-2xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl">Tell us what you’re imagining.</h1></div>
          <p className="max-w-md text-base leading-7 text-[#69736e]">A custom frame, a gift, a question about your order, or simply a photograph you want to do justice to. We’re here.</p>
        </header>

        <div className="grid gap-12 py-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:py-16">
          <aside>
            <div className="mb-10 aspect-[4/3] overflow-hidden bg-[#1a3c36]"><img src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85" alt="Bright photo studio workspace" className="h-full w-full object-cover opacity-90" /></div>
            <div className="space-y-6">
              <div className="flex gap-4"><MapPin className="mt-1 h-5 w-5 shrink-0 text-[#b07838]" /><div><p className="text-sm font-black">Visit the studio</p><p className="mt-1 text-sm leading-6 text-[#69736e]">123, MG Road<br />Coimbatore, Tamil Nadu</p></div></div>
              <div className="flex gap-4"><Phone className="mt-1 h-5 w-5 shrink-0 text-[#b07838]" /><div><p className="text-sm font-black">Call us</p><p className="mt-1 text-sm text-[#69736e]">+91 98765 43210</p></div></div>
              <div className="flex gap-4"><Mail className="mt-1 h-5 w-5 shrink-0 text-[#b07838]" /><div><p className="text-sm font-black">Write to us</p><p className="mt-1 text-sm text-[#69736e]">info@pixelframe.com</p></div></div>
              <div className="flex gap-4"><Clock3 className="mt-1 h-5 w-5 shrink-0 text-[#b07838]" /><div><p className="text-sm font-black">Studio hours</p><p className="mt-1 text-sm text-[#69736e]">Every day, 9:00 AM - 9:00 PM</p></div></div>
            </div>
          </aside>

          <section className="border-t-4 border-[#1a3c36] bg-white p-6 shadow-[12px_12px_0_#e8d7c2] sm:p-10">
            {sent ? <div className="flex min-h-[420px] flex-col items-center justify-center text-center"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e7f2e9] text-[#1a3c36]"><Check className="h-8 w-8" /></div><h2 className="mt-6 text-3xl font-black">Message received.</h2><p className="mt-3 max-w-sm text-sm leading-6 text-[#69736e]">Thanks for reaching out, {form.name || "there"}. Our team will get back to you shortly.</p><button type="button" onClick={() => { setSent(false); setForm({ name: "", email: "", message: "" }); }} className="mt-8 text-xs font-black uppercase tracking-[0.16em] text-[#b07838] underline underline-offset-4">Send another message</button></div> : <form onSubmit={submit} className="space-y-6"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b07838]">Contact form</p><h2 className="mt-2 text-3xl font-black">Start a conversation.</h2></div><label className="block text-xs font-bold">Your name<input required name="name" value={form.name} onChange={update} className="mt-2 h-12 w-full border-b border-[#cfc4b6] bg-transparent px-1 text-sm outline-none transition focus:border-[#1a3c36]" placeholder="What should we call you?" /></label><label className="block text-xs font-bold">Email address<input required type="email" name="email" value={form.email} onChange={update} className="mt-2 h-12 w-full border-b border-[#cfc4b6] bg-transparent px-1 text-sm outline-none transition focus:border-[#1a3c36]" placeholder="you@example.com" /></label><label className="block text-xs font-bold">How can we help?<textarea required name="message" value={form.message} onChange={update} rows="5" className="mt-2 w-full resize-none border-b border-[#cfc4b6] bg-transparent px-1 py-3 text-sm outline-none transition focus:border-[#1a3c36]" placeholder="Tell us a little about your idea..." /></label><button type="submit" className="inline-flex items-center gap-2 rounded-full bg-[#1a3c36] px-6 py-3 text-xs font-black text-white transition hover:bg-[#28564d]">Send message <Send className="h-4 w-4" /></button></form>}
          </section>
        </div>
      </PageContainer>
    </main>
  );
};

export default Contact;
