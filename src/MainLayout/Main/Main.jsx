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
      {/* Hero receives `ready` so its entrance waits until the loader
          uncovers the page — otherwise it plays behind the overlay. */}
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