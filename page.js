

class BetApp {
  constructor() {
	this.LOGIN_URL = "https://k88.win/api/v1/login";
	this.RESULT_URL = "https://api.vgjt.info/ldmd5/games/1/results";

	this.numberList = document.getElementById("numberList");
	this.selectedNumbers = document.getElementById("selectedNumbers");
	this.logArea = document.getElementById("logArea");
	this.successLog = document.getElementById("successLog");

	this.token = null;
	this.tp_token = "";

	this.jobInterval = null;
	this.isRunning = false;

	this.countSelectedNumber = 0;
	this.numbers = [];
	
	this.countTurn = 1;
	this.comp = this;
	this.TURN_DEFAULT = 70;
	
	this.totalSpent = 0;
	this.totalWin = 0;
	
	const tokenInput = document.getElementById("token");
	// Lắng nghe sự kiện thay đổi giá trị
	tokenInput.addEventListener("input", () => {
	  this.tp_token = tokenInput.value;
	  console.log("Giá trị token hiện tại:", this.tp_token);
	});
	  
	document.getElementById("startBtn").addEventListener("click", () => this.startJob());
	document.getElementById("startBtn1").addEventListener("click", () => this.startJob1());
	document.getElementById("stopBtn").addEventListener("click", () => this.stopJob());

	this.render();
  }
  
  render() {
	// Render 100 số (00–99)
	for (let i = 0; i < 100; i++) {
	  const num = i.toString().padStart(2, "0");

	  const label = document.createElement("label");
	  label.className = "num-cell";
	  label.innerHTML = `
		  <input type="checkbox" value="${num}">
		  <span>${num}</span>
		  `;

		// Toggle chọn
	  label.addEventListener("click", (e) => {
	    const checkbox = label.querySelector("input");
	    checkbox.checked = !checkbox.checked;

		if (checkbox.checked) {
		  label.classList.add("selected");
		  this.addRow(num);
		  this.countSelectedNumber++;
		} else {
		  label.classList.remove("selected");
		  this.removeRow(num);
		  this.countSelectedNumber--;
		}
	  });

	  this.numberList.appendChild(label);
	}
  }
	  
	// Start the job multi numbers
    async startJob1() {
	  const selected = document.querySelectorAll(".num-cell input[type='checkbox']:checked");
	  if (selected.length === 0) {
		alert("Vui lòng chọn ít nhất 1 số!");
		return;
	  }
	  
	  if (this.isRunning) return;

	  if (!this.tp_token) {
		await this.login();
	  }

	  this.isRunning = true;

	  // 🕒 Tính thời gian chờ đến phút chẵn + 5 giây
	  const now = new Date();
	  const seconds = now.getSeconds();
	  const delay = ((60 - seconds) + 5) * 1000; // ví dụ đang 12:09:58 → delay = (2 + 5) = 7s

	  const startTime = new Date(now.getTime() + delay);
	  const hh = String(startTime.getHours()).padStart(2, "0");
	  const mm = String(startTime.getMinutes()).padStart(2, "0");
	  const ss = String(startTime.getSeconds()).padStart(2, "0");

	  document.getElementById("messageAuto").textContent = `Sẽ bắt đầu lúc ${hh}:${mm}:${ss}`;
	  document.getElementById("messageAuto").style.color = "blue";

	  // 🕔 Đợi đến giờ phút chẵn + 5 giây
	  setTimeout(async () => {
		logArea.textContent += "=== Bắt đầu công việc ===\n";
		document.getElementById("runningIndicator").classList.add("show");
		
		await this.placeBet(); // chạy lần đầu
		this.jobInterval = setInterval(() => this.placeBet(), 60 * 1000); // sau đó mỗi 60 giây
	  }, delay);
	}

	// Stop the job
	stopJob() {
	  if (this.jobInterval) clearInterval(this.jobInterval);
	  this.isRunning = false;
	  logArea.textContent += "=== Dừng công việc ===\n";
	  document.getElementById("runningIndicator").classList.remove("show");
	}

