document.addEventListener("DOMContentLoaded", function () {
  const canvas = document.getElementById("tetris");
  const ctx = canvas.getContext("2d");
  const nextPieceCanvas = document.getElementById("nextPieceCanvas");
  const nextPieceCtx = nextPieceCanvas.getContext("2d");
  const blockSize = 20;
  const boardWidth = 10;
  const boardHeight = 20;
  const board = [];

  let isPaused = false; // ゲームのポーズ状態を管理する変数
  let gameInterval; // ゲームのメインループのインターバル

  function togglePause() {
    isPaused = !isPaused; // ポーズ状態の反転
    const pauseOverlay = document.getElementById("pauseOverlay");
    if (isPaused) {
      pauseOverlay.style.display = "block"; // ポーズ中の表示を表示する
      // ゲームを一時停止する処理を追加
      clearInterval(gameInterval); // ゲームのメインループを停止
      // その他、必要な一時停止処理を追加する
    } else {
      pauseOverlay.style.display = "none"; // ポーズ中の表示を非表示にする
      // ゲームを再開する処理を追加
      gameInterval = setInterval(updateGame, 1000 / 60); // ゲームのメインループを再開
      // その他、必要な再開処理を追加する
    }
  }

  // ゲームのメインループ関数
  function updateGame() {
    // ゲームの更新処理を記述する
  }

  // ポーズボタンのクリックイベントリスナーを追加
  const pauseButton = document.getElementById("pauseButton");
  pauseButton.addEventListener("click", togglePause);

  for (let row = 0; row < boardHeight; row++) {
    board[row] = [];
    for (let col = 0; col < boardWidth; col++) {
      board[row][col] = 0;
    }
  }

  function drawSquare(x, y, color, context) {
    context.fillStyle = color;
    context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
    context.strokeStyle = "black";
    context.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize);
  }

  function drawBoard() {
    for (let row = 0; row < boardHeight; row++) {
      for (let col = 0; col < boardWidth; col++) {
        if (board[row][col]) {
          drawSquare(col, row, pieceColors[board[row][col] - 1], ctx);
        } else {
          drawSquare(col, row, "white", ctx);
        }
      }
    }
  }

  const pieces = [
    [[1, 1, 1, 1]], // I
    [
      [2, 2, 2],
      [0, 2, 0],
    ], // T
    [
      [3, 3, 0],
      [0, 3, 3],
    ], // Z
    [
      [0, 4, 4],
      [4, 4, 0],
    ], // S
    [
      [5, 5, 5],
      [0, 0, 5],
    ], // J
    [
      [6, 6, 6],
      [6, 0, 0],
    ], // L
    [
      [7, 7],
      [7, 7],
    ], // O
  ];

  const pieceColors = [
    "#00FFFF", // Iテトリミノ
    "#800080", // Tテトリミノ
    "#FF0000", // Zテトリミノ
    "#008000", // Sテトリミノ
    "#0000FF", // Jテトリミノ
    "#FFA500", // Lテトリミノ
    "#FFFF00", // Oテトリミノ
  ];

  function drawPiece(piece, offsetX, offsetY, context) {
    piece.forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          const color = pieceColors[val - 1]; // 対応するテトリミノの色を取得
          drawSquare(x + offsetX, y + offsetY, color, context);
        }
      });
    });
  }

  function collide(board, piece, offsetX, offsetY) {
    return piece.some((row, y) => {
      return row.some((val, x) => {
        return (
          val && (board[y + offsetY] && board[y + offsetY][x + offsetX]) !== 0
        );
      });
    });
  }

  function rotate(piece) {
    const rotatedPiece = [];
    for (let y = 0; y < piece[0].length; y++) {
      rotatedPiece.push([]);
      for (let x = 0; x < piece.length; x++) {
        rotatedPiece[y].push(piece[x][y]);
      }
    }
    return rotatedPiece.map((row) => row.reverse());
  }

  let currentPieceIndex = 0;
  let nextPieceIndex = 1;
  let currentX = 3;
  let currentY = 0;
  let dropTimer = 0;
  let isFallingQuickly = false;

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBoard();
    drawPiece(pieces[currentPieceIndex], currentX, currentY, ctx);
    drawNextPiece();
    drawPrediction();
  }

  function drop() {
    if (
      !isPaused &&
      !collide(board, pieces[currentPieceIndex], currentX, currentY + 1)
    ) {
      currentY++;
    } else if (!isPaused) {
      merge();
      clearLines();
      currentPieceIndex = nextPieceIndex;
      nextPieceIndex = (nextPieceIndex + 1) % pieces.length;
      currentX = 3;
      currentY = 0;
      if (collide(board, pieces[currentPieceIndex], currentX, currentY)) {
        // Game over
        alert("Game Over");
        board.forEach((row) => row.fill(0));
      }
    }
    draw();
  }

  function merge() {
    pieces[currentPieceIndex].forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          board[y + currentY][x + currentX] = val;
        }
      });
    });
  }

  function move(dir) {
    currentX += dir;
    if (collide(board, pieces[currentPieceIndex], currentX, currentY)) {
      currentX -= dir;
    }
    draw();
  }

  function rotatePiece() {
    const rotatedPiece = rotate(pieces[currentPieceIndex]);
    if (!collide(board, rotatedPiece, currentX, currentY)) {
      pieces[currentPieceIndex] = rotatedPiece;
    }
    draw();
  }

  function clearLines() {
    for (let row = boardHeight - 1; row >= 0; row--) {
      if (board[row].every((val) => val !== 0)) {
        board.splice(row, 1);
        board.unshift(new Array(boardWidth).fill(0));
        row++; // Check the same row again as it has been replaced
      }
    }
  }

  function drawNextPiece() {
    nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
    const nextPieceSize = 4;
    const nextPieceBlockSize = nextPieceCanvas.width / nextPieceSize;
    const nextPieceX = (nextPieceSize - pieces[nextPieceIndex][0].length) / 2;
    const nextPieceY = (nextPieceSize - pieces[nextPieceIndex].length) / 2;
    drawPiece(pieces[nextPieceIndex], nextPieceX, nextPieceY, nextPieceCtx);
  }

  function drawPrediction() {
    let predictionY = currentY;
    while (
      !collide(board, pieces[currentPieceIndex], currentX, predictionY + 1)
    ) {
      predictionY++;
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    pieces[currentPieceIndex].forEach((row, y) => {
      row.forEach((val, x) => {
        if (val) {
          ctx.fillRect(
            (x + currentX) * blockSize,
            (y + predictionY) * blockSize,
            blockSize,
            blockSize
          );
        }
      });
    });
  }

  const holdPieceCanvas = document.getElementById("holdPieceCanvas");
  const holdPieceCtx = holdPieceCanvas.getContext("2d");

  let heldPiece = null;

  function instantDrop() {
    while (!collide(board, pieces[currentPieceIndex], currentX, currentY + 1)) {
      currentY++;
    }
    drop();
  }

  function holdPiece() {
    if (heldPiece === null) {
      heldPiece = pieces[currentPieceIndex];
      currentPieceIndex = nextPieceIndex;
      nextPieceIndex = (nextPieceIndex + 1) % pieces.length;
      currentX = 3;
      currentY = 0;
    } else {
      const tempPiece = heldPiece;
      heldPiece = pieces[currentPieceIndex];
      currentPieceIndex = pieces.indexOf(tempPiece);
      currentX = 3;
      currentY = 0;
    }
    draw();
    drawHoldPiece();
  }

  function drawHoldPiece() {
    holdPieceCtx.clearRect(0, 0, holdPieceCanvas.width, holdPieceCanvas.height);
    const holdPieceSize = 4;
    const holdPieceBlockSize = holdPieceCanvas.width / holdPieceSize;
    const holdPieceX = (holdPieceSize - heldPiece[0].length) / 2;
    const holdPieceY = (holdPieceSize - heldPiece.length) / 2;
    drawPiece(heldPiece, holdPieceX, holdPieceY, holdPieceCtx);
  }

  const rotateButton = document.getElementById("rotateButton");
  const leftButton = document.getElementById("leftButton");
  const rightButton = document.getElementById("rightButton");
  const downButton = document.getElementById("downButton");
  const upButton = document.getElementById("upButton");

  const holdButton = document.getElementById("holdButton");

  rotateButton.addEventListener("click", function () {
    rotatePiece();
  });

  leftButton.addEventListener("click", function () {
    move(-1);
  });

  rightButton.addEventListener("click", function () {
    move(1);
  });

  downButton.addEventListener("click", function () {
    drop();
  });

  upButton.addEventListener("click", function () {
    while (!collide(board, pieces[currentPieceIndex], currentX, currentY + 1)) {
      currentY++;
    }
    instantDrop();
  });

  holdButton.addEventListener("click", function () {
    holdPiece();
  });

  document.addEventListener("keydown", function (event) {
    switch (event.key) {
      case "ArrowLeft":
        move(-1);
        break;
      case "ArrowRight":
        move(1);
        break;
      case "ArrowDown":
        drop();
        break;
      case "ArrowUp": // 上キーが押された場合
        instantDrop(); // instantDrop 関数を呼び出す
        break;
      case "Shift":
        rotatePiece();
        break;
      case "c":
      case "C":
        holdPiece();
        break;
      default:
        break;
    }
  });

  setInterval(() => {
    if (!isFallingQuickly) {
      dropTimer++;
      if (dropTimer >= 30) {
        drop();
        dropTimer = 0;
      }
    }
  }, 20);

  setInterval(() => {
    draw();
  }, 30);
});

