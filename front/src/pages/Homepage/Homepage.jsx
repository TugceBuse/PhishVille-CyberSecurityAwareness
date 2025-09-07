import Navbar from "./Navbar/Navbar";
import React, { useState } from "react";

import HomeContainer from "./HomeContainer/HomeContainer";  

const Homepage = () => {
  const [homeScrollTo, setHomeScrollTo] = useState("");
    return (
      <div>
         <Navbar setHomeScrollTo={setHomeScrollTo} />
        <div>
           <HomeContainer scrollTo={homeScrollTo} />
        </div>
       
      </div>
    );
  };
  
  export default Homepage;