	addRow(num) {
	  if (document.getElementById(`row-${num}`)) return;
	  const row = document.createElement("tr");
	  row.id = `row-${num}`;
	  row.innerHTML = `
		<td class="border p-2">${num}</td>
		<td class="border p-2"><input type="number" value="1000" class="amount"></td>
		<td class="border p-2"><input type="number" value="40" class="loop-turn"></td>
		<td class="border p-2"><input type="text" class="border p-1 rounded w-full" placeholder="Số dự phòng"></td>
	  `;
	  this.selectedNumbers.appendChild(row);
	}

	removeRow(num) {
	  const row = document.getElementById(`row-${num}`);
	  if (row) row.remove();
	}

	async login() {
	  try {
		const usernameInput = document.getElementById("username");
		const passwordInput = document.getElementById("password");
		const username = usernameInput.value.trim();
		const password = passwordInput.value.trim();
	  
		if (!username || !password) {
		  alert("Nhập thông tin đăng nhập");
		  return;
		}
		const response = await fetch(this.LOGIN_URL, {
		  method: "POST",
		  headers: {
			"Content-Type": "application/json",
			"Accept": "application/json",
		  },
		  body: JSON.stringify({ username, password }),
		});
		
		if (!response.ok) {
		  throw new Error(`HTTP error: ${response.status}`);
		}

		const data = await response.json();
		
		// Nếu API trả về token:
		if (data.data && data.data.length > 0) {
		  this.token = data.data[0].token;
		  this.tp_token = data.data[0].tp_token;
		}
		
		this.logArea.textContent += "=== Đăng nhập thành công ===\n";
	  } catch (err) {
		this.logArea.textContent += "=== Đăng nhập thất bại ===\n";
		console.error("Login failed:", err);
	  }
	}

	// placeBet 1 số
	async placeBet() {
	  const url = `https://api.vgjt.info/ldmd5/user/bet?token=${this.tp_token}`;
	  
	  if (this.numbers.length === 0) {
		const selected = document.querySelectorAll(".num-cell input[type='checkbox']:checked");
	    for (const checkbox of selected) {
	      const number = parseInt(checkbox.value);
	      const row = document.querySelector(`#row-${number}`);
	      const amount = parseInt(row.querySelector(".amount").value) || 1000;
	      this.numbers.push({amount: amount, number: number});
	    }
	  }
	  
	  console.log(this.numbers);
	  
	  let totalAmount = 0;
	  for (let i = 0; i < this.numbers.length; i++) {
		const record = this.numbers[i];
		record.amount = this.calcBet3(this.countTurn);
		totalAmount = totalAmount + record.amount;
	  }
	  
	  try {
		const lastResult = await this.getResult();
		const now = new Date().toLocaleTimeString();
		const firstNumber = this.numbers[0];
		
		if (lastResult === firstNumber.number) {
		  document.getElementById("successSound").play();
		  this.totalWin += firstNumber.amount * 98;
		  this.successLog.textContent += `[${now}] ✅ WIN số ${firstNumber.number} với số tiền ${firstNumber.amount} ở lượt thứ ${this.countTurn} || Tổng lỗ: ${this.totalSpent} || Tổng lời: ${this.totalWin} \n`;
		  if (this.totalWin - this.totalSpent > 500000) this.stopJob();
		  this.countTurn = 1;
		  firstNumber.amount = this.calcBet3(this.countTurn);
		}
		
		const payload = {
		  betTypeId: 9,
		  categoryId: 4,
		  gameId: 1,
		  totalAmount: totalAmount,
		  selectedNumbers: this.numbers
	    };
		
		const res = await fetch(url, {
		  method: "POST",
		  headers: {
			"accept": "application/json, text/plain, */*",
			"content-type": "application/json"
		  },
		  body: JSON.stringify(payload)
		});

		const data = await res.json();
		console.log("Kết quả API:", data);
		
		//TODO: hiển thị thông tin đánh, đánh các số - số tiền - tổng tiền lãi - tổng tiền lỗ
		
		const number = this.numbers[0].number;
		const amount = this.numbers[0].amount;
		
		if (data && data.status === "RUNNING") {
		  this.logArea.textContent += `[${now}] ✅ Đặt số ${number} thành công với số tiền ${amount} ở lượt thứ ${this.countTurn} \n`;
		  this.countTurn++;
		  this.totalSpent += totalAmount;
		} else {
		  this.logArea.textContent += `[${now}] ❌ Số ${number} thất bại --- ${data.msg} \n`;
		}
		
		if (data.code === "004") await this.login();
		return data;

	  } catch (err) {
		console.error("Lỗi:", err);
		return null;
	  }
	}
	
