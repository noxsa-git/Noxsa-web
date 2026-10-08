// Components__
import Hero from "../HomeSections/Hero/Hero";

import Tools from "../../Components/Tools/Tools";
import Services from "../HomeSections/Services/Services";
import Process from "../HomeSections/Process/Process";
import WhyUs from "../HomeSections/WhyUs/WhyUs";
import OurWork from "../HomeSections/OurWork/OurWork";
import Contact from "../HomeSections/Contact/Contact";
import Footer from "../HomeSections/Footer/Footer";
import LampCta from "../HomeSections/WhoWeAre/WhoWeAre";

const Main = () => {
  return (
    <div>
      <Hero></Hero>
      <Tools></Tools>
      <Services></Services>
      <Process></Process>
      <WhyUs></WhyUs>
      <OurWork></OurWork>
      <LampCta></LampCta>
      <Contact></Contact>
      <Footer></Footer>
    </div>
  );
};

export default Main;