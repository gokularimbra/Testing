"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 12, suffix: " Mo", label: "Warranty", icon: "🛡️", desc: "On all repairs" },
  { value: 50, suffix: "k+", label: "Devices Fixed", icon: "🔧", desc: "Since 2008" },
  { value: 99, suffix: "%", label: "Success Rate", icon: "✅", desc: "Repair completion" },
  { value: 30, suffix: " Min", label: "Avg. Repair Time", icon: "⚡", desc: "Most screen fixes" },
  { value: 4.9, suffix: "★", label: "Rating", icon: "⭐", desc: "2,400+ reviews" },
];

const features = [
  {
    icon: "🛡️",
    title: "12 Months Warranty",
    desc: "Every repair comes with a full 12-month warranty. If it fails, we fix it free.",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: "👨‍🔧",
    title: "Qualified Technicians",
    desc: "Our team holds Apple, Samsung, and manufacturer certifications with years of hands-on experience.",
    color: "from-purple-500 to-purple-700",
  },
  {
    icon: "✅",
    title: "No Fix, No Fee",
    desc: "We don't charge a penny unless we successfully fix your device. Complete peace of mind.",
    color: "from-green-500 to-teal-600",
  },
  {
    icon: "⚡",
    title: "Lightning Fast",
    desc: "Most screen repairs completed in under 30 minutes. Walk in and walk out repaired.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: "💰",
    title: "Affordable Pricing",
    desc: "Transparent pricing with no hidden fees. We price-match any local competitor.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: "🔩",
    title: "Genuine Parts",
    desc: "We use only OEM-quality or genuine manufacturer parts for lasting repairs.",
    color: "from-pink-500 to-rose-600",
  },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current * 10) / 10);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {Number.isInteger(value) ? Math.round(count) : count.toFixed(1)}
      {suffix}
    </span>
  );
}

export default function WhyUs() {
  return (
    <section id="why-us" className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute right-0 top-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute left-0 bottom-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/30 mb-4"
          >
            <span className="text-cyan-400 text-sm font-medium">🏆 Why Choose Gadcet</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            The <span className="gradient-text">Smarter</span> Choice
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto"
          >
            We've been the UK's most trusted gadget repair service since 2008.
            Here's why thousands choose us every month.
          </motion.p>
        </div>

        {/* Stats banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="glass rounded-3xl p-8 border border-white/10 mb-16 grid grid-cols-2 md:grid-cols-5 gap-6"
        >
          {stats.map((stat, i) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-3xl md:text-4xl font-bold gradient-text-blue">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm font-semibold text-white mt-1">{stat.label}</div>
              <div className="text-xs text-slate-500">{stat.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="glass rounded-2xl p-6 border border-white/10 group cursor-default"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}
              >
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
