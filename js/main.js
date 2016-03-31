"use strict";

var itp = itp || {};
	
	itp._config = {
		rCount: 20,
		cCount: 20,
		cell: { width: 100, height: 30 },	// px;
		sheets: [ "Лист 1", "Лист 2", "Лист 3", "Лист 4" ]
	}

	itp.init = function () {
		var rCountInput = document.querySelector('#rCount'),
			cCountInput = document.querySelector('#cCount');
			
		rCountInput.value = itp._config.rCount;
		cCountInput.value = itp._config.cCount;

		document.querySelector('#btnCreate').addEventListener("click", function () {
			itp.rCount = rCountInput.value;
			itp.cCount = cCountInput.value;
			itp._createTabs();
		//	itp._clickTabs();
			itp._createTables();
		});
	}

	itp._createTabs = function () {
		var tab,
			sheetsTab = document.querySelector("div.sheetsTab");

		if (itp._isCreate) return "_isCreate";
		itp._config.sheets.forEach( function (el, i) {
			tab = document.createElement("a");
			tab.href = "#";
			tab.innerHTML = "<span" + ( (!i) ? " class='active'" : "" ) + ">" + el + "</span>";
			sheetsTab.appendChild(tab);
		//	console.log(tab);
		});
		itp._clickTabs();
	}

	itp._clickTabs = function () {
		var allTabs = [].slice.call(document.querySelectorAll(".sheetsTab a span"));
	//	var allTabs = document.querySelectorAll(".sheetsTab a span");

	//	if (itp._isCreate) return "_isCreate";
		allTabs.forEach(function(tab) {
			tab.onclick	= function (e) {
				var tabs = document.querySelectorAll(".sheetsTab a span");
				[].slice.call(tabs).forEach(function(item) {
				 	item.classList.remove("active"); 
				});
				e.target.classList.add("active");
				return false;
			}
		});
	}
		
	itp._createTables = function () {
		var r, c, scrlSize = 16;

		itp.table = document.querySelector('#itpTable');
		itp.tableCol = document.querySelector('#itpTableCol');
		itp.tableRow = document.querySelector('#itpTableRow');
		itp.tbody = itp.table.getElementsByTagName('tbody')[0];

		if (itp._isCreate) { alert("Таблица уже создана!"); }
		else {
			itp.table.width  = itp.cCount * itp._config.cell.width + scrlSize + "px";
			itp.table.height = itp.rCount * itp._config.cell.height + scrlSize + "px";
			itp.tableCol.width = itp.table.width;
			itp.tableRow.height = itp.table.height;

			for (r = 0; r < itp.rCount; r++) {
				itp.tbody.insertRow(r);
				itp.tableRow.insertRow(r).insertCell(0).outerHTML = "<th>" + (r + 1) + "</th>";

				for (c = 0; c < itp.cCount; c++) {
					if (r === 0) { 
						if (c === 0 ) { itp.tableCol.insertRow(0) };
						itp.tableCol.rows[0].insertCell(c).outerHTML = "<th>" + itp._colName(c) + "</th>";
					 }
					itp.tbody.rows[r].insertCell(c);
				}
			}

			itp.table.addEventListener("click", itp._clickGrid);

			document.querySelector('.table').onscroll = function() {
				var needAddC = this.scrollWidth - (this.clientWidth + this.scrollLeft),
					needAddR = this.scrollHeight - (this.clientHeight + this.scrollTop);

				itp.tableRow.style.top  = -this.scrollTop  + "px";
				itp.tableCol.style.left = -this.scrollLeft + "px";

				if (needAddC < itp._config.cell.width) itp._addCol(1);
				if (needAddR < itp._config.cell.height) itp._addRow(1);
			}

			itp._isCreate = true;	// отслеживает, была ли создана таблица
			document.querySelector('main').style.display = "block";

		}
	}

	itp._clickGrid = function (e) {		// при нажатии на ячейку
		var input; 

		if (e.target.nodeName === "TD") {
			e.target.className = "input";
			input = document.createElement("input");
			input.className = "inGrid";
			input.value = e.target.innerHTML;

			input.onblur = function () {
				this.parentNode.classList.remove("input");	//	можно так:	this.parentNode.class = "";
				this.parentNode.innerHTML = this.value;
			};

			input.onkeyup = function (e) {
				if (e.keyCode === 13) this.blur();
			}

			e.target.innerHTML = "";
			e.target.appendChild(input);
			input.focus();
		}
	}

	itp._addRow = function (n) {
		var c;

		itp.tbody.insertRow(itp.rCount);
		itp.tableRow.insertRow(itp.rCount).insertCell(0).outerHTML = "<th>" + (+itp.rCount + 1) + "</th>";

		for (c = 0; c < itp.cCount; c++) {
			itp.tbody.rows[itp.rCount].insertCell(c);
		}
	
		itp.rCount++;
		itp.table.height = (itp.table.scrollHeight + itp._config.cell.height) + "px";
		itp.tableRow.height = itp.table.height;
	}

	itp._addCol = function (n) {
		var r;

		itp.tableCol.rows[0].insertCell(itp.cCount).outerHTML = "<th>" + itp._colName(itp.cCount) + "</th>";

		for (r = 0; r < itp.rCount; r++) {
			itp.tbody.rows[r].insertCell(itp.cCount);
		}

		itp.cCount++;
		itp.table.width = (itp.table.scrollWidth + itp._config.cell.width) + "px";
		itp.tableCol.width = itp.table.width;	
	}

	itp._colName = function (n) {		
		var startChar = "A",
			endChar = "Z",
			chCount = endChar.charCodeAt(0) - startChar.charCodeAt(0) + 1,
			arr = [];

		function getChar(i) { return String.fromCharCode(startChar.charCodeAt(0) + i) }

		(function decomposition(N, base) {		// подумать, может base убрать?? (использовать сразу chCount)
			var temp = Math.floor(N / base);

			if (!temp) { arr.unshift( getChar(N) ); }
			else {
				arr.unshift( getChar(N % base) );
				decomposition( temp - 1, base );
			}
		})(n, chCount);

		return arr.join("");
	}



document.addEventListener("DOMContentLoaded", itp.init);














	