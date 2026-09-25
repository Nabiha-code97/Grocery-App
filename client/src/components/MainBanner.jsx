import React, { useState } from "react";
import { assets } from "../assets/assets";
import { Link } from "react-router-dom";

const MainBanner = () => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full overflow-hidden aspect-[993/1818] md:aspect-auto md:h-[290px] lg:h-auto lg:aspect-[2366/848]">
      {!loaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <picture>
        <source media="(min-width: 768px)" srcSet={assets.main_banner_bg} />
        <img
          src={assets.main_banner_bg_sm}
          alt="banner"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </picture>

      <div className="absolute inset-0 flex flex-col items-center md:items-start justify-end md:justify-center pb-24 md:pb-0 px-4 md:pl-18 lg:pl-24">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center md:text-left max-w-72 md:max-w-80 lg:max-w-105 leading-tight lg:leading-15">
          Freshness You Can Trust, Savings You will Love!{" "}
        </h1>

        <div className="flex items-center mt-5 font-medium">
          <Link
            to={"/products"}
            className="group flex items-center gap-2 px-7 md:px-9 py-3 bg-primary hover:bg-primary-dull transition rounded text-white cursor-pointer"
          >
            Shop now
            <img
              className="md:hidden transition group-focus:translate-x-1"
              src={assets.white_arrow_icon}
              alt="arrow"
            />
          </Link>
          <Link
            to={"/products"}
            className="group hidden md:flex items-center gap-2 px-9 py-3 cursor-pointer"
          >
            Explore deals
            <img
              className="transition group-hover:translate-x-1"
              src={assets.black_arrow_icon}
              alt="arrow"
            />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MainBanner;
