document.addEventListener("DOMContentLoaded", function () {
  const startButton = document.getElementById("startButton");

  startButton.addEventListener("click", function () {
    window.location.href = "game.html"; // ゲーム画面に遷移
  });
});
