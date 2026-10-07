// Components__
import Hero from "../HomeSections/Hero/Hero";
import Footer from "../../Components/Footer/Footer";
import Tools from "../../Components/Tools/Tools";
import Services from "../HomeSections/Services/Services";
import Process from "../HomeSections/Process/Process";
import WhyUs from "../HomeSections/WhyUs/WhyUs";

const Main = () => {
  return (
    <div>
      <Hero></Hero>
      <Tools></Tools>
      <Services></Services>
      <Process></Process>
      <WhyUs></WhyUs>
      <Process></Process>
      <Footer></Footer>
    </div>
  );
};

export default Main;