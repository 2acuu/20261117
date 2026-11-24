const IDLE_FRAME_COUNT = 3; // 設定待機精靈表中的影格數量[cite: 3]
const WALK_FRAME_COUNT = 6; // 設定行走精靈表中的影格數量[cite: 3]
const MAGIC_FRAME_COUNT = 15; // 設定魔法精靈表中的影格數量[cite: 3]
const EFFECT_FRAME_COUNT = 9; // 設定特效精靈表中的影格數量[cite: 3]
const FRAME_INTERVAL = 120; // 設定每張影格顯示的毫秒數[cite: 3]
const MOVE_SPEED = 5; // 設定角色與背景每幀移動的像素距離[cite: 3]
const BG_COPY_COUNT = 3; // 設定背景串接的圖片張數（左、中、右）[cite: 3]

// 角色 2 相關設定
const CHAR2_STOP_FRAME_COUNT = 3; // 1/stop/stop.png 影格數（全寬 376、高 136）
const CHAR2_CIRCLE_FRAME_COUNT = 5; // 1/circle/circle.png 影格數（全寬 705、高 170）
const CHAR2_SCALE = 2.5; // 角色 2 尺寸放大倍率（2 倍）
const CHAR2_PROXIMITY_DISTANCE = 200; // 判定角色 1 接近角色 2 的水平距離門檻（像素）

let idleSheet; // 儲存角色待機動畫的精靈表[cite: 3]
let walkSheet; // 儲存角色行走動畫的精靈表[cite: 3]
let magicSheet; // 儲存角色魔法動畫的精靈表[cite: 3]
let effectSheet; // 儲存魔法完成後播放的特效精靈表[cite: 3]
let char2StopSheet; // 儲存角色 2 待機精靈表（1/stop/stop.png）
let char2CircleSheet; // 儲存角色 2 接近互動精靈表（1/circle/circle.png）
let bgImage; // 儲存背景圖片[cite: 3]
let characterCenterX; // 儲存角色中心點的水平位置[cite: 3]
let scrollX = 0; // 記錄背景目前向左捲動的距離[cite: 3]
let scrollInitialized = false; // 記錄背景捲動位置是否已初始化至中間那張[cite: 3]
let facingDirection = 1; // 儲存角色朝向並以正值代表面向右邊[cite: 3]
let actionState = "idle"; // 儲存角色目前的待機、行走、魔法或特效狀態[cite: 3]
let actionStartedAt = 0; // 記錄目前一次性動畫開始播放的時間[cite: 3]
let spaceKeyHeld = false; // 記錄空白鍵是否仍按住以避免鍵盤自動重複觸發[cite: 3]

// 角色 2 互動狀態與 DOM 輸入元件
let wasNearChar2 = false; // 記錄上一幀角色 1 是否在角色 2 附近
let circleStartedAt = 0; // 記錄 circle.png 單次播放開始的時間
let circlePlayedOnce = false; // 記錄本次接近是否已完成 circle.png 單次播放
let playerName = ""; // 儲存使用者輸入的角色名稱
let nameSubmitted = false; // 記錄是否已完成名稱輸入
let nameInputEl; // 填空格輸入框
let submitBtnEl; // 送出按鈕

function preload() { // 在畫布啟動前載入所有角色素材[cite: 3]
  idleSheet = loadImage("2/stop/stop.png"); // 載入角色待機精靈表[cite: 3]
  walkSheet = loadImage("2/walk/waik.png"); // 載入資料夾中實際存在的行走精靈表[cite: 3]
  magicSheet = loadImage("2/magic/magic.png"); // 載入角色魔法精靈表[cite: 3]
  effectSheet = loadImage("2/circle/circle.png"); // 載入魔法完成後使用的特效精靈表[cite: 3]
  char2StopSheet = loadImage("1/stop/stop.png"); // 載入角色 2 待機精靈表
  char2CircleSheet = loadImage("1/circle/circle.png"); // 載入角色 2 接近互動精靈表
  bgImage = loadImage("bg/1.jpg"); // 載入背景圖片[cite: 3]
} // 結束素材預載函式[cite: 3]

