import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import PageContainer from "../../CommonComponents/PageContainer";
import PageHeader from "../../CommonComponents/PageHeader";

const sections = [
  {
    title: "Information we collect",
    content: [
      "When you browse, create an account, place an order, or contact us, we may collect information such as your name, email address, phone number, delivery address, order details, and the photographs or personalization details you choose to upload.",
      "We also receive limited technical information, such as device and browser details, to help us keep the website secure and improve the shopping experience.",
    ],
  },
  {
    title: "How we use your information",
    content: [
      "We use your information to process and deliver orders, create personalized products, provide customer support, manage your account, and communicate important updates about your purchases.",
      "We may also use aggregated, non-identifying information to understand product usage and improve our services. We do not use your personal photographs for marketing without your permission.",
    ],
  },
  {
    title: "Payments and service providers",
    content: [
      "Payments are handled through the payment method or provider selected during checkout. We do not store complete payment card details on our servers.",
      "We may share only the information needed with trusted providers that help us host the website, process payments, deliver orders, send communications, or support our operations. These providers are expected to protect your information and use it only for the service they provide.",
    ],
  },
  {
    title: "Photos and personalized content",
    content: [
      "Photos, names, messages, and other content you provide are used to fulfill your requested product or service. We keep this content only for as long as reasonably necessary to complete the order, handle support, and meet legal or operational requirements.",
      "Please upload only content that you have permission to use and that does not infringe another person's privacy or rights.",
    ],
  },
  {
    title: "Cookies and choices",
    content: [
      "We may use essential cookies or similar technologies to keep the website working, remember preferences, maintain sessions, and understand basic website performance. Your browser settings may allow you to control some cookies, although disabling them can affect functionality.",
      "You may contact us to request access to, correction of, or deletion of personal information associated with your account, subject to applicable legal and operational requirements.",
    ],
  },
  {
    title: "Security and updates",
    content: [
      "We take reasonable administrative and technical steps to protect the information we handle. No online service can guarantee absolute security, so please use a strong password and contact us promptly if you believe your account has been accessed without permission.",
      "We may update this policy when our services or legal obligations change. The updated version will be posted on this page with a revised effective date.",
    ],
  },
];

const PrivacyPolicy = () => (
  <main className="min-h-screen bg-[#f7f3ed] text-[#1d2925]">
    <PageHeader title="Privacy Policy" />

    <PageContainer className="py-12 sm:py-16 lg:py-20">

      <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-12">
        <aside className="h-fit space-y-3 lg:sticky lg:top-36">
          <div className="rounded-[28px] bg-[#1a3c36] p-7 text-[#f9f4ec] shadow-[0_20px_55px_rgba(26,60,54,0.16)]">
            <ShieldCheck className="h-8 w-8 text-[#edb66d]" />
            <h2 className="mt-8 text-2xl font-black">Privacy, without the fine print fog.</h2>
            <p className="mt-3 text-sm leading-6 text-[#d6dfd8]">We collect what helps us make, personalize, deliver, and support your order.</p>
          </div>
          <div className="rounded-2xl border border-[#e5d8c9] bg-white p-5 text-sm text-[#69736e]">
            <div className="flex items-center gap-3 text-[#1d2925]"><LockKeyhole className="h-5 w-5 text-[#b07838]" /><span className="font-black">Effective date</span></div>
            <p className="mt-2">September 7, 2026</p>
          </div>
        </aside>

        <section className="space-y-4">
          {sections.map(({ title, content }, index) => (
            <article key={title} className="border-b border-[#e5d8c9] bg-[#fbf8f3] px-6 py-7 sm:px-8">
              <div className="flex gap-4">
                <span className="font-mono text-xs text-[#b07838]">0{index + 1}</span>
                <div>
                  <h2 className="text-xl font-black sm:text-2xl">{title}</h2>
                  <div className="mt-3 space-y-3 text-sm leading-7 text-[#69736e]">{content.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
                </div>
              </div>
            </article>
          ))}

          <div className="rounded-[26px] border border-[#e5d8c9] bg-white p-6 sm:p-8">
            <div className="flex items-start gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#f3e0c7] text-[#1a3c36]"><Mail className="h-5 w-5" /></div><div><h2 className="text-xl font-black">Questions about privacy?</h2><p className="mt-2 text-sm leading-6 text-[#69736e]">Contact our team at <a href="mailto:info@pixelframe.com" className="font-bold text-[#b07838] underline underline-offset-4">info@pixelframe.com</a> and we will help with your request.</p></div></div>
          </div>
        </section>
      </div>
    </PageContainer>
  </main>
);

export default PrivacyPolicy;
