  
  const TOTAL_TURNS = 1440; // tổng số lượt
  const YOUR_NUMBER = 27;   // số của bạn
  const TURN_DEFAULT = 70;

  const formatterMoney = new Intl.NumberFormat('en-US', {
	style: 'currency',
	currency: 'USD',
	minimumFractionDigits: 0,
	maximumFractionDigits: 0
  });

    // 💰 Hàm tính tiền cho mỗi lượt (bạn sẽ thay công thức riêng)
  function calcBet(turnIndex) {
    if (turnIndex <= TURN_DEFAULT) return 1000;
	else if (turnIndex > TURN_DEFAULT && turnIndex <= TURN_DEFAULT * 2) return 2000;
	else if (turnIndex > TURN_DEFAULT * 2 && turnIndex <= TURN_DEFAULT * 3) return 4000;
	else if (turnIndex > TURN_DEFAULT * 3 && turnIndex <= TURN_DEFAULT * 4) return 8000;
	else if (turnIndex > TURN_DEFAULT * 4 && turnIndex <= TURN_DEFAULT * 5) return 16000;
	else if (turnIndex > TURN_DEFAULT * 5 && turnIndex <= TURN_DEFAULT * 6) return 32000;
	else if (turnIndex > TURN_DEFAULT * 6 && turnIndex <= TURN_DEFAULT * 7) return 1000;
	else if (turnIndex > TURN_DEFAULT * 7 && turnIndex <= TURN_DEFAULT * 8) return 2000;
	else if (turnIndex > TURN_DEFAULT * 8 && turnIndex <= TURN_DEFAULT * 9) return 4000;
	else if (turnIndex > TURN_DEFAULT * 9 && turnIndex <= TURN_DEFAULT * 10) return 8000;
	else if (turnIndex > TURN_DEFAULT * 10 && turnIndex <= TURN_DEFAULT * 11) return 16000;
	else if (turnIndex > TURN_DEFAULT * 11 && turnIndex <= TURN_DEFAULT * 12) return 32000;
    return 1000;
  }
  
   function calcBet2(turnIndex) {
    if (turnIndex <= 80) return 1000;
	else if (turnIndex > 80 && turnIndex <= 140) return 2000;
	else if (turnIndex > 140 && turnIndex <= 190) return 4000;
	else if (turnIndex > 190 && turnIndex <= 240) return 8000;
	else if (turnIndex > 240 && turnIndex <= 290) return 16000;
	else if (turnIndex > 290 && turnIndex <= 340) return 32000;
	else if (turnIndex > 340 && turnIndex <= 390) return 64000;
	else if (turnIndex > 390 && turnIndex <= 440) return 128000;
	else if (turnIndex > 440 && turnIndex <= 490) return 256000;
	else if (turnIndex > 490 && turnIndex <= 540) return 512000;
	else if (turnIndex > 540 && turnIndex <= 590) return 1024000;
	else if (turnIndex > 590 && turnIndex <= 640) return 1000;
    return 1000;
  }
  
  function calcBet3(turnIndex) {
    if (turnIndex <= TURN_DEFAULT) return 1000;
	else if (turnIndex > TURN_DEFAULT && turnIndex <= TURN_DEFAULT * 2) return 2000;
	else if (turnIndex > TURN_DEFAULT * 2 && turnIndex <= TURN_DEFAULT * 3) return 4000;
	else if (turnIndex > TURN_DEFAULT * 3 && turnIndex <= TURN_DEFAULT * 4) return 8000;
	else if (turnIndex > TURN_DEFAULT * 4 && turnIndex <= TURN_DEFAULT * 5) return 16000;
	else if (turnIndex > TURN_DEFAULT * 5 && turnIndex <= TURN_DEFAULT * 6) return 32000;
	else if (turnIndex > TURN_DEFAULT * 6 && turnIndex <= TURN_DEFAULT * 7) return 64000;
	else if (turnIndex > TURN_DEFAULT * 7 && turnIndex <= TURN_DEFAULT * 8) return 50000;
	else if (turnIndex > TURN_DEFAULT * 8 && turnIndex <= TURN_DEFAULT * 9) return 50000;
    return 1000;
  }

    // 🎯 Hàm kiểm tra và cập nhật kết quả
  function runAutoFake() {
	let totalSpent = 0;       // tổng tiền đã dùng
    let totalWin = 0;         // tổng tiền đã trúng
	let result = "";
	let count = 1;
    for (let i = 1; i <= TOTAL_TURNS; i++) {
      const randomNum = Math.floor(Math.random() * 100); // số ngẫu nhiên 0–99
      const betAmount = calcBet3(count);
	  
	  /*if (totalSpent - totalWin > 400000) {
		  result += `Lượt ${i} || Lỗ sấp mặt ở lượt ${count} <br> <br>`;
		  break;
	  }*/
	  
      totalSpent += betAmount;

      // Nếu trúng số
      if (randomNum === YOUR_NUMBER) {
        // ví dụ: trúng gấp 80 lần tiền cược
        const win = betAmount * 98;
        totalWin += win;
		result += `Lượt ${i} trúng số ${YOUR_NUMBER} sau ${count} với số tiền ${formatterMoney.format(betAmount)}: ${formatterMoney.format(win)} || 
					số tiền đã đánh ${formatterMoney.format(totalSpent)} || tiền lời ${formatterMoney.format(totalWin)}<br> <br> `;
		count = 1;
		//if (totalWin - totalSpent > 300000) break;
      } else {
		count++;
	  }
    }

    // 🧾 Cập nhật ra thẻ <p>
    result += `
      Tổng lượt: ${TOTAL_TURNS}<br>
      Số của bạn: ${YOUR_NUMBER}<br>
      Tổng tiền đã dùng: ${totalSpent.toLocaleString()}<br>
      Tổng tiền trúng thưởng: ${totalWin.toLocaleString()}<br>
      Lãi/Lỗ: ${(totalWin - totalSpent).toLocaleString()}<br>
    `;
	result += "==============================================================================<br><br>";
    return result;
  }

  function runAutoFake100() {
	let result = "";
	for (let i = 0; i < 100; i++) {
	  result += runAutoFake();
	}
	document.getElementById("autoFakeResult").innerHTML = result;
  }
  // ⏱ Chạy tự động
  document.getElementById("autoFakeBtn").addEventListener("click", () => runAutoFake100());
  