function setup() { // 初始化全螢幕畫布與角色位置[cite: 3]
  createCanvas(windowWidth, windowHeight); // 建立符合目前視窗尺寸的畫布[cite: 3]
  imageMode(CORNER); // 以圖片左上角作為繪製座標[cite: 3]
  frameRate(60); // 設定畫面更新頻率以維持流暢繪製[cite: 3]
  characterCenterX = width * (2 / 3); // 將角色初始位置設在畫面寬度的三分之二處[cite: 3]

  // 建立名稱輸入框與確認按鈕（預設隱藏，僅在提示階段顯示）
  nameInputEl = createInput("");
  nameInputEl.attribute("placeholder", "輸入你的名字...");
  nameInputEl.style("font-size", "16px");
  nameInputEl.style("padding", "6px 10px");
  nameInputEl.style("border-radius", "6px");
  nameInputEl.style("border", "1px solid #aaa");
  nameInputEl.style("outline", "none");
  nameInputEl.elt.addEventListener("keydown", (e) => {
    e.stopPropagation(); // 避免輸入文字時觸發畫布快捷鍵
    if (e.key === "Enter") confirmPlayerName();
  });
  nameInputEl.hide();

  submitBtnEl = createButton("確定");
  submitBtnEl.style("font-size", "16px");
  submitBtnEl.style("padding", "6px 14px");
  submitBtnEl.style("margin-left", "6px");
  submitBtnEl.style("border-radius", "6px");
  submitBtnEl.style("border", "none");
  submitBtnEl.style("background", "#4a5568");
  submitBtnEl.style("color", "#fff");
  submitBtnEl.style("cursor", "pointer");
  submitBtnEl.mousePressed(confirmPlayerName);
  submitBtnEl.hide();
} // 結束初始化函式[cite: 3]

function confirmPlayerName() { // 送出使用者輸入的名稱
  const trimmed = nameInputEl.value().trim();
  if (!trimmed) return;
  playerName = trimmed;
  nameSubmitted = true;
  nameInputEl.hide();
  submitBtnEl.hide();
}

function getBgWidth() { // 計算背景單張圖片依畫布高度縮放後的寬度[cite: 3]
  return bgImage.width * (height / bgImage.height); // 保持圖片比例並讓高度填滿畫布[cite: 3]
} // 結束背景寬度計算函式[cite: 3]

function drawBackground(bgWidth) { // 繪製三張串接的背景圖片[cite: 3]
  const startX = floor(-scrollX); // 取整數座標避免圖片接縫出現細線[cite: 3]
  for (let i = 0; i < BG_COPY_COUNT; i++) { // 依序繪製左、中、右三張背景[cite: 3]
    const x = startX + floor(i * bgWidth); // 計算第 i 張背景的左側位置[cite: 3]
    const nextX = startX + floor((i + 1) * bgWidth); // 計算下一張背景的左側位置以補齊寬度[cite: 3]
    if (nextX < 0 || x > width) continue; // 超出畫面範圍的背景不繪製[cite: 3]
    image(bgImage, x, 0, nextX - x + 1, height); // 繪製背景並多補一像素避免縫隙[cite: 3]
  } // 結束背景繪製迴圈[cite: 3]
} // 結束背景繪製函式[cite: 3]

