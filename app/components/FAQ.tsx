"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "How long does a repair take?",
    a: "Most screen repairs are completed in 30–60 minutes. Battery replacements take around 20 minutes. More complex repairs like water damage recovery may take 24–48 hours. We'll always give you an accurate estimate before we start.",
  },
  {
    q: "Do I need to book an appointment?",
    a: "No appointment needed! Simply walk into any Gadcet store and our technicians will assess your device on the spot. For complex repairs, you can book ahead online to guarantee a slot.",
  },
  {
    q: "What does your 12-month warranty cover?",
    a: "Our warranty covers all parts and labour used in your repair. If the same issue recurs within 12 months of your repair, we'll fix it completely free of charge. Physical damage, liquid damage, and unrelated issues are not covered.",
  },
  {
    q: "Do you use genuine parts?",
    a: "We use OEM-quality or genuine manufacturer parts for all repairs. For Apple devices, we offer both original Apple parts (for a higher price) and high-quality OEM equivalents. We'll always tell you which parts we're using.",
  },
  {
    q: "What is your 'No Fix, No Fee' policy?",
    a: "If our technicians cannot fix your device, you won't pay anything. This applies to all hardware repairs. Software recoveries may incur a diagnostic fee if unsuccessful — we'll always be upfront about this before we start.",
  },
  {
    q: "Can you recover data from a damaged phone?",
    a: "In many cases, yes. Our data recovery service can retrieve photos, contacts, and files from water-damaged, shattered, or dead devices. Success rates vary depending on the extent of damage. Book a free diagnostic first.",
  },
  {
    q: "Do you repair all brands?",
    a: "Yes! We repair Apple, Samsung, Google Pixel, Huawei, OnePlus, Sony, and virtually any other smartphone brand. We also repair laptops from Apple, Dell, HP, Lenovo, Asus, and more, plus PlayStation, Xbox, and Nintendo consoles.",
  },
  {
    q: "Is there a postal repair service?",
    a: "Yes, we offer a fully insured postal repair service. Send your device to us using our prepaid packaging, and we'll repair and return it within 3–5 working days. Prices include tracked, insured return postage.",
  },
];

function FAQItem({ item, index }: { item: (typeof faqs)[0]; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="border border-white/10 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 hover:bg-white/3 transition-colors"
      >
        <span className="font-medium text-white">{item.q}</span>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.25 }}
          className="text-blue-400 text-xl flex-shrink-0"
        >
          +
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-6 pb-5 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">
              {item.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section id="faq" className="section-padding relative">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-1/2 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto relative">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/30 mb-4"
          >
            <span className="text-blue-400 text-sm font-medium">❓ FAQ</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Got <span className="gradient-text">Questions?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400"
          >
            Everything you need to know about our repair process.
          </motion.p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FAQItem key={faq.q} item={faq} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-slate-400 mb-4">Still have questions?</p>
          <a
            href="tel:+44000000000"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full glass border border-blue-500/30 text-blue-400 hover:text-white hover:border-white/30 transition-colors"
          >
            📞 Call us on 0800 000 0000
          </a>
        </motion.div>
      </div>
    </section>
  );
}
