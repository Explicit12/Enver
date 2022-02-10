const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";

const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

(function addCustomPlayerUI() {
  if (navigator.userAgentData.mobile) return;

  const $thumbnail = document.createElement("img");
  $thumbnail.classList.add("thumbnail");
  $thumbnail.src = "../img/photos/video-preview.png";
  $thumbnail.alt = "thumbnail";
  $thumbnail.loading = "lazy";

  const $playBtn = document.createElement("img");
  $playBtn.classList.add("play-btn");
  $playBtn.src = "../svg/icons/play-icon.svg";
  $playBtn.alt = "Play";
  $playBtn.loading = "lazy";

  const $playerContainer = document.querySelector(".player-container");
  $playerContainer.prepend($thumbnail);
  $playerContainer.prepend($playBtn);
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
      modestbranding: 1,
      origin: "https://www.youtube.com"
    },
    videoId: "dQw4w9WgXcQ",
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
    },
  });

  const $playerContainer = [
    document.querySelector(".play-btn"),
    document.querySelector(".thumbnail"),
  ];

  function onPlayerReady(event) {
    if (navigator.userAgentData.mobile) return;

    const playerStates = [-1, 2, 3, 5];

    $playerContainer.forEach((element) => {
      element.addEventListener("click", function togglePlay(event) {
        if (playerStates.includes(player.getPlayerState())) player.playVideo();
        if (!playerStates.includes(player.getPlayerState())) player.pauseVideo();
      });
    });
  }

  function onPlayerStateChange(event) {
    if (navigator.userAgentData.mobile) return;

    if (event.data === 1) {
      $playerContainer.forEach((element) => {
        element.style.opacity = 0;
      });

      $playerContainer[1].style.pointerEvents = "none";
    }

    if (event.data === 0) {
      $playerContainer.forEach((element) => {
        element.style.opacity = 1;
      });
      player.seekTo(0).pauseVideo();
    }

    if (![0, 1].includes(event.data)) {
      $playerContainer[0].style.opacity = 1;
    }
  }
}