function drawCharacter2(bgWidth) { // 繪製位於最左邊背景圖中間下方的角色 2
  const firstBgCenterX = floor(-scrollX) + bgWidth * 0.5; // 最左邊背景圖（i = 0）的水平中心
  const firstBgBottomY = height - 24; // 最左邊背景圖的下方基準線
  const isNear = abs(characterCenterX - firstBgCenterX) <= CHAR2_PROXIMITY_DISTANCE; // 判斷角色 1 是否接近角色 2

  // 剛進入接近範圍時，重置 circle.png 單次播放狀態
  if (isNear && !wasNearChar2) {
    circleStartedAt = millis();
    circlePlayedOnce = false;
  }
  // 離開接近範圍時，隱藏輸入元件並重設接近旗標（保留已輸入的 playerName）
  if (!isNear && wasNearChar2) {
    circlePlayedOnce = false;
    nameInputEl.hide();
    submitBtnEl.hide();
  }
  wasNearChar2 = isNear;

  const circleDuration = CHAR2_CIRCLE_FRAME_COUNT * FRAME_INTERVAL;
  if (isNear && !circlePlayedOnce && millis() - circleStartedAt >= circleDuration) {
    circlePlayedOnce = true; // circle.png 播放完一次
  }

  // 接近且尚未播完一次 circle.png 時播放 circle.png；播完後停在最後一格；遠離時循環播放 stop.png
  const useCircle = isNear;
  const sheet = useCircle ? char2CircleSheet : char2StopSheet;
  const frameCount = useCircle ? CHAR2_CIRCLE_FRAME_COUNT : CHAR2_STOP_FRAME_COUNT;
  const frameWidth = sheet.width / frameCount;
  const frameHeight = sheet.height;

  let frameIndex = 0;
  if (!useCircle) {
    frameIndex = floor(millis() / FRAME_INTERVAL) % frameCount; // 遠離時循環播放 stop.png
  } else if (!circlePlayedOnce) {
    frameIndex = min(floor((millis() - circleStartedAt) / FRAME_INTERVAL), frameCount - 1); // 播放一次 circle.png
  } else {
    frameIndex = frameCount - 1; // 播完後停留在最後一格
  }

  const sourceX = frameIndex * frameWidth;
  const drawWidth = frameWidth * CHAR2_SCALE; // 放大 2 倍寬度
  const drawHeight = frameHeight * CHAR2_SCALE; // 放大 2 倍高度
  const drawX = firstBgCenterX - drawWidth * 0.5;
  const drawY = firstBgBottomY - drawHeight;

  if (drawX + drawWidth >= 0 && drawX <= width) {
    image(sheet, drawX, drawY, drawWidth, drawHeight, sourceX, 0, frameWidth, frameHeight);
  }

  // 接近且 circle.png 已播放完一次後的對話與輸入互動
  if (isNear && circlePlayedOnce) {
    push();
    textAlign(CENTER, BOTTOM);
    textStyle(BOLD);
    textSize(20);
    noStroke();
    fill(28);

    if (!nameSubmitted) {
      const promptText = "想進入魔法世界請先輸入你的名字。";
      const textX = constrain(firstBgCenterX, 180, width - 180);
      const textY = max(60, drawY - 16);
      text(promptText, textX, textY);

      // 定位填空格與按鈕在提示文字下方
      const inputW = 180;
      const btnW = 64;
      const totalW = inputW + btnW + 6;
      const startInputX = constrain(textX - totalW * 0.5, 12, width - totalW - 12);
      const inputY = min(height - 46, textY + 10);

      nameInputEl.size(inputW - 22, 24);
      nameInputEl.position(startInputX, inputY);
      nameInputEl.show();

      submitBtnEl.position(startInputX + inputW + 6, inputY);
      submitBtnEl.show();
    } else {
      nameInputEl.hide();
      submitBtnEl.hide();
      const replyText = "很高興認識你，魔法師。";
      const textX = constrain(firstBgCenterX, 160, width - 160);
      const textY = max(50, drawY - 16);
      text(replyText, textX, textY);
    }
    pop();
  }
} // 結束角色 2 繪製函式

