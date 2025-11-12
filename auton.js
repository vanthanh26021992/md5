

class BetAppAutoN {
  constructor() {
	this.LOGIN_URL = "https://k88.win/api/v1/login";
	this.RESULT_URL = "https://api.vgjt.info/ldmd5/games/1/results";

	this.numberList = document.getElementById("numberListN");
	this.selectedNumbers = document.getElementById("selectedNumbersN");
	this.logArea = document.getElementById("logAreaN");
	this.successLog = document.getElementById("successLogN");

	this.token = null;
	this.tp_token = "";

	this.jobInterval = null;
	this.isRunning = false;

	this.countSelectedNumber = 0;
	this.numbers = [];
	this.storedNumbers = [];
	
	this.countTurn = 1;
	this.comp = this;
	this.TURN_DEFAULT = 50;
	this.selectedAmount = 1000;
	
	this.totalSpent = 0;
	this.totalWin = 0;
	this.formatter = this.formatter();
	this.betType = "1";
	
	this.logArea.textContent += `[${new Date().toLocaleTimeString()}] ❌ Dùng công thức ${this.betType}\n`;
	
	const tokenInput = document.getElementById("tokenN");
	tokenInput.addEventListener("input", () => {
	  this.tp_token = tokenInput.value;
	  console.log("Giá trị token hiện tại:", this.tp_token);
	});
	
	const betTypeGroup = document.getElementById("betTypeGroupN");
	betTypeGroup.addEventListener("change", (event) => {
	  if (event.target.name === "betTypeN") {
		const selectedValue = event.target.value;
		this.betType = selectedValue;
		this.logArea.textContent += `[${new Date().toLocaleTimeString()}] ❌ Chuyển qua dùng công thức ${this.betType}\n`;
	  }
	});

	document.addEventListener("click", (event) => {
	  const number = event.target.dataset.number;
	  
	  if (event.target.classList.contains("backup-stop")) {
		const row = document.querySelector(`#row-N-${number}`);
	    const backup = row.querySelector(".backup-numberN").value;
		this.stopNumber(number, backup);
		
	  } else if (event.target.classList.contains("backup-update")) {
		const row = document.querySelector(`#row-N-${number}`);
	    const backup = row.querySelector(".backup-numberN").value;
		this.updateNumber(number, backup);
	  }
	});
	
	document.getElementById("startBtn1N").addEventListener("click", () => this.startJob1());
	document.getElementById("stopBtnN").addEventListener("click", () => this.stopJob());

	this.render();
  }
  
