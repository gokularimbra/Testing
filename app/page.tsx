"use client";

import dynamic from "next/dynamic";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import WhyUs from "./components/WhyUs";
import Testimonials from "./components/Testimonials";
import About from "./components/About";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import { useLenis } from "./hooks/useLenis";

const LoadingScreen = dynamic(() => import("./components/LoadingScreen"), { ssr: false });
const CursorGlow = dynamic(() => import("./components/CursorGlow"), { ssr: false });

export default function Home() {
  useLenis();

  return (
    <>
      <LoadingScreen />
      <CursorGlow />
      <div className="noise-overlay" />

      <Navbar />

      <main>
        <Hero />
        <Services />
        <WhyUs />
        <Testimonials />
        <About />
        <FAQ />
      </main>

      <Footer />
    </>
  );
}
