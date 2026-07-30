import Hero from "../components/landing/Hero.jsx";
import About from "../components/landing/About.jsx";
import PlatformOverview from "../components/landing/PlatformOverview.jsx";
import Features from "../components/landing/Features.jsx";
import Services from "../components/landing/Services.jsx";
import WhyChooseUs from "../components/landing/WhyChooseUs.jsx";
import Stats from "../components/landing/Stats.jsx";
import Testimonials from "../components/landing/Testimonials.jsx";
import FAQ from "../components/landing/FAQ.jsx";
import ContactCTA from "../components/landing/ContactCTA.jsx";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <About />
      <PlatformOverview />
      <Features />
      <Services />
      <WhyChooseUs />
      <Stats />
      <Testimonials />
      <FAQ />
      <ContactCTA />
    </>
  );
}
