"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const services = [
  {
    icon: "📱",
    title: "Mobile Phones",
    description: "Screen replacements, battery repairs, charging ports, water damage recovery, and more.",
    features: ["Screen Repair", "Battery Replacement", "Charging Port Fix", "Water Damage"],
    color: "from-blue-600 to-cyan-500",
    glow: "rgba(37,99,235,0.3)",
    price: "From £29",
  },
  {
    icon: "💻",
    title: "Laptops",
    description: "Full hardware repairs including screen replacements, keyboard fixes, and data recovery.",
    features: ["Screen Replacement", "Keyboard Repair", "RAM Upgrade", "Data Recovery"],
    color: "from-purple-600 to-pink-500",
    glow: "rgba(124,58,237,0.3)",
    price: "From £49",
  },
  {
    icon: "📟",
    title: "Tablets",
    description: "iPad and Android tablet repairs with genuine parts and expert technicians.",
    features: ["Screen Fix", "Battery Swap", "Charging Repair", "Software Issues"],
    color: "from-cyan-500 to-teal-400",
    glow: "rgba(6,182,212,0.3)",
    price: "From £39",
  },
  {
    icon: "🎮",
    title: "Gaming Consoles",
    description: "PlayStation, Xbox, Nintendo Switch repairs — HDMI ports, disc drives, and more.",
    features: ["HDMI Port Repair", "Disc Drive Fix", "Controller Repair", "Overheating Fix"],
    color: "from-orange-500 to-red-500",
    glow: "rgba(249,115,22,0.3)",
    price: "From £45",
  },
];

function ServiceCard({
  service,
  index,
}: {
  service: (typeof services)[0];
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
    const y = (e.clientY - rect.top - rect.height / 2) / rect.height;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        setMousePos({ x: 0, y: 0 });
      }}
      onMouseMove={handleMouseMove}
      style={{
        transform: hovered
          ? `perspective(1000px) rotateX(${-mousePos.y * 12}deg) rotateY(${mousePos.x * 12}deg) translateZ(10px)`
          : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
        transition: hovered ? "transform 0.1s ease" : "transform 0.4s ease",
        boxShadow: hovered ? `0 30px 60px ${service.glow}` : "none",
      }}
      className="glass rounded-3xl p-8 border border-white/10 cursor-default group relative overflow-hidden"
    >
      {/* Background gradient on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`}
      />

      {/* Icon */}
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center text-2xl mb-6 shadow-lg`}
      >
        {service.icon}
      </div>

      {/* Content */}
      <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-6">{service.description}</p>

      {/* Features */}
      <ul className="space-y-2 mb-6">
        {service.features.map((feat) => (
          <li key={feat} className="flex items-center gap-2 text-sm text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.color}`} />
            {feat}
          </li>
        ))}
      </ul>

      {/* Price + CTA */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <span className={`font-bold text-transparent bg-clip-text bg-gradient-to-r ${service.color}`}>
          {service.price}
        </span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-4 py-2 rounded-full bg-gradient-to-r ${service.color} text-white text-sm font-medium shadow-md`}
        >
          Book Now →
        </motion.button>
      </div>

      {/* Shine effect */}
      {hovered && (
        <div
          className="absolute inset-0 pointer-events-none rounded-3xl"
          style={{
            background: `radial-gradient(circle at ${50 + mousePos.x * 100}% ${50 + mousePos.y * 100}%, rgba(255,255,255,0.06) 0%, transparent 60%)`,
          }}
        />
      )}
    </motion.div>
  );
}

export default function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="section-padding relative">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-32 bg-gradient-to-b from-blue-500/50 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-purple-500/30 mb-4"
          >
            <span className="text-purple-400 text-sm font-medium">🔧 Our Services</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            We Fix <span className="gradient-text">Everything</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-xl mx-auto text-lg"
          >
            From cracked screens to water damage — our expert technicians handle all devices
            with genuine parts and industry-leading warranties.
          </motion.p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.title} service={service} index={i} />
          ))}
        </div>

        {/* Divider */}
        <div className="mt-20 divider-glow" />
      </div>
    </section>
  );
}
