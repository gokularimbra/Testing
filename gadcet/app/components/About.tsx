"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const milestones = [
  {
    year: "2008",
    title: "Founded in London",
    desc: "Gadcet was born in a small East London workshop by two passionate engineers.",
  },
  {
    year: "2012",
    title: "First 10,000 Repairs",
    desc: "Word-of-mouth growth saw us hit our first major milestone with expanding services.",
  },
  {
    year: "2016",
    title: "5 Stores Across the UK",
    desc: "Expanded to Manchester, Birmingham, Edinburgh, and Cardiff with dedicated teams.",
  },
  {
    year: "2019",
    title: "Launched 12-Month Warranty",
    desc: "Industry first — we backed every repair with a full 12-month parts and labour guarantee.",
  },
  {
    year: "2022",
    title: "Samsung & Apple Certified",
    desc: "Achieved official certification from both Samsung and Apple as authorised repair partners.",
  },
  {
    year: "2024",
    title: "50,000+ Repairs Done",
    desc: "Surpassed 50,000 total repairs with a 4.9-star average across all platforms.",
  },
];

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const y1 = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);
  const y2 = useTransform(scrollYProgress, [0, 1], ["0%", "15%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <section ref={sectionRef} id="about" className="section-padding relative overflow-hidden">
      {/* Parallax blobs */}
      <motion.div
        style={{ y: y1 }}
        className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-3xl pointer-events-none"
      />
      <motion.div
        style={{ y: y2 }}
        className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-3xl pointer-events-none"
      />

      {/* Floating tech elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {["⚡", "🔧", "💻", "📱", "🛡️", "⭐"].map((emoji, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl opacity-5 select-none"
            style={{
              left: `${10 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            {emoji}
          </motion.span>
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-green-500/30 mb-4"
          >
            <span className="text-green-400 text-sm font-medium">🏢 Our Story</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            16 Years of <span className="gradient-text">Excellence</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 max-w-2xl mx-auto text-lg"
          >
            From a single workshop in East London, Gadcet has grown to become the UK&apos;s most
            trusted gadget repair network — all while keeping our founding promise: quality first.
          </motion.p>
        </div>

        {/* Mission cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {[
            { icon: "🎯", title: "Our Mission", desc: "To make quality gadget repair accessible, affordable, and fast for everyone across the UK." },
            { icon: "👁️", title: "Our Vision", desc: "A world where no device is thrown away prematurely — where repair is always the first choice." },
            { icon: "💎", title: "Our Values", desc: "Honesty, transparency, and technical excellence in every single repair we perform." },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass rounded-2xl p-8 border border-white/10 text-center"
            >
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Timeline */}
        <div className="relative">
          <div className="text-center mb-12">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl font-bold text-white"
            >
              Our <span className="gradient-text-blue">Journey</span>
            </motion.h3>
          </div>

          {/* Timeline line */}
          <div className="relative">
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-blue-500/50 to-transparent hidden md:block" />

            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.7, delay: i * 0.1 }}
                  className={`flex items-center gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"} flex-row`}
                >
                  <div className={`flex-1 ${i % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className="glass rounded-2xl p-6 border border-white/10 inline-block w-full md:max-w-sm">
                      <div className="text-blue-400 font-bold text-lg mb-1">{m.year}</div>
                      <div className="text-white font-semibold mb-2">{m.title}</div>
                      <div className="text-slate-400 text-sm leading-relaxed">{m.desc}</div>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden md:flex w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-500/20 flex-shrink-0 relative z-10" />

                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
