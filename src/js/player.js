const tag = document.createElement("script");
tag.src = "https://www.youtube.com/iframe_api";

const firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

function onYouTubeIframeAPIReady() {
  const player = new YT.Player("player", {
    height: "100%",
    width: "100%",
    playerVars: {
      color: "white",
      autoplay: 0,
      // controls: 0,
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

  function onPlayerReady(event) {
    const $thumbnail = document.createElement("img");
    $thumbnail.classList.add("thumbnail");
    $thumbnail.src = "../img/photos/video-preview.png";
    $thumbnail.alt = "thumbnail";

    const $playBtn = document.createElement("img");
    $playBtn.classList.add("play-btn");
    $playBtn.src = "../svg/icons/play-icon.svg";
    $playBtn.alt = "Play";

    const $playerContainer = document.querySelector(".player-container");
    $playerContainer.prepend($thumbnail);
    $playerContainer.prepend($playBtn);
  }

  function onPlayerStateChange(event) {
    const $playerContainer = [
      document.querySelector(".play-btn"),
      document.querySelector(".thumbnail"),
    ];

    if (event.data === 1) {
      $playerContainer.forEach((e) => {
        e.style.opacity = 0;
      });
    }

    if (event.data === 0) {
      $playerContainer.forEach((e) => {
        e.style.opacity = 1;
      });
      player.seekTo(0).pauseVideo();
    }

    if (![0, 1].includes(event.data)) {
      $playerContainer[0].style.opacity = 1;
    }
  }
}
