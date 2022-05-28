const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";

const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

(function addCustomPlayerUI() {
  if (window.screen.availWidth <= 800) return;

  const playerContainer = document.querySelector(".player-container");

  playerContainer.insertAdjacentHTML(
    "afterbegin", 
    Template.getThumbnailTemplate("../img/photos/video-preview.png")
  );

  playerContainer.insertAdjacentHTML(
    "afterbegin", 
    Template.getPlayerBtnTemplate("../svg/play-icon.svg")
  );
})();

function onYouTubeIframeAPIReady() {
  const player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    playerVars: {
      color: "white",
      autoplay: 0,
      disablekb: 1,
      fs: 0,
      mute: 0,
      autohide: 0,
      showinfo: 0,
      rel: 0,
      iv_load_policy: 3,
      modestbranding: 1
    },
    videoId: "dQw4w9WgXcQ",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });

  const playerContainer = [
    document.querySelector(".play-btn"),
    document.querySelector(".thumbnail"),
  ];

  function onPlayerReady(event) {
    if (window.screen.availWidth <= 800) return;

    const playerStates = [-1, 2, 3, 5];

    playerContainer.forEach((element) => {
      element.addEventListener("click", function togglePlay(event) {
        if (playerStates.includes(player.getPlayerState())) player.playVideo();
        else player.pauseVideo();
      });
    });
  }

  function onPlayerStateChange(event) {
    if (window.screen.availWidth <= 800) return;

    if (event.data === 1) {
      playerContainer.forEach((element) => {
        element.style.opacity = 0;
      });

      playerContainer[1].style.pointerEvents = "none";
    }

    if (event.data === 0) {
      playerContainer.forEach((element) => {
        element.style.opacity = 1;
      });
      player.seekTo(0).pauseVideo();
    }

    if (![0, 1].includes(event.data)) {
      playerContainer[0].style.opacity = 1;
    }
  }
}