function draw() { // 每個畫面更新時繪製背景與角色[cite: 3]
  const bgWidth = getBgWidth(); // 取得目前單張背景寬度[cite: 3]
  const maxScroll = max(0, bgWidth * BG_COPY_COUNT - width); // 計算背景可捲動的最大距離（背景最右邊）[cite: 3]
  if (!scrollInitialized) { // 判斷是否尚未設定初始捲動位置[cite: 3]
    scrollX = constrain(bgWidth, 0, maxScroll); // 讓畫面一開始顯示中間那張背景[cite: 3]
    scrollInitialized = true; // 標記初始化完成[cite: 3]
  } // 結束初始化捲動位置判斷[cite: 3]
  scrollX = constrain(scrollX, 0, maxScroll); // 確保捲動距離在合法範圍內[cite: 3]
  drawBackground(bgWidth); // 繪製三張串接的背景圖片[cite: 3]
  drawCharacter2(bgWidth); // 繪製角色 2 與其互動字幕/輸入框
  const isActionPlaying = actionState === "magic" || actionState === "effect"; // 判斷魔法或特效動畫是否正在播放[cite: 3]
  const actionFrameCount = actionState === "magic" ? MAGIC_FRAME_COUNT : EFFECT_FRAME_COUNT; // 取得目前一次性動畫的影格總數[cite: 3]
  const actionDuration = actionFrameCount * FRAME_INTERVAL; // 計算目前一次性動畫完整播放所需時間[cite: 3]
  if (isActionPlaying && millis() - actionStartedAt >= actionDuration) { // 判斷目前一次性動畫是否已經播放完畢[cite: 3]
    actionState = actionState === "magic" ? "effect" : "idle"; // 魔法播放完接續特效，特效播放完返回待機[cite: 3]
    actionStartedAt = millis(); // 記錄接續動畫或待機狀態的開始時間[cite: 3]
  } // 結束一次性動畫播放完成的判斷[cite: 3]
  const isMovingRight = !isActionPlaying && keyIsDown(RIGHT_ARROW); // 在一次性動畫以外檢查是否按住向右鍵[cite: 3]
  const isMovingLeft = !isActionPlaying && keyIsDown(LEFT_ARROW) && !isMovingRight; // 在一次性動畫以外檢查是否按住向左鍵[cite: 3]
  const isWalking = isMovingRight || isMovingLeft; // 判斷目前是否需要播放行走動畫[cite: 3]
  if (isMovingRight) facingDirection = 1; // 向右移動時更新角色朝右[cite: 3]
  if (isMovingLeft) facingDirection = -1; // 向左移動時更新角色朝左[cite: 3]
  const currentSheet = actionState === "magic" ? magicSheet : actionState === "effect" ? effectSheet : isWalking ? walkSheet : idleSheet; // 依角色狀態選擇要繪製的精靈表[cite: 3]
  const frameCount = actionState === "magic" ? MAGIC_FRAME_COUNT : actionState === "effect" ? EFFECT_FRAME_COUNT : isWalking ? WALK_FRAME_COUNT : IDLE_FRAME_COUNT; // 取得目前精靈表的影格數量[cite: 3]
  const frameWidth = currentSheet.width / frameCount; // 計算目前精靈表中單格影格的寬度[cite: 3]
  const frameElapsed = isActionPlaying ? millis() - actionStartedAt : millis(); // 取得一次性動畫或循環動畫的播放時間[cite: 3]
  const frameIndex = isActionPlaying ? min(floor(frameElapsed / FRAME_INTERVAL), frameCount - 1) : floor(frameElapsed / FRAME_INTERVAL) % frameCount; // 一次性動畫播放到尾格後等待切換，其他動畫持續循環[cite: 3]
  const characterHeight = min(height * 0.42, width * 0.68); // 依裝置大小調整角色高度[cite: 3]
  const characterWidth = characterHeight * (frameWidth / currentSheet.height); // 依影格比例計算角色寬度[cite: 3]
  const sourceX = frameIndex * frameWidth; // 計算目前影格在精靈表中的水平位置[cite: 3]
  if (isMovingRight) { // 按下右鍵時的移動處理[cite: 3]
    if (scrollX < maxScroll) { // 背景尚未捲動到最右邊[cite: 3]
      scrollX = min(scrollX + MOVE_SPEED, maxScroll); // 背景往左移動，角色保持原位[cite: 3]
    } else { // 背景已到最右邊，暫停捲動[cite: 3]
      characterCenterX += MOVE_SPEED; // 角色改為向右移動[cite: 3]
    } // 結束向右移動的背景判斷[cite: 3]
  } else if (isMovingLeft) { // 按下左鍵時的移動處理[cite: 3]
    if (scrollX > 0) { // 背景尚未捲動到最左邊[cite: 3]
      scrollX = max(scrollX - MOVE_SPEED, 0); // 背景往右移動，角色保持原位[cite: 3]
    } else { // 背景已到最左邊，暫停捲動[cite: 3]
      characterCenterX -= MOVE_SPEED; // 角色改為向左移動[cite: 3]
    } // 結束向左移動的背景判斷[cite: 3]
  } // 結束左右鍵移動處理[cite: 3]
  characterCenterX = constrain(characterCenterX, characterWidth / 2, width - characterWidth / 2); // 限制角色不超出畫布左右邊界[cite: 3]
  const characterY = height - characterHeight; // 將角色底部對齊畫布底端[cite: 3]
  push(); // 暫存畫布座標狀態以便控制角色轉向[cite: 3]
  translate(characterCenterX, characterY); // 將座標原點移至角色底部中心[cite: 3]
  if (facingDirection === -1) scale(-1, 1); // 角色朝左時水平翻轉目前動畫圖片[cite: 3]
  image(currentSheet, -characterWidth / 2, 0, characterWidth, characterHeight, sourceX, 0, frameWidth, currentSheet.height); // 裁切並繪製目前角色影格[cite: 3]
  pop(); // 還原畫布座標狀態[cite: 3]

  // 若已輸入名稱，無論角色 1 是否遠離角色 2，都將名稱顯示在角色 1 頭頂正上方（粗體、深色、無底色、無框線）
  if (nameSubmitted && playerName) {
    push();
    textAlign(CENTER, BOTTOM);
    textStyle(BOLD);
    textSize(20);
    noStroke();
    fill(28);
    text(playerName, characterCenterX, characterY - 10);
    pop();
  }
} // 結束每幀繪製函式[cite: 3]