  render() {
	// Render 100 số (00–99)
	for (let i = 0; i < 100; i++) {
	  const num = i.toString().padStart(2, "0");

	  const label = document.createElement("label");
	  label.className = "num-cell-N";
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
	  const selected = document.querySelectorAll(".num-cell-N input[type='checkbox']:checked");
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

	  document.getElementById("messageAutoN").textContent = `Sẽ bắt đầu lúc ${hh}:${mm}:${ss}`;
	  document.getElementById("messageAutoN").style.color = "blue";

	  // 🕔 Đợi đến giờ phút chẵn + 5 giây
	  setTimeout(async () => {
		this.logArea.textContent += "=== Bắt đầu công việc ===\n";
		document.getElementById("runningIndicatorN").classList.add("show");
		
		await this.placeBet(); // chạy lần đầu
		this.jobInterval = setInterval(() => this.placeBet(), 60 * 1000); // sau đó mỗi 60 giây
	  }, delay);
	}

	// Stop the job
	stopJob() {
	  if (this.jobInterval) clearInterval(this.jobInterval);
	  this.isRunning = false;
	  this.logArea.textContent += "=== Dừng công việc ===\n";
	  document.getElementById("runningIndicatorN").classList.remove("show");
	}

	addRow(num) {
	  let addRowEle = document.getElementById(`row-N-${num}`);
	  if (addRowEle) return;
	  const row = document.createElement("tr");
	  row.id = `row-N-${num}`;
	  row.innerHTML = `
		<td class="border p-2">${num}</td>
		<td class="border p-2"><input type="number" value="1000" class="amountN"></td>
		<td class="border p-2"><input type="number" value="50" class="loop-turnN"></td>
		<td class="border p-2"><input type="text" class="backup-numberN" placeholder="Số dự phòng"></td>
		<td class="border p-2">
		  <button class="backup-stop" data-number="${num}">Stop</button>
		  <button class="backup-update" data-number="${num}">Update</button>
		</td>
	  `;
	  this.selectedNumbers.appendChild(row);
	}

	removeRow(num) {
	  const row = document.getElementById(`row-N-${num}`);
	  if (row) row.remove();
	}
	
	stopNumber(number, newNumber) {
	  this.numbers = this.numbers.filter(object => object.number !== number);
	  if (newNumber) this.numbers = this.numbers.filter(object => object.number !== newNumber);
	  
	  let addRowEle = document.getElementById(`row-N-${number}`);
	  addRowEle.classList.add("highlight-orange");
			
	  alert(`Đã dừng số ${number}`);
	  console.log(this.numbers);
	  if (this.numbers.length === 0) {
		this.stopJob();
	  }
	}

	updateNumber(number, newNumber) {
	  if (!newNumber) {
		alert(`Mời bạn nhập số mới thay thế cho ${number}`);
		return;
	  }
	  
	  for (let i = 0; i < this.numbers.length; i++) {
		const record = this.numbers[i];
		if (newNumber === record.number) {
		  alert(`Số ${newNumber} đã có trong danh sách`);
		  return;
		}
	  }
	  
	  for (let i = 0; i < this.numbers.length; i++) {
		const record = this.numbers[i];
		if (number === record.number) {
		  record.number = newNumber || number;
		  let addRowEle = document.getElementById(`row-N-${number}`);
		  addRowEle.classList.add("highlight-update");
		  alert(`Đã đổi số ${number} thành ${newNumber}`);
		  break;
		}
	  }
	  console.log(this.numbers);
	}

	async login() {
	  try {
		const usernameInput = document.getElementById("usernameN");
		const passwordInput = document.getElementById("passwordN");
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
		const selected = document.querySelectorAll(".num-cell-N input[type='checkbox']:checked");
		
		for (let i = 0; i < selected.length; i++) {
		  const  el = selected[i];
		  const number = el.value;
		  this.numbers.push({amount: this.selectedAmount, number: number});
		  
		  if (i === 0) {
			const row = document.querySelector(`#row-N-${number}`);
			this.TURN_DEFAULT = parseInt(row.querySelector(".loop-turnN").value) || 50;
		  }
		}
	  }
	  
	  console.log("TURN_DEFAULT ", this.TURN_DEFAULT);
	  console.log(this.numbers);
	  
	  try {
		const lastResult = await this.getResult();
		const now = new Date().toLocaleTimeString();
		let matched = false;
		for (let i = 0; i < this.numbers.length; i++) {
		  const object = this.numbers[i];
		  if (lastResult === object.number) {
			matched = true;
		    document.getElementById("successSound").play();
			this.totalWin += object.amount * 98;
			this.successLog.textContent += `[${now}] ✅ WIN số ${object.number} với số tiền ${this.formatter.format(object.amount)} ở lượt thứ ${this.countTurn - 1} || Tổng lỗ: ${this.formatter.format(this.totalSpent)} || Tổng lời: ${this.formatter.format(this.totalWin)} || Lợi nhuận: ${this.formatter.format(this.totalWin - this.totalSpent)}\n\n`;
			  
			const input = document.getElementById("desiredMoneyN");
			const value = Number(input.value);
			if (this.totalWin - this.totalSpent > value) {
			  this.stopJob();
			  return;
			}
			
			let addRowEle = document.getElementById(`row-N-${lastResult}`);
		    addRowEle.classList.add("highlight-green");
			break;
		  }
		}
		
		if (matched) {
		  this.numbers = this.numbers.filter(object => object.number !== lastResult);
		}
		if (this.numbers.length === 0) {
		  this.stopJob();
		  return;
		}
		
		let totalAmount = 0;
		let numberPrint = [];
		for (let i = 0; i < this.numbers.length; i++) {
		  const record = this.numbers[i];
		  record.amount = this.calcBet(this.countTurn, this.selectedAmount);
		  totalAmount = totalAmount + record.amount;
		  numberPrint.push(record.number);
		}
		
		console.log(this.numbers);
	
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
		
		const number = this.numbers[0].number;
		const amount = this.numbers[0].amount;
		
		if (data && data.status === "RUNNING") {
		  this.logArea.textContent += `[${now}] ✅ Đặt số ${numberPrint.toString()} thành công với số tiền ${this.formatter.format(amount)} ở lượt thứ ${this.countTurn} \n`;
		  this.countTurn++;
		  this.totalSpent += totalAmount;
		} else {
		  this.logArea.textContent += `[${now}] ❌ Số ${numberPrint.toString()} thất bại --- ${data.msg} \n`;
		}
		
		if (data.code === "004") await this.login();
		return data;

	  } catch (err) {
		console.error("Lỗi:", err);
		return null;
	  }
	}
	
	calcBet(turnIndex, amount) {
	  if (this.betType === "1") return this.calcBet1(turnIndex, amount);
	  else if (this.betType === "2") return this.calcBet2(turnIndex);
	  else if (this.betType === "3") return this.calcBet3(turnIndex);
	  else if (this.betType === "5") return this.calcBet4(turnIndex);
	  else return this.calcBet1(turnIndex, amount);
	}
	
	calcBet1(turnIndex, amount) {
	  if (turnIndex <= this.TURN_DEFAULT) return amount * 1;
	  else if (turnIndex > this.TURN_DEFAULT * 1 && turnIndex <= this.TURN_DEFAULT * 2) return amount * 2;
	  else if (turnIndex > this.TURN_DEFAULT * 2 && turnIndex <= this.TURN_DEFAULT * 3) return amount * 4;
	  else if (turnIndex > this.TURN_DEFAULT * 3 && turnIndex <= this.TURN_DEFAULT * 4) return amount * 8;
	  else if (turnIndex > this.TURN_DEFAULT * 4 && turnIndex <= this.TURN_DEFAULT * 5) return amount * 16;
	  else if (turnIndex > this.TURN_DEFAULT * 5 && turnIndex <= this.TURN_DEFAULT * 6) return amount * 32;
	  else if (turnIndex > this.TURN_DEFAULT * 6 && turnIndex <= this.TURN_DEFAULT * 7) return amount * 64;
	  else if (turnIndex > this.TURN_DEFAULT * 7 && turnIndex <= this.TURN_DEFAULT * 8) return amount * 50;
	  else if (turnIndex > this.TURN_DEFAULT * 8 && turnIndex <= this.TURN_DEFAULT * 9) return amount * 50;
	  return amount;
	}
	
	calcBet2(turnIndex, amount) {
	  if (turnIndex <= 70) return 1000;
	  else if (turnIndex > 70 && turnIndex <= 140) return 2000;
	  else if (turnIndex > 140 && turnIndex <= 210) return 4000;
	  else if (turnIndex > 210 && turnIndex <= 300) return 1000;
	  else if (turnIndex > 300 && turnIndex <= 370) return 8000;
	  else if (turnIndex > 370 && turnIndex <= 440) return 16000;
	  else if (turnIndex > 440 && turnIndex <= 510) return 32000;
	  return 1000;
	}
	
	calcBet3(turnIndex) {
	  if (turnIndex <= this.TURN_DEFAULT) {
		return 1000;
	  } else if (turnIndex > this.TURN_DEFAULT * 1 && turnIndex <= this.TURN_DEFAULT * 2) {
		return 2000;
	  } else if (turnIndex > this.TURN_DEFAULT * 2 && turnIndex <= this.TURN_DEFAULT * 3) {
		return 4000;
	  } else if (turnIndex > this.TURN_DEFAULT * 3 && turnIndex <= this.TURN_DEFAULT * 4) {
		if (turnIndex % 2 === 0) return 8000;
	  } else if (turnIndex > this.TURN_DEFAULT * 4 && turnIndex <= this.TURN_DEFAULT * 5) {
		if (turnIndex % 2 === 0) return 16000;
	  } else if (turnIndex > this.TURN_DEFAULT * 5 && turnIndex <= this.TURN_DEFAULT * 6) {
		if (turnIndex % 2 === 0) return 32000;
	  } else if (turnIndex > this.TURN_DEFAULT * 6 && turnIndex <= this.TURN_DEFAULT * 7) {
		if (turnIndex % 2 === 0) return 64000;
	  } else if (turnIndex > this.TURN_DEFAULT * 7 && turnIndex <= this.TURN_DEFAULT * 8) {
		if (turnIndex % 2 === 0) return 128000;
	  } else if (turnIndex > this.TURN_DEFAULT * 8 && turnIndex <= this.TURN_DEFAULT * 9) {
		if (turnIndex % 2 === 0) return 256000;
	  }
	  return 1000;
	}
	
	calcBet4(turnIndex) {
	  if (turnIndex <= 100) return 1000;
	  else if (turnIndex > 100 && turnIndex <= 150) return 2000;
	  else if (turnIndex > 150 && turnIndex <= 200) return 4000;
	  else if (turnIndex > 200 && turnIndex <= 250) return 8000;
	  else if (turnIndex > 250 && turnIndex <= 300) return 16000;
	  else if (turnIndex > 300 && turnIndex <= 350) return 32000;
	  else if (turnIndex > 350 && turnIndex <= 400) return 64000;
	  return 1000;
	}
	
	// Lấy dữ liệu
    async getResult() {
      const url = `${this.RESULT_URL}?type=1&page=1&size=1`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Lỗi khi gọi API trang " + page);
      const json = await response.json();
	  
	  if (json && json.records) {
		const special = json.records[0]?.result?.special;
		return special.slice(-2);
	  }
      return "";
    }
	
	formatter() {
	  return new Intl.NumberFormat('vi-VN', {
		style: 'decimal',
	  });
	}
}


// Khởi động ứng dụng
document.addEventListener("DOMContentLoaded", () => {
  window.betAppAutoN = new BetAppAutoN();
});