// ボタン要素を取得
const leftButton = document.getElementById("leftButton");
const rightButton = document.getElementById("rightButton");
const upButton = document.getElementById("upButton");
const downButton = document.getElementById("downButton");
const rotateButton = document.getElementById("rotateButton");
const holdButton = document.getElementById("holdButton");

// クリックイベントリスナーを追加
leftButton.addEventListener("click", moveLeft);
rightButton.addEventListener("click", moveRight);
upButton.addEventListener("click", moveUp);
downButton.addEventListener("click", moveDown);
rotateButton.addEventListener("click", rotatePiece);
holdButton.addEventListener("click", holdPiece);

// タッチイベントリスナーを追加
leftButton.addEventListener("touchstart", moveLeft);
rightButton.addEventListener("touchstart", moveRight);
upButton.addEventListener("touchstart", moveUp);
downButton.addEventListener("touchstart", moveDown);
rotateButton.addEventListener("touchstart", rotatePiece);
holdButton.addEventListener("touchstart", holdPiece);

// タッチイベントのデフォルト動作を防止
function preventZoom(event) {
  event.preventDefault();
}

leftButton.addEventListener("touchmove", preventZoom);
rightButton.addEventListener("touchmove", preventZoom);
upButton.addEventListener("touchmove", preventZoom);
downButton.addEventListener("touchmove", preventZoom);
rotateButton.addEventListener("touchmove", preventZoom);
holdButton.addEventListener("touchmove", preventZoom);

$(function () {
  var audioBtn = $(".audio_button"),
    audioWrap = $(".audio_wrap"),
    audio = document.getElementById("audio");

  audioBtn.on("click", function () {
    if (audioWrap.hasClass("play")) {
      audio.pause();
      audioWrap.removeClass("play");
    } else {
      audio.play();
      audioWrap.addClass("play");
    }
  });
});

const audio = document.getElementById("audio");
audio.play();

function togglePause() {
  isPaused = !isPaused;
  const pauseOverlay = document.getElementById("pauseOverlay");
  const container = document.getElementById("container");
  if (isPaused) {
    pauseOverlay.style.display = "block"; // ポーズ中の表示を表示する
    container.classList.add(paused);
    // ゲームを一時停止する処理を追加
    clearInterval(gameInterval); // ゲームのメインループを停止
    // その他、必要な一時停止処理を追加する
  } else {
    pauseOverlay.style.display = "none"; // ポーズ中の表示を非表示にする

    // ゲームを再開する処理を追加
    gameInterval = setInterval(updateGame, 1000 / 60); // ゲームのメインループを再開
    // その他、必要な再開処理を追加する
  }
}
