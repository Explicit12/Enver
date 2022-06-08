"use strict"

import { Slider } from "./slider";
import { ScrollObserver } from "./scrollObserver";
import { LiteYTEmbed } from "./lite-yt-embed";

customElements.define('lite-youtube', LiteYTEmbed);
ScrollObserver.showInView(document.querySelectorAll(".abstract-shape"));

window.addEventListener("load", () => {
    const slider = new Slider(
        "#slider",
        {
            slidesToShow: 1,
            slidesToScroll: 1,
            navigationArrows: false,
            pagination: true,
            transition: 250,

            adaptive: {
                720: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                    margins: 24,
                },

                1180: {
                    slidesToShow: 3,
                    slidesToScroll: 3,
                    navigationArrows: true,
                    pagination: false,
                    transition: 0,
                    appearanceAnimation: true,
                }
            }
        }
    );
});