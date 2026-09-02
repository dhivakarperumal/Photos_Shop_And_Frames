import React from 'react'
import { FiArrowRight, FiUpload, FiCheckCircle, FiClock, FiShield, FiImage, FiGift, FiLayers, FiGrid, FiPackage } from 'react-icons/fi'

const features = [
  { icon: FiCheckCircle, title: 'Premium Quality', subtitle: 'High Quality Materials' },
  { icon: FiClock, title: 'Fast Delivery', subtitle: 'On Time Delivery' },
  { icon: FiShield, title: 'Secure Upload', subtitle: 'Your Photos Safe' },
]

const services = [
  { icon: FiImage, title: 'Photo Printing', subtitle: 'High Quality Prints' },
  { icon: FiGrid, title: 'Custom Frames', subtitle: 'Design Your Frame' },
  { icon: FiLayers, title: 'Canvas Printing', subtitle: 'Premium Canvas' },
  { icon: FiPackage, title: 'Photo Albums', subtitle: 'Save Your Memories' },
  { icon: FiGift, title: 'Passport Photos', subtitle: 'Instant & Trusted' },
  { icon: FiGift, title: 'Photo Gifts', subtitle: 'Personalized Gifts' },
  { icon: FiImage, title: 'Lamination', subtitle: 'Long Lasting Finish' },
  { icon: FiGrid, title: 'Wall Decor', subtitle: 'Stylish & Modern' },
]

const Hero = () => {
  return (
    <section className="mt-[130px] bg-[#f7f4ef] px-4 py-6 md:px-6 lg:px-10">
      <div className="mx-auto max-w-[1480px] rounded-[20px] bg-[#f8f5f0] p-4 md:p-8 lg:p-10">
        <div className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr_0.7fr]">
          <div className="space-y-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#b5863d]">
              Premium Quality
            </p>

            <h1 className="text-4xl font-black leading-[0.9] tracking-[-0.06em] text-[#171717] md:text-6xl lg:text-[5rem]">
              Turn Your Memories
              <span className="mt-2 block text-[#d2a14b] italic font-light">Into Something Beautiful</span>
            </h1>

            <p className="max-w-xl text-base leading-8 text-[#4d4d4d] md:text-lg">
              Premium photo printing, custom frames, canvas prints and personalized gifts — all in one place.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <button className="inline-flex items-center justify-center gap-3 rounded-2xl bg-[#111111] px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_10px_20px_rgba(0,0,0,0.15)] transition hover:scale-[1.01]">
                Shop Frames
                <FiArrowRight className="text-lg" />
              </button>

              <button className="inline-flex items-center justify-center gap-3 rounded-2xl border border-[#d2a14b] bg-[#f1e0b0] px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-[#1c1c1c] shadow-[0_10px_20px_rgba(210,161,75,0.18)] transition hover:scale-[1.01]">
                Upload Your Photo
                <FiUpload className="text-lg" />
              </button>
            </div>

            <div className="grid gap-4 pt-2 md:grid-cols-3">
              {features.map(({ icon: Icon, title, subtitle }) => (
                <div key={title} className="flex items-start gap-3">
                  <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#1d1d1d] bg-white text-[#1d1d1d]">
                    <Icon className="text-sm" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-[#1d1d1d]">{title}</div>
                    <div className="text-sm text-[#5b5b5b]">{subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="absolute -left-8 top-16 hidden h-40 w-40 rounded-full bg-[#dcb77e]/15 blur-3xl lg:block" />
            <div className="absolute -right-8 bottom-8 hidden h-32 w-32 rounded-full bg-[#dcb77e]/15 blur-3xl lg:block" />

            <div className="relative">
              <div className="absolute left-1/2 top-2 h-6 w-6 -translate-x-1/2 rounded-full bg-[#dcb77e]/20 blur-xl" />

              <div className="flex h-[18rem] w-[18rem] items-center justify-center bg-[#f3efe8] shadow-[0_30px_40px_rgba(0,0,0,0.15)] md:h-[21rem] md:w-[21rem]">
                <div className="flex h-[13rem] w-[13rem] items-center justify-center rounded-xl bg-gradient-to-br from-[#d0dfe9] via-[#f0ddca] to-[#cddde3] text-5xl shadow-inner md:h-[15rem] md:w-[15rem]">
                  👨‍👩‍👧‍👦
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-[3px] border-[#d2a14b] bg-[#f8f3ea] text-center shadow-[0_12px_24px_rgba(0,0,0,0.08)]">
              <div className="flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#171717]">10%</span>
                <span className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#171717]">Off</span>
                <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#666]">On First Order</span>
                <span className="mt-1 text-[10px] font-semibold text-[#b5863d]">Use code: FIRST10</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 rounded-[18px] bg-[#111111] px-4 py-5 md:px-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-8">
            {services.map(({ icon: Icon, title, subtitle }) => (
              <div key={title} className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-[#d2a14b]/60 bg-[#111111] p-3 text-center text-white shadow-[inset_0_0_0_1px_rgba(210,161,75,0.3)]">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#d2a14b] bg-[#1b1b1b] text-[#d2a14b]">
                  <Icon className="text-xl" />
                </div>
                <div className="text-lg font-bold text-[#f5d39d]">{title}</div>
                <div className="mt-1 text-xs text-[#d2d2d2]">{subtitle}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero