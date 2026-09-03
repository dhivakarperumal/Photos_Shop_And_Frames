import { Link } from "react-router-dom";
import { ArrowRight, Camera, Heart, Layers3, Sparkles } from "lucide-react";
import PageContainer from "../../CommonComponents/PageContainer";

const values = [
  {
    icon: Heart,
    title: "Made for meaning",
    text: "Every frame starts with a memory worth keeping close, not a template to fill.",
  },
  {
    icon: Layers3,
    title: "Crafted with care",
    text: "We pair considered materials with careful finishing, so the object feels as good as the moment.",
  },
  {
    icon: Camera,
    title: "Your story, centered",
    text: "From one photograph to a wall of them, our work gives your images the room they deserve.",
  },
];

const About = () => (
  <main className="min-h-screen overflow-hidden bg-[#f7f3ed] text-[#1d2925]">
    <section className="relative border-b border-[#e5d8c9] bg-[#1a3c36] text-[#f9f4ec]">
      <PageContainer className="relative py-14 sm:py-20 lg:py-24">
        <div className="grid items-end gap-12 lg:grid-cols-[1fr_0.9fr]">
          <div className="max-w-2xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.28em] text-[#edb66d]">The Q Frame Studio story</p>
            <h1 className="max-w-xl text-5xl font-black leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">Keep the good days in view.</h1>
            <p className="mt-7 max-w-lg text-base leading-7 text-[#d6dfd8] sm:text-lg">We turn photographs into pieces of home. Thoughtful frames, honest materials, and a little more feeling in the everyday.</p>
            <Link to="/shop" className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#edb66d] px-5 py-3 text-xs font-black text-[#1a3c36] transition hover:bg-[#f6cc91]">Explore the collection <ArrowRight className="h-4 w-4" /></Link>
          </div>
          <div className="relative mx-auto w-full max-w-md lg:mr-0">
            <div className="absolute -left-5 -top-5 h-24 w-24 border-l border-t border-[#edb66d]/70" />
            <div className="aspect-[4/5] overflow-hidden border-[12px] border-[#d79d4a] bg-[#f2e8d8] shadow-[18px_18px_0_#102c28]">
              <img src="https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85" alt="Camera and photographs in a creative studio" className="h-full w-full object-cover" />
            </div>
            <p className="absolute -bottom-7 -right-2 max-w-[180px] bg-[#f7f3ed] px-4 py-3 text-xs font-bold leading-5 text-[#1a3c36] shadow-lg">Small moments. Beautifully held.</p>
          </div>
        </div>
      </PageContainer>
    </section>

    <PageContainer>
      <section className="grid gap-10 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:py-24">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">Why we do it</p>
          <h2 className="mt-3 max-w-sm text-3xl font-black leading-tight sm:text-4xl">A frame is more than a border.</h2>
        </div>
        <div className="max-w-2xl text-base leading-8 text-[#59635e]">
          <p>Q Frame Studio was created for the photographs that live on your phone but belong in your life. We make custom photo frames and prints that feel personal, lasting, and easy to give.</p>
          <p className="mt-5">Our process stays close to the details: the crop, the proportion, the finish, the little choice that makes a piece feel unmistakably yours.</p>
        </div>
      </section>

      <section className="border-y border-[#e5d8c9] py-12 lg:py-16">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">Our north stars</p><h2 className="mt-2 text-3xl font-black">What guides the work</h2></div>
          <Sparkles className="hidden h-8 w-8 text-[#d79d4a] sm:block" />
        </div>
        <div className="grid gap-px overflow-hidden border border-[#e5d8c9] bg-[#e5d8c9] md:grid-cols-3">
          {values.map(({ icon: Icon, title, text }, index) => <article key={title} className="bg-[#fbf8f3] p-7 sm:p-9"><div className="mb-12 flex items-center justify-between"><Icon className="h-6 w-6 text-[#b07838]" /><span className="font-mono text-xs text-[#9b8b78]">0{index + 1}</span></div><h3 className="text-lg font-black">{title}</h3><p className="mt-3 text-sm leading-6 text-[#69736e]">{text}</p></article>)}
        </div>
      </section>

      <section className="flex flex-col items-start justify-between gap-6 py-16 sm:flex-row sm:items-center lg:py-20">
        <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#b07838]">Start with a memory</p><h2 className="mt-2 text-3xl font-black">Bring something beautiful home.</h2></div>
        <Link to="/shop" className="inline-flex items-center gap-2 rounded-full border border-[#1a3c36] px-5 py-3 text-xs font-black text-[#1a3c36] transition hover:bg-[#1a3c36] hover:text-white">Shop frames <ArrowRight className="h-4 w-4" /></Link>
      </section>
    </PageContainer>
  </main>
);

export default About;