	// Lấy dữ liệu
    async getResult() {
      const url = `${this.RESULT_URL}?type=1&page=1&size=1`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Lỗi khi gọi API trang " + page);
      const json = await response.json();
	  
	  if (json && json.records) {
		const special = json.records[0]?.result?.special;
		return parseInt(special.slice(-2), 10);
	  }
      return -1;
    }
	
	calcBet3(turnIndex) {
	  if (turnIndex <= this.TURN_DEFAULT) return 1000;
	  else if (turnIndex > this.TURN_DEFAULT * 1 && turnIndex <= this.TURN_DEFAULT * 2) return 2000;
	  else if (turnIndex > this.TURN_DEFAULT * 2 && turnIndex <= this.TURN_DEFAULT * 3) return 4000;
	  else if (turnIndex > this.TURN_DEFAULT * 3 && turnIndex <= this.TURN_DEFAULT * 4) return 8000;
	  else if (turnIndex > this.TURN_DEFAULT * 4 && turnIndex <= this.TURN_DEFAULT * 5) return 16000;
	  else if (turnIndex > this.TURN_DEFAULT * 5 && turnIndex <= this.TURN_DEFAULT * 6) return 32000;
	  else if (turnIndex > this.TURN_DEFAULT * 6 && turnIndex <= this.TURN_DEFAULT * 7) return 64000;
	  else if (turnIndex > this.TURN_DEFAULT * 7 && turnIndex <= this.TURN_DEFAULT * 8) return 50000;
	  else if (turnIndex > this.TURN_DEFAULT * 8 && turnIndex <= this.TURN_DEFAULT * 9) return 50000;
	  return 1000;
	}
}


// Khởi động ứng dụng
document.addEventListener("DOMContentLoaded", () => {
  window.betApp = new BetApp();
});

/**
document.getElementById("startBtn1").addEventListener("click", () => {
	  if (running) return;
	  if (countSelectedNumber < 1) {
		alert("Mời chọn 1 số");
		return;
	  }
	  running = true;
	  logArea.textContent += "=== Bắt đầu công việc ===\n";
	  document.getElementById("runningIndicator").classList.add("show");

	  interval = setInterval(() => {
		const random = Math.floor(Math.random() * 100).toString().padStart(2, "0");
		logArea.textContent += `Đang xử lý số ${random}\n`;
		logArea.scrollTop = logArea.scrollHeight;

		if (Math.random() < 0.05) {
		  successLog.textContent += `✅ Số ${random} trúng!\n`;
		  successLog.scrollTop = successLog.scrollHeight;
		  // Phát âm thanh beep
		  playSirenSound();
		}
	  }, 800);
	});

	document.getElementById("stopBtn").addEventListener("click", () => {
	  if (!running) return;
	  running = false;
	  countSelectedNumber = 0;
	  document.getElementById("runningIndicator").classList.remove("show");
	  clearInterval(interval);
	  logArea.textContent += "=== Dừng công việc ===\n";
	});
*/
