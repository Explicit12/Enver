"use strict";

import Slider from "./components/slider";
import ShowInView from "./helpers/showInView";
import LiteYTEmbed from "./components/lite-yt-embed";
import MobileMenu from "./components/mobileMenu";
import PageLoader from "./components/loader";

customElements.define("lite-youtube", LiteYTEmbed);
ShowInView.init().show([...document.querySelectorAll(".abstract-shape")]);

PageLoader.init();

window.addEventListener("load", () => {
  MobileMenu.init();

  const slider = new Slider("#slider", {
    slidesToShow: 1,
    slidesToScroll: 1,
    navigationArrows: false,
    pagination: true,
    transition: 250,
    margins: 24,

    adaptive: {
      720: {
        slidesToShow: 2,
        slidesToScroll: 2,
      },

      1180: {
        slidesToShow: 3,
        slidesToScroll: 3,
        navigationArrows: true,
        pagination: false,
        transition: 0,
        appearanceAnimation: true,
        overflowX: false,
      },
    },
  });
});
