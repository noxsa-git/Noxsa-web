import { useState } from "react";
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

const Main = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {/* Sections mount immediately so the loading overlay hides real work,
          not an empty page. They stay in the DOM after the overlay leaves. */}
      <div>
        <Hero />
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