// items.js — how every item looks. Used by the game canvas AND by the Items card on the page,
// so the icon you read is exactly the shape you see falling.
//
// Shape = group:  striped rectangle = expense, rounded pill = reward, octagon = bad mod.
// Inside: text ("-1", "x2", ">>", "%") or an icon (skull, heart, shield, clock, arrows).

import { THEME } from "./config.js";

const WHITE = "#ffffff";

export function drawItem(ctx, item, x, y, w, h) {
  ctx.save();
  if (item.group === "expense") shapeExpense(ctx, item, x, y, w, h);
  else if (item.group === "reward") shapePill(ctx, item, x, y, w, h);
  else shapeOctagon(ctx, item, x, y, w, h);
  drawSymbol(ctx, item, x + w / 2, y + h / 2, h);
  ctx.restore();
}

// ---------------------------------------------------------------- shapes

function shapeExpense(ctx, item, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.fillStyle = item.color;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = THEME.obstacleStripe;
  ctx.lineWidth = 5;
  for (let sx = x - h; sx < x + w; sx += 14) {
    ctx.beginPath();
    ctx.moveTo(sx, y + h);
    ctx.lineTo(sx + h, y);
    ctx.stroke();
  }
  ctx.fillStyle = THEME.obstacleLight;
  ctx.fillRect(x, y, w, 3);
  ctx.fillStyle = THEME.obstacleShade;
  ctx.fillRect(x, y + h - 4, w, 4);
  ctx.restore();
  ctx.strokeStyle = THEME.obstacleOutline;
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
}

function shapePill(ctx, item, x, y, w, h) {
  roundedRect(ctx, x + 1.5, y + 1.5, w - 3, h - 3, (h - 3) / 2);
  ctx.fillStyle = item.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = WHITE;
  ctx.stroke();
  roundedRect(ctx, x, y, w, h, h / 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = THEME.obstacleOutline;
  ctx.stroke();
}

function shapeOctagon(ctx, item, x, y, w, h) {
  const c = h * 0.32; // cut corner size
  ctx.beginPath();
  ctx.moveTo(x + c, y + 1.5);
  ctx.lineTo(x + w - c, y + 1.5);
  ctx.lineTo(x + w - 1.5, y + c);
  ctx.lineTo(x + w - 1.5, y + h - c);
  ctx.lineTo(x + w - c, y + h - 1.5);
  ctx.lineTo(x + c, y + h - 1.5);
  ctx.lineTo(x + 1.5, y + h - c);
  ctx.lineTo(x + 1.5, y + c);
  ctx.closePath();
  ctx.fillStyle = item.color;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = THEME.obstacleOutline;
  ctx.stroke();
  ctx.setLineDash([4, 3]);
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = WHITE;
  ctx.stroke();
  ctx.setLineDash([]);
}

// ---------------------------------------------------------------- symbols

function drawSymbol(ctx, item, cx, cy, h) {
  if (item.text) {
    ctx.font = `800 ${Math.round(h * 0.6)}px "Avenir Next", "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = 4;
    ctx.strokeStyle = item.group === "reward" ? "rgba(0,0,0,0.35)" : THEME.obstacleOutline;
    ctx.strokeText(item.text, cx, cy + 1);
    ctx.fillStyle = WHITE;
    ctx.fillText(item.text, cx, cy + 1);
    return;
  }
  const s = h * 0.62;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  if (item.icon === "heart") {
    heartPath(ctx, cx, cy, s);
    ctx.fillStyle = WHITE;
    ctx.fill();
  } else if (item.icon === "shield") {
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.4, cy - s * 0.45);
    ctx.lineTo(cx + s * 0.4, cy - s * 0.45);
    ctx.lineTo(cx + s * 0.4, cy + s * 0.05);
    ctx.quadraticCurveTo(cx + s * 0.4, cy + s * 0.4, cx, cy + s * 0.55);
    ctx.quadraticCurveTo(cx - s * 0.4, cy + s * 0.4, cx - s * 0.4, cy + s * 0.05);
    ctx.closePath();
    ctx.fillStyle = WHITE;
    ctx.fill();
  } else if (item.icon === "clock") {
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.45, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.28);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + s * 0.2, cy + s * 0.12);
    ctx.stroke();
  } else if (item.icon === "arrows") {
    ctx.strokeStyle = WHITE;
    ctx.lineWidth = 2.5;
    arrow(ctx, cx - s * 0.5, cy - s * 0.17, cx + s * 0.5, cy - s * 0.17, s * 0.2);
    arrow(ctx, cx + s * 0.5, cy + s * 0.17, cx - s * 0.5, cy + s * 0.17, s * 0.2);
  } else if (item.icon === "ghost") {
    // Dome head, straight sides, wavy bottom edge, two dark eyes.
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.1, s * 0.4, Math.PI, 0);
    ctx.lineTo(cx + s * 0.4, cy + s * 0.42);
    ctx.lineTo(cx + s * 0.2, cy + s * 0.3);
    ctx.lineTo(cx, cy + s * 0.42);
    ctx.lineTo(cx - s * 0.2, cy + s * 0.3);
    ctx.lineTo(cx - s * 0.4, cy + s * 0.42);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#312e81";
    ctx.beginPath();
    ctx.arc(cx - s * 0.15, cy - s * 0.1, s * 0.07, 0, Math.PI * 2);
    ctx.arc(cx + s * 0.15, cy - s * 0.1, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
  } else if (item.icon === "skull") {
    ctx.fillStyle = WHITE;
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.08, s * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - s * 0.22, cy + s * 0.2, s * 0.44, s * 0.3);
    ctx.fillStyle = "#111827";
    ctx.beginPath();
    ctx.arc(cx - s * 0.16, cy - s * 0.1, s * 0.1, 0, Math.PI * 2);
    ctx.arc(cx + s * 0.16, cy - s * 0.1, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - s * 0.06, cy + s * 0.28, s * 0.04, s * 0.18);
    ctx.fillRect(cx + s * 0.04, cy + s * 0.28, s * 0.04, s * 0.18);
  }
}

function arrow(ctx, x1, y1, x2, y2, head) {
  const dir = Math.sign(x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.moveTo(x2 - dir * head, y2 - head);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2 - dir * head, y2 + head);
  ctx.stroke();
}

// Heart outline centred on (cx, cy), about `s` wide. Fill or stroke it yourself.
export function heartPath(ctx, cx, cy, s) {
  const w = s;
  const h = s * 0.9;
  ctx.beginPath();
  ctx.moveTo(cx, cy + h * 0.45);
  ctx.bezierCurveTo(cx - w * 0.65, cy + h * 0.05, cx - w * 0.5, cy - h * 0.55, cx, cy - h * 0.2);
  ctx.bezierCurveTo(cx + w * 0.5, cy - h * 0.55, cx + w * 0.65, cy + h * 0.05, cx, cy + h * 0.45);
  ctx.closePath();
}

export function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
