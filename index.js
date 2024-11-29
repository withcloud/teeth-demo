const axios = require("axios");
const fs = require("fs");
const { createCanvas, loadImage } = require('canvas');

// 定義不同 class 的顏色
const classColors = {
  '-0-Healthy': '#00ff00',         // 綠色
  '-1-Initial-Caries': '#ffff00',  // 黃色
  '-2-Moderate-Caries': '#ffa500', // 橙色
  '-3-Extensive-Caries': '#ff0000' // 紅色
};

async function detectAndDrawResults() {
  // 讀取圖片
  const imageBuffer = fs.readFileSync("image.png");
  const image = await loadImage(imageBuffer);
  
  // 創建 canvas
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext('2d');
  
  // 繪製原始圖片
  ctx.drawImage(image, 0, 0);

  // 發送 API 請求
  const response = await axios({
    method: "POST",
    url: "https://detect.roboflow.com/pre-final-fronts-crowns-yokrz/1",
    params: {
      api_key: "cvY5HkDZf5Ty3RQ7vI3t"
    },
    data: imageBuffer.toString('base64'),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });

  // 繪製檢測結果
  const predictions = response.data.predictions;
  predictions.forEach(pred => {
    const color = classColors[pred.class];
    
    // 繪製矩形 - 加粗框線
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.rect(
      pred.x - pred.width/2,
      pred.y - pred.height/2,
      pred.width,
      pred.height
    );
    ctx.stroke();

    // 繪製標籤 - 加大字體
    ctx.fillStyle = color;
    ctx.font = '24px Arial';
    ctx.fillText(
      `${pred.class} (${(pred.confidence * 100).toFixed(1)}%)`,
      pred.x - pred.width/2,
      pred.y - pred.height/2 - 10
    );
  });

  // 儲存結果圖片
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync('output.png', buffer);
}

detectAndDrawResults().catch(error => {
  console.error('Error:', error.message);
});