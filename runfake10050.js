let numbers = [];
let turn = 0;
let loss = 0;
let profit = 0;
let intervalId = null;

function getCurrentBetAmount(turn) {
    if (turn <= 100) return 1000;

    let extraTurns = turn - 100;
    let level = Math.floor(extraTurns / 50);

    return 2000 * Math.pow(2, level);
}

document.getElementById("startBtn").addEventListener("click", function () {
    numbers = document.getElementById("numbersInput").value
        .split(",")
        .map(x => x.trim())
        .filter(x => x !== "");

    if (numbers.length === 0) {
        alert("Bạn chưa nhập số nào!");
        return;
    }

    document.getElementById("remaining").innerText = numbers.join(", ");

    log("Bắt đầu! Danh sách ban đầu: " + numbers.join(", "));

    turn = 0;
    profit = 0;
    loss = 0;

    intervalId = setInterval(gameLoop, 10);
});

function gameLoop() {
    if (numbers.length === 0) {
        log("🎉 Đã trùng hết tất cả số. Kết thúc!");
        clearInterval(intervalId);
        return;
    }

    turn++;
    document.getElementById("turnCount").innerText = turn;

    let betAmount = getCurrentBetAmount(turn);

    let random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    document.getElementById("randomNum").innerText = random;

    // ✅ TIỀN LỖ CHÍNH XÁC (theo yêu cầu của bạn)
    // lỗ = số lượng số CÒN LẠI * tiền cược mỗi lượt
    loss += numbers.length * betAmount;

    log(`Lượt ${turn} → random: ${random}, tiền đánh mỗi số: ${betAmount}, tổng lỗ lượt này: ${numbers.length * betAmount}`);

    if (numbers.includes(random)) {
        let earned = betAmount * 98;
        profit += earned;

        log(`🔥 Trúng số ${random}! Nhận ${earned}`);

        numbers = numbers.filter(n => n !== random);

        document.getElementById("remaining").innerText = numbers.join(", ");
    }

    document.getElementById("profit").innerText = profit;
    document.getElementById("loss").innerText = loss;
}

function log(msg) {
    const box = document.getElementById("logBox");
    box.textContent += msg + "\n";
    box.scrollTop = box.scrollHeight;
}