function keyPressed() { // 處理空白鍵並開始播放一次性魔法動畫[cite: 3]
  if (key === " ") { // 僅處理空白鍵按下事件[cite: 3]
    if (!spaceKeyHeld && actionState !== "magic" && actionState !== "effect") { // 僅在新按下且沒有播放其他動作時開始施法[cite: 3]
      actionState = "magic"; // 切換至魔法動畫狀態[cite: 3]
      actionStartedAt = millis(); // 記錄魔法動畫的開始時間[cite: 3]
    } // 結束新按下空白鍵的施法判斷[cite: 3]
    spaceKeyHeld = true; // 標記空白鍵已按住以忽略自動重複事件[cite: 3]
    return false; // 阻止空白鍵造成瀏覽器頁面捲動[cite: 3]
  } // 結束空白鍵施法判斷[cite: 3]
} // 結束鍵盤按下事件函式[cite: 3]

function keyReleased() { // 處理空白鍵放開並允許下次施法[cite: 3]
  if (key === " ") spaceKeyHeld = false; // 放開空白鍵後清除按住狀態[cite: 3]
} // 結束鍵盤放開事件函式[cite: 3]

function windowResized() { // 視窗或裝置方向改變時重新調整畫布[cite: 3]
  resizeCanvas(windowWidth, windowHeight); // 讓畫布重新填滿目前視窗[cite: 3]
  characterCenterX = constrain(characterCenterX, 0, width); // 將角色位置限制在新畫布範圍內[cite: 3]
  scrollInitialized = false; // 視窗尺寸改變後重新計算背景捲動位置[cite: 3]
} // 結束視窗尺寸更新函式[cite: 3]