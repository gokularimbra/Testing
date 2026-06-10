"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";

const reviews = [
  {
    name: "Sarah M.",
    avatar: "SM",
    rating: 5,
    text: "Cracked my iPhone screen on a Monday morning and it was fixed by lunchtime. The quality is incredible — looks brand new. The staff were super friendly too!",
    device: "iPhone 15 Pro",
    date: "2 weeks ago",
    color: "from-blue-500 to-blue-700",
  },
  {
    name: "James T.",
    avatar: "JT",
    rating: 5,
    text: "Brought in my PS5 with HDMI issues that another shop quoted £180 for. Gadcet fixed it in 45 minutes for £55. Absolutely brilliant service.",
    device: "PlayStation 5",
    date: "1 month ago",
    color: "from-purple-500 to-purple-700",
  },
  {
    name: "Priya K.",
    avatar: "PK",
    rating: 5,
    text: "My laptop stopped charging and I thought I'd need a new one. Gadcet replaced the charging port for £65 and it's been perfect ever since. Saved me hundreds!",
    device: "MacBook Pro",
    date: "3 weeks ago",
    color: "from-cyan-500 to-teal-600",
  },
  {
    name: "David R.",
    avatar: "DR",
    rating: 5,
    text: "Water damage on my Samsung Galaxy — was completely dead. They recovered all my photos and got it working again. Absolutely amazing!",
    device: "Samsung Galaxy S24",
    date: "1 week ago",
    color: "from-green-500 to-emerald-600",
  },
  {
    name: "Emma L.",
    avatar: "EL",
    rating: 5,
    text: "Used Gadcet for my iPad screen repair. Quick, professional, and the price was very fair. The 12-month warranty gives real peace of mind. Highly recommend!",
    device: "iPad Pro",
    date: "2 months ago",
    color: "from-orange-500 to-red-500",
  },
  {
    name: "Mike H.",
    avatar: "MH",
    rating: 5,
    text: "Nintendo Switch joy-con drift fixed while I waited. Less than 30 minutes and the technician explained exactly what he did. Will definitely be back.",
    device: "Nintendo Switch",
    date: "5 days ago",
    color: "from-pink-500 to-rose-600",
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < rating ? "text-yellow-400" : "text-slate-600"}>
          ★
        </span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const inView = useInView(trackRef, { once: false });

  useEffect(() => {
    if (!inView || isPaused) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [inView, isPaused]);

  const visibleCount = 3;

  return (
    <section id="testimonials" className="section-padding relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-96 h-64 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-yellow-500/30 mb-4"
          >
            <span className="text-yellow-400 text-sm font-medium">⭐ Customer Reviews</span>
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
          >
            Real <span className="gradient-text">People</span>, Real Results
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-2 text-slate-400"
          >
            <span className="text-yellow-400 text-xl">★★★★★</span>
            <span className="font-bold text-white">4.9</span>
            <span>based on 2,400+ Google reviews</span>
          </motion.div>
        </div>

        {/* Carousel */}
        <div ref={trackRef} className="relative">
          {/* Cards */}
          <div
            className="grid md:grid-cols-3 gap-6 transition-all"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {Array.from({ length: visibleCount }).map((_, offset) => {
              const idx = (current + offset) % reviews.length;
              const review = reviews[idx];
              return (
                <motion.div
                  key={`${current}-${offset}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: offset * 0.08 }}
                  className="glass rounded-3xl p-6 border border-white/10 flex flex-col gap-4 hover:border-white/20 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-gradient-to-br ${review.color} flex items-center justify-center text-sm font-bold text-white`}
                      >
                        {review.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{review.name}</div>
                        <div className="text-xs text-slate-500">{review.date}</div>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" className="text-blue-400" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                  </div>

                  {/* Stars */}
                  <StarRating rating={review.rating} />

                  {/* Text */}
                  <p className="text-slate-300 text-sm leading-relaxed flex-1">&ldquo;{review.text}&rdquo;</p>

                  {/* Device chip */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-slate-400 self-start">
                    📱 {review.device}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Dots */}
          <div className="flex items-center justify-center gap-2 mt-10">
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === current ? "w-8 h-2 bg-blue-500" : "w-2 h-2 bg-slate-600"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
