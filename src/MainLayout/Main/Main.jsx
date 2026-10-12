import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import Hero from "../HomeSections/Hero/Hero";
import Tools from "../../Components/Tools/Tools";
import Services from "../HomeSections/Services/Services";
import Process from "../HomeSections/Process/Process";
import WhyUs from "../HomeSections/WhyUs/WhyUs";
import OurWork from "../HomeSections/OurWork/OurWork";
import Contact from "../HomeSections/Contact/Contact";
import Footer from "../HomeSections/Footer/Footer";
import LampCta from "../HomeSections/WhoWeAre/WhoWeAre";
import MainLoading from "../../Components/MainLoading/MainLoading";

const LENIS_OPTIONS = {
  duration: 0.8,
  wheelMultiplier: 0.9,
  smoothWheel: true,
  touchMultiplier: 1.2,
};

const Main = () => {
  const [isLoading, setIsLoading] = useState(true);
  const lenisRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const lenis = new Lenis(LENIS_OPTIONS);
    lenisRef.current = lenis;

    let raf = 0;
    const loop = (time) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
  }, [isLoading]);

  return (
    <>
      <div>
        <Hero ready={!isLoading} />
        <Tools />
        <Services />
        <Process />
        <WhyUs />
        <OurWork />
        <LampCta />
        <Contact />
        <Footer />
      </div>

      {isLoading && <MainLoading onDone={() => setIsLoading(false)} />}
    </>
  );
};

export default Main;