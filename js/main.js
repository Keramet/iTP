"use strict";

var itp = itp || {};
	
	itp._config = {
		rCount: 20,
		cCount: 20,
		scrollSize: 16,		// px
		cell: { width: 100, height: 30 },	// px;
		sheets: [ "Лист 1", "Лист 2", "Лист 3", "Лист 4" ]
	}

	itp.init = function () {
		var rCountInput = document.querySelector('#rCount'),
			cCountInput = document.querySelector('#cCount');
			
		rCountInput.value = itp._config.rCount;
		cCountInput.value = itp._config.cCount;

		itp.data = [];	// листы

		document.querySelector('#btnCreate').addEventListener("click", function () {
			itp.rCount = +rCountInput.value;
			itp.cCount = +cCountInput.value;
			itp._createTabs();
			itp._createTables();
		});

		document.querySelector('#btnGetJSON').addEventListener("click", function () {
			itp._getJSONData('http://keramet.kh.ua/json.php',  function () {
    			document.querySelector('#outputJSON').innerHTML = JSON.stringify(itp.JSONdata);
			});
		});
	}

	itp._createTabs = function () {
		var tab, sheetsTab = document.querySelector("div.sheetsTab");

		if (itp._isCreate) return "_isCreate";
		itp._config.sheets.forEach( function (el, i) {
			itp.data[i] = { name: el };	
			tab = document.createElement("a");
			tab.href = "#";
			tab.innerHTML = "<span" + ( (!i) ? " class='active'" : "" ) + ">" + el + "</span>";
			sheetsTab.appendChild(tab);
		});

		if ( !itp.aSh ) {	//	ссылка на активный лист
			itp.aSh = itp.data[0];		
			itp.aShIndex = 0;			//  индекс АЛ в массиве itp.data
			itp.data[0]["active"] = true;
		}

		itp._clickTabs();
	}

	itp._clickTabs = function () {
		var allTabs = [].slice.call(document.querySelectorAll(".sheetsTab a span"));

		allTabs.forEach( function (tab) {
			tab.onclick	= function (e) {
				var t = Date.now();
				var tabs = document.querySelectorAll(".sheetsTab a span");

				if ( e.target.classList.contains("active") ) return;

				[].slice.call(tabs).forEach( function (item, i) {
				 	item.classList.remove("active"); 
				 	if (itp.data[i].active) { itp.data[i].active = false; } 	// нужна ли проверка? (сразу itp.data[i].active = false; )
				 	if (item === e.target) { 
				 		itp.data[i].active = true;
				 		itp.aSh = itp.data[i];
				 		itp.aShIndex = i;
				 	}
				});
				e.target.classList.add("active");

				itp._clearTables();
				itp._fillSheet();
			//	console.log( itp.data );
				console.log( Date.now() - t );

				return false;
			}
		});
	}
		
	itp._createTables = function () {

		itp.table = document.querySelector('#itpTable');
		itp.tableCol = document.querySelector('#itpTableCol');
		itp.tableRow = document.querySelector('#itpTableRow');
		itp.tbody = itp.table.getElementsByTagName('tbody')[0];

		if (itp._isCreate) { alert("Таблица уже создана!"); }
		else {
			itp._fillSheet();
		/*
			itp.table.width  = itp.cCount * itp._config.cell.width + itp._config.scrollSize + "px";
			itp.table.height = itp.rCount * itp._config.cell.height + itp._config.scrollSize + "px";
			itp.tableCol.width = itp.table.width;
			itp.tableRow.height = itp.table.height;

			
			if (!itp.aSh.cells) {
				itp.aSh.cells = {};
				itp.aSh.rCount = itp.rCount;
				itp.aSh.cCount = itp.cCount;
			}

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
		*/

			itp.table.addEventListener("click", itp._clickGrid);
			itp.table.addEventListener("dblclick", itp._dblclickGrid);
			document.body.addEventListener("keyup", itp._keyup, true);
		//	itp.table.addEventListener("keyup", itp._keyup);

				
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

	itp._fillSheet = function () {
		var r, c, cell;

		if ( !itp.aSh ) alert("Нет активного листа!");

		if ( !itp.aSh.cells ) {
			itp.aSh.cells = {};
			itp.aSh.rCount = itp._config.rCount;
			itp.aSh.cCount = itp._config.cCount;
		}	

		itp.table.width  = itp.aSh.cCount * itp._config.cell.width + itp._config.scrollSize + "px";
		itp.table.height = itp.aSh.rCount * itp._config.cell.height + itp._config.scrollSize + "px";
		itp.tableCol.width = itp.table.width;
		itp.tableRow.height = itp.table.height;

		for (r = 0; r < itp.aSh.rCount; r++) {
			itp.tbody.insertRow(r);
			itp.tableRow.insertRow(r).insertCell(0).outerHTML = "<th>" + (r + 1) + "</th>";

			for (c = 0; c < itp.aSh.cCount; c++) {
				if (r === 0) { 
					if (c === 0 ) { itp.tableCol.insertRow(0) };
					itp.tableCol.rows[0].insertCell(c).outerHTML = "<th>" + itp._colName(c) + "</th>";
				}
				cell = itp._colName(c) + (r + 1);
				itp.tbody.rows[r].insertCell(c).innerHTML = itp.aSh.cells[cell] ? itp.aSh.cells[cell] : "";
			}
		}
	}

	itp._clearTables = function () {
		itp.tableCol.innerHTML = "";
		itp.tableRow .innerHTML = "";
		itp.tbody.innerHTML = "";
	}


		// может, лучше хранить ссылку на активный лист вместо функции определения АЛ ??
	itp.activeSheet = function () {		
		var n;

		itp.data.forEach( function (el, i) {
			if (el.active) { n = i; }
		});
		return n;
	}

	itp._clickGrid = function (e) { 
		if (e.target.nodeName === "TD") { 
			e.target.classList.toggle("selected");
			
		}
	}

	itp._dblclickGrid = function (e) {		// при нажатии на ячейку
		var input; 

		if (e.target.nodeName === "TD") {
			e.target.className = "input";
			input = document.createElement("input");
			input.className = "inGrid";
			input.value = e.target.innerHTML;

			input.onblur = function () {
				var cell = itp._colName(e.target.cellIndex) + (e.target.parentNode.rowIndex + 1);

				this.parentNode.classList.remove("input");	//	можно так:	this.parentNode.class = "";
				this.parentNode.innerHTML = this.value;
				itp.aSh.cells[cell] = this.value;
				
				console.log( "cells[" + cell + "] = " + this.value);
				console.dir(itp.aSh);
			};

			input.onkeyup = function (e) {
				if (e.keyCode === 13) this.blur();
			}

			e.target.innerHTML = "";
			e.target.appendChild(input);
			input.focus();
		}
	}

	itp._keyup = function (e) {
		var td = document.querySelector('td.selected:hover');

	//	console.log(e.target.nodeName);
	//	console.log(e.target);
	//	console.log(e.currentTarget);

		if (td) { console.log(td); }
	}

	
	itp._addRow = function (n) {	
		var c;

		itp.tbody.insertRow(itp.aSh.rCount);
		itp.tableRow.insertRow(itp.aSh.rCount).insertCell(0).outerHTML = "<th>" + (itp.aSh.rCount + 1) + "</th>";

		for (c = 0; c < itp.aSh.cCount; c++) {
			itp.tbody.rows[itp.aSh.rCount].insertCell(c);
		}
	
		itp.aSh.rCount++;
		itp.table.height = (itp.table.scrollHeight + itp._config.cell.height) + "px";
		itp.tableRow.height = itp.table.height;
	}

	itp._addCol = function (n) {
		var r;

		itp.tableCol.rows[0].insertCell(itp.aSh.cCount).outerHTML = "<th>" + itp._colName(itp.aSh.cCount) + "</th>";

		for (r = 0; r < itp.aSh.rCount; r++) {
			itp.tbody.rows[r].insertCell(itp.aSh.cCount);
		}

		itp.aSh.cCount++;
		itp.table.width = (itp.table.scrollWidth + itp._config.cell.width) + "px";
		itp.tableCol.width = itp.table.width;	
	}

	itp._colName = function (n) {		
		var startChar = "A",  endChar = "Z",
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

	itp._getJSONData = function (path, callback) {
   		var httpRequest = new XMLHttpRequest();

  		httpRequest.onreadystatechange = function () {
        	if (httpRequest.readyState === 4) {
            	if (httpRequest.status === 200) {
                	itp.JSONdata = JSON.parse(httpRequest.responseText);
                	if (callback) { callback(); }
           		}
       		}
		};
		httpRequest.open('GET', path);
		httpRequest.send(); 
	}





document.addEventListener("DOMContentLoaded", itp.init);













	