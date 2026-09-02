import React from 'react'
import {
  FiMapPin,
  FiPhone,
  FiClock,
  FiFacebook,
  FiInstagram,
  FiMail,
} from 'react-icons/fi'
import PageContainer from './PageContainer'

const Footer = () => {
  const quickLinks = ['Home', 'Shop', 'Photo Printing', 'Frames', 'Custom Frame', 'Gallery', 'Contact Us']
  const customerService = ['My Account', 'My Orders', 'Track Order', 'Shipping & Delivery', 'Returns & Refunds', 'FAQ']
  const policies = ['Privacy Policy', 'Terms & Conditions', 'Refund Policy', 'Shipping Policy', 'Cancellation Policy']

  return (
    <footer className="bg-[#2a2d31] text-white">
      <PageContainer>
        <div className="grid gap-8 py-8 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr]">
          <div className="pr-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#d79d4a] bg-[#3b3a38] text-lg font-black text-[#f5d39d]">
                P
              </div>
              <div className="leading-none">
                <div className="text-[28px] font-black tracking-[-0.06em] text-[#f6f0e8]">PixelFrame</div>
                <div className="mt-1 text-[8px] font-semibold tracking-[0.28em] text-[#dcb77e]">PHOTO STUDIO &amp; FRAME SHOP</div>
              </div>
            </div>

            <p className="max-w-xs text-sm leading-6 text-[#d7d7d7]">
              We help you preserve your memories with handcrafted photo frames and custom photo prints.
            </p>

            <div className="mt-5 flex items-center gap-3">
              {[FiFacebook, FiInstagram, FiMail].map((Icon, index) => (
                <button
                  key={index}
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ffffff1a] bg-white/5 text-sm transition hover:border-[#d79d4a] hover:text-[#f5d39d]"
                  aria-label="Social link"
                >
                  <Icon />
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.12em] text-[#f5d39d]">Quick Links</h3>
            <ul className="space-y-2 text-sm text-[#e5e5e5]">
              {quickLinks.map((link) => (
                <li key={link} className="hover:text-[#f5d39d] transition-colors">{link}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.12em] text-[#f5d39d]">Customer Service</h3>
            <ul className="space-y-2 text-sm text-[#e5e5e5]">
              {customerService.map((link) => (
                <li key={link} className="hover:text-[#f5d39d] transition-colors">{link}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.12em] text-[#f5d39d]">Policies</h3>
            <ul className="space-y-2 text-sm text-[#e5e5e5]">
              {policies.map((link) => (
                <li key={link} className="hover:text-[#f5d39d] transition-colors">{link}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.12em] text-[#f5d39d]">Contact Us</h3>
            <div className="space-y-3 text-sm text-[#e5e5e5]">
              <div className="flex items-start gap-2">
                <FiMapPin className="mt-1 text-[#f5d39d]" />
                <span>123, MG Road,<br />Coimbatore, Tamil Nadu</span>
              </div>

              <div className="flex items-center gap-2">
                <FiPhone className="text-[#f5d39d]" />
                <span>+91 98765 43210</span>
              </div>

              <div className="flex items-center gap-2">
                <FiMail className="text-[#f5d39d]" />
                <span>info@pixelframe.com</span>
              </div>

              <div className="flex items-center gap-2">
                <FiClock className="text-[#f5d39d]" />
                <span>Mon - Sun: 9:00 AM - 9:00 PM</span>
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <span className="rounded-md bg-[#f5d39d] px-3 py-1 text-xs font-bold text-[#1a1a1a]">VISA</span>
              <span className="rounded-md bg-[#f5d39d] px-3 py-1 text-xs font-bold text-[#1a1a1a]">RuPay</span>
              <span className="rounded-md bg-[#f5d39d] px-3 py-1 text-xs font-bold text-[#1a1a1a]">UPI</span>
            </div>
          </div>
        </div>
      </PageContainer>
    </footer>
  )
}

export default Footer