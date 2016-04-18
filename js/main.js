"use strict";

var itp = itp || {};
	
	itp._config = {
		rCount: 	20,
		cCount: 	20,
		scrollSize: 16,		// px
		cell: 		{ width: 100, height: 30 },	// px;
		sheets: 	[], //[ "Лист 1", "Лист 2", "Лист 3" ],	// убрать?
		hideSheets: true,
		colChars: 	{ start: "A", end: "Z" }
	}


	itp.init = function () {
		var rCountInput  = document.querySelector('#rCount'),
			cCountInput  = document.querySelector('#cCount'),
			shCountInput = document.querySelector('#shCount'),
			select 		 = document.querySelector('select');


		itp.inputCell = document.querySelector('input.formula.cell');
			
		document.querySelector('select').selectedIndex = itp._config.hideSheets ? 1 : 0;
			
		rCountInput.value = itp._config.rCount;
		cCountInput.value = itp._config.cCount;
		shCountInput.value = 3;	// itp._config.sheets.length;
	
	//	itp.data =  localStorage.dataLS? JSON.parse(localStorage.dataLS) : [];	// листы

		document.querySelector('#btnCreate').addEventListener("click", function () {
			var i;
			itp.rCount  = +rCountInput.value;
			itp.cCount  = +cCountInput.value;
			itp.shCount = +shCountInput.value;

			itp.data = [];
			for (i = 0; i < itp.shCount; i++) {
				itp._config.sheets.push("Лист " + (i+1));
				itp.data[i] = { name: itp._config.sheets[i] };
			}
			console.log(itp._config.sheets);
		//	itp._config.sheets.forEach( function (el, i) {
		//		itp.data[i] = { name: el };	
		//	});
			itp.aShIndex = 0;	
			itp.aSh = itp.data[ itp.aShIndex ];		
			itp.aSh["active"] = true;
			itp._config.hideSheets = document.querySelector('select').selectedIndex ? true : false ;

			itp._createTabs();
		});

		document.querySelector('#btnRestore').addEventListener("click", function () {
			itp.data 	 = JSON.parse( localStorage.dataLS );
			itp.aShIndex = itp.activeSheet();
			itp.aSh 	 = itp.data[ itp.aShIndex ];	
			itp._config.hideSheets = document.querySelector('select').selectedIndex ? true : false ;

			itp._createTabs();
		});

		document.querySelector('#btnGetJSON').addEventListener("click", function () {
			itp._getJSONData('http://keramet.kh.ua/itpGetJSON.php',  function () {
				var output = document.querySelector("#outputCurrentState");
    			console.log( JSON.stringify(itp.JSONdata) );
    			output.innerHTML = 	"<b>JSON from server: </b>  см. Консоль...";
				setTimeout(function () { output.innerHTML = ""; }, 3000);
			});
		});

	}		//	end of  itp.init

	itp._createTabs = function () {
		var tab, sheet, 
			sheetsTab = document.querySelector("div.sheetsTab"),
			main = document.querySelector("main"),
			sheetInnerHTML = document.querySelector("div.sheet").innerHTML;		// может, как-то подключить шаблон

		if (itp._isCreate) {
			alert ("Таблица уже создана. Для пересоздания обновите страницу!");
			return "_isCreate";
		}

		tab = document.createElement("a");	// заменить функцией createTabNew()
		tab.href = "#";
		tab.title = "Добавить новый лист";
		tab.innerHTML = "<span class='addSheet'><b> + </b></span>";
		tab.onclick = function () {
			alert("Пока не работает :( ");
			return	false;
		}
		sheetsTab.appendChild(tab); 		// end of  createTabNew()

		itp.data.forEach( function (el, i) {
			tab = document.createElement("a");
			tab.href = "#";
			tab.innerHTML = "<span" + ( el.active ? " class='active'" : "" ) + ">" + el.name + "</span>";
			tab.onclick = itp._onclickTab;
			sheetsTab.appendChild(tab);

			if (itp._config.hideSheets) {	
				if (i) {						// создаём дивы для листов (при скрытии)
					sheet = document.createElement("div");
					sheet.className = 'sheet';
					sheet.id = "sh-" + i;
					sheet.innerHTML = sheetInnerHTML;
					main.appendChild(sheet);
				}
				itp._createSheets(i);
				if (el.active) { document.getElementById('sh-' + i).classList.add("active"); }
			}
		});	

		if ( !itp._config.hideSheets ) {
			document.getElementById('sh-0').classList.add("active");
			itp._createSheets();
		}

		itp._isCreate = true;
	}


	itp._onclickTab = function (e) {
		console.time("Смена листа: ");
		var	tabs = document.querySelectorAll(".sheetsTab a span:not(.addSheet)");

		if ( e.target.classList.contains("active") ) return;

		[].slice.call(tabs).forEach( function (item, i) {
		 	item.classList.remove("active"); 
		 	if (itp.data[i].active) { itp.data[i].active = false; } 	// нужна ли проверка? (сразу itp.data[i].active = false; )
		 	
		 	if (item === e.target) {
		 		if ( itp._config.hideSheets ) {
		 			document.getElementById('sh-' + itp.aShIndex).classList.remove("active");
		 			document.getElementById('sh-' + i).classList.add("active");
		 		} 
		 		itp.data[i].active = true;
		 		itp.aSh = itp.data[i];
		 		itp.aShIndex = i;
		 	}
		});
		
		itp.inputCell.value = "";
		e.target.classList.add("active");

		if ( !itp._config.hideSheets ) {
			itp._clearSheet();
			itp._createSheets();
		}

	//	itp._saveToLS();

		console.timeEnd("Смена листа: ");
		return false;
	}

	
	itp._createSheets = function (sheetIndex) {
		var sheetIndex = sheetIndex || 0,
			sheet = document.getElementById("sh-" + sheetIndex),
			tableCol = sheet.querySelector('.itpTableCol'),
			tableRow = sheet.querySelector('.itpTableRow'),
			tableGrid = sheet.querySelector('.itpTable'),
			tbodyGrid = tableGrid.getElementsByTagName('tbody')[0];
		//	tbodyGrid;
		
		//tbodyGrid = document.createElement("tbody");

		if ( !tableCol.rows.length ) {		// были ли для этого дива созданы таблицы 
			itp._config.hideSheets ? __fillSheet(sheetIndex) : __fillSheet(itp.aShIndex);

		//	tableGrid.addEventListener("click", __clickGrid);
		//	tableGrid.addEventListener("dblclick", __dblclickGrid);

			tableGrid.onclick 	 = __clickGrid;
			tableGrid.ondblclick = __dblclickGrid;
			tableGrid.onselectstart = function () { return false };	//	отмена выделения текста

			tableGrid.onmousedown = function (e) {
				if (e.target.nodeName === "TD") {
					__unSelect();
					itp.selMode = true;
					itp.selStartR = e.target.parentNode.rowIndex + 1;
					itp.selStartC = e.target.cellIndex + 1;
				//	console.log("нажата кнопка. ");
				//	console.dir(e.target);
				} 
			}

			tableGrid.onmouseup = function (e) {
				var sel, selector, range, cell;
				if (e.target.nodeName === "TD" && itp.selMode) {
					itp.selEndR = e.target.parentNode.rowIndex + 1;
					itp.selEndC = e.target.cellIndex + 1;
					if (itp.selEndR !== itp.selStartR || itp.selEndC !== itp.selStartC) {	// проверка, что выбрана больше, чем 1 ячейка
						checkStartEnd();
						selector = "tr:nth-child(n+" + itp.selStartR + "):not(:nth-child(n+" + (itp.selEndR+1) + ")) " +
							   	   "td:nth-child(n+" + itp.selStartC + "):not(:nth-child(n+" + (itp.selEndC+1) + "))";
						range = document.querySelector("div.sheet.active").querySelectorAll(selector);
						[].forEach.call(range, function (cell) {
							cell.classList.add("selected");
						});

					/*	
						sel = document.getSelection();
						console.dir(sel.anchorNode);
						console.dir(sel.focusNode);	*/
					}
					itp.selMode = false;
				}

				function checkStartEnd() {		// если  выделение начато с нижнего угла
					var temp;

					if (itp.selStartR > itp.selEndR) {
						temp = itp.selStartR;
						itp.selStartR = itp.selEndR;
						itp.selEndR = temp;
					}
					if (itp.selStartC > itp.selEndC) {
						temp = itp.selStartC;
						itp.selStartC = itp.selEndC;
						itp.selEndC = temp;
					}
				}
				
			}

			tableGrid.onmousemove = function (e) {
			//	if (itp.selMode) console.dir(e.target);
			}



			sheet.querySelector('.table').onscroll = __onScroll;

			tableCol.onclick = __clickTH; //__clickTHCol;
			tableRow.onclick = __clickTH; //__clickTHCol;
		}


		function __fillSheet(n) {
			console.time("__fillSheet (" + n + "): ");
			var r, c, cell;

			if ( !itp.data[n] ) { alert("Нет такого листа!");	}	// может, Throw  Error ?

			if ( !itp.data[n].cells ) {
				itp.data[n].cells = {};
				itp.data[n].rCount = itp.rCount || itp._config.rCount;
				itp.data[n].cCount = itp.cCount || itp._config.cCount;
			}	

		/*	tableGrid.style.tableLayout = "fixed";
			tableCol.style.tableLayout = "fixed";
			tableRow.style.tableLayout = "fixed";	*/

			tableGrid.width  = itp.data[n].cCount * itp._config.cell.width + itp._config.scrollSize + "px";
			tableGrid.height = itp.data[n].rCount * itp._config.cell.height + itp._config.scrollSize + "px";
			console.log(tableGrid.width);

			tableCol.width 	 = tableGrid.width;
			tableRow.height  = tableGrid.height;

			for (r = 0; r < itp.data[n].rCount; r++) {
			//	console.time("insertRow(" + r + "): ");
				tbodyGrid.insertRow(r);
				tableRow.insertRow(r).insertCell(0).outerHTML = "<th>" + (r + 1) + "</th>";

				for (c = 0; c < itp.data[n].cCount; c++) {
					if (r === 0) { 
						if (c === 0 ) { tableCol.insertRow(0) };
						tableCol.rows[0].insertCell(c).outerHTML = "<th>" + itp._colName(c) + "</th>";
					}

					cell = itp._colName(c) + (r + 1);
					tbodyGrid.rows[r].insertCell(c).innerHTML = itp.data[n].cells[cell] ? 
						itp._checkFormula( cell, n ) : "";
				}
			//	console.timeEnd("insertRow(" + r + "): ");
			}
		//	tableGrid.appendChild(tbodyGrid);
			console.timeEnd("__fillSheet (" + n + "): ");
		}		// end of  __fillSheet


		function __clickGrid(e) {
			var formula = document.querySelector("input.formula"),
				cell;
			console.log(formula);

			if (e.target.nodeName === "TD")  {
				if ( e.target.classList.contains("selected") ) {
					e.target.classList.remove("selected");
				} else {
					__unSelect();
					e.target.classList.add("selected");
				}

				cell =	itp._colName(e.target.cellIndex) +
							(e.target.parentNode.rowIndex + 1);
				formula.value = itp.aSh.cells[cell]? 	itp.aSh.cells[cell].text : "";		
				//console.log(itp.aSh.cells[cell]? );	
			//	console.dir(itp.inputCell);	
				console.dir(itp.aShIndex);	
				itp.inputCell.value = `[Лист ${itp.aShIndex+1}]${cell}`;	
			}
		}

		function __dblclickGrid(e) {		// при нажатии на ячейку
			var input, cell; 

			if (e.target.nodeName === "TD") {
				cell =	itp._colName(e.target.cellIndex) +
							(e.target.parentNode.rowIndex + 1);
				e.target.className = "input";
				input = document.createElement("input");
				input.className = "inGrid";
				input.value = itp.aSh.cells[cell]? itp.aSh.cells[cell].text : "";
				console.dir(e.target.style);
			//	input.value = e.target.innerHTML;

				input.onblur = function () {
					var cell =	itp._colName(e.target.cellIndex) +
								(e.target.parentNode.rowIndex + 1);

					this.parentNode.classList.remove("input");	//	можно так:	this.parentNode.class = "";
					if (!itp.aSh.cells[cell])  itp.aSh.cells[cell] = {};
					itp.aSh.cells[cell].text = this.value;
					this.parentNode.innerHTML = itp._checkFormula(cell, itp.aShIndex);

					itp.reFresh();
					
					itp._saveToLS();
				};

				input.onkeyup = function (e) {
					if (e.keyCode === 13) this.blur();
				}

				input.oninput = function (e) {
					var formula = document.querySelector("input.formula");

					formula.value = this.value;
				//	if (e.keyCode === 13) this.blur();
				}


				e.target.innerHTML = "";
				e.target.appendChild(input);
				input.focus();


			}
		}		// end  of  __dblclickGrid

		function __onScroll() {
			var needAddC = this.scrollWidth - (this.clientWidth + this.scrollLeft),
				needAddR = this.scrollHeight - (this.clientHeight + this.scrollTop);

			tableRow.style.top  = -this.scrollTop  + "px";
			tableCol.style.left = -this.scrollLeft + "px";

			if (needAddC < itp._config.cell.width)  __addCol();
			if (needAddR < itp._config.cell.height) __addRow();
		}

		function __addRow() {	
			var sheet = document.querySelector("div.sheet.active"),
				tableRow = sheet.querySelector('.itpTableRow'),
				tableGrid = sheet.querySelector('.itpTable'),
				tbodyGrid = tableGrid.getElementsByTagName('tbody')[0],
				c;

			tbodyGrid.insertRow(itp.aSh.rCount);
			tableRow.insertRow(itp.aSh.rCount).insertCell(0).outerHTML = "<th>" + (itp.aSh.rCount + 1) + "</th>";

			for (c = 0; c < itp.aSh.cCount; c++) {
				tbodyGrid.rows[itp.aSh.rCount].insertCell(c);
			}
	
			itp.aSh.rCount++;
			tableGrid.height = (tableGrid.scrollHeight + itp._config.cell.height) + "px";
			tableRow.height = tableGrid.height;
		}

		function __addCol() {
			var sheet = document.querySelector("div.sheet.active"),
				tableCol = sheet.querySelector('.itpTableCol'),
				tableGrid = sheet.querySelector('.itpTable'),
				tbodyGrid = tableGrid.getElementsByTagName('tbody')[0],
				selTHRow = sheet.querySelector('.itpTableRow  th.selected'),
				selIndex = selTHRow? selTHRow.parentNode.rowIndex : -1,
				r, cell;

			tableCol.rows[0].insertCell(itp.aSh.cCount).outerHTML = "<th>" + itp._colName(itp.aSh.cCount) + "</th>";

			for (r = 0; r < itp.aSh.rCount; r++) {
				cell = tbodyGrid.rows[r].insertCell(itp.aSh.cCount);
				if (r === selIndex) cell.classList.add("selected");
			}

			itp.aSh.cCount++;
			tableGrid.width  = itp.aSh.cCount * itp._config.cell.width + itp._config.scrollSize + "px";
		//	tableGrid.width = (tableGrid.scrollWidth + itp._config.cell.width) + "px";
			tableCol.width = tableGrid.width;	
		}

		
		function __clickTH(e) {
			var range, selector;

			if (e.target.nodeName === "TH")  {
				__unSelect();
				e.target.classList.add("selected");

				if (this.classList.contains("itpTableCol")) { 	// щелчок по заголовку столбцов
					selector =  "td:nth-child(" + (e.target.cellIndex + 1) + ")";
				} else {
					selector =  "tr:nth-child(" + (e.target.parentNode.rowIndex + 1) + ") td";;
				}

				range = document.querySelector("div.sheet.active").querySelectorAll(selector);
				[].forEach.call(range, function (el) {
					el.classList.add("selected");
				});

				
			}
		}

		function __unSelect() {
			let selected = document.querySelectorAll("td.selected, th.selected");
		
			[].forEach.call( selected, cell => cell.classList.remove("selected") );	
		/*
			[].forEach.call(selected, function (el) {
				el.classList.remove("selected");
			});
		*/
			itp.inputCell.value = "";
		}


	}		// end of  itp._createSheets


	itp._clearSheet = function () {
		var sheet = document.querySelector("div.sheet.active"),
			tableGrid = sheet.querySelector('.itpTable');

		sheet.querySelector('.itpTableCol').innerHTML = "";
		sheet.querySelector('.itpTableRow').innerHTML = "",
		tableGrid.getElementsByTagName('tbody')[0].innerHTML = "";
	}


	itp._checkFormula = function (cell, sheetIndex) {
		var txt = itp.data[sheetIndex].cells[cell].text,
			formula, result,
			output = document.querySelector("#outputCurrentState");

		if (typeof txt === "undefined") return "-" ;	// возвращаю "-" для наглядности		
		if (txt[0] === "=") {
			formula = txt.substring(1);
			try 		  { result = new Function( "return " + __getValByRef(formula) )(); }
			catch (error) {	
			//	itp.data[sheetIndex].cells[cell].value = "!";
				result = "<span class='error'>!</span>";
				output.innerHTML = 	"<b>Ошибка в формуле: </b>" +
						itp.data[sheetIndex].name + ", ячейка " + cell  + "<br>";
				setTimeout(function () { output.innerHTML = ""; }, 2000);

			}
		} else 	{ result = txt; }
		itp.data[sheetIndex].cells[cell].value = result;

		return result;

		function __getValByRef(formula) {
			return  formula.replace( /([A-Z]+\d+)/g, function (ref) { 
						return itp.aSh.cells[ref].value;
					});
		}

	}		//  end of itp._checkFormula

	itp.reFresh = function () {		//	reCalculation all cells in active sheet
		var cell, r, c, temp,
			tableGrid = document.querySelector("div.sheet.active").querySelector('.itpTable');

		console.log(tableGrid);
		for (cell in itp.aSh.cells) {
			temp = cell.search(/\d/);
			r = cell.substring(temp) - 1;
			c = itp._NfromColName( cell.substring(0, temp) ) - 1;
			tableGrid.rows[r].cells[c].innerHTML = itp._checkFormula( cell, itp.aShIndex );
		//	console.log("rows[" + r + "].cells[" + c + "]");
		//	console.log(cell + ": " + itp.aSh.cells[cell].text);
		}
	}


	itp._saveToLS = function () {
		localStorage.setItem ( "dataLS" , JSON.stringify(itp.data) );
	//	console.log( localStorage.dataLS ); 

		itp._saveToServer('http://keramet.kh.ua/itpSaveData.php');
	}

	
	
	itp.showCurent = function () {
		var outputCurrent = "#outputCurrentState";

		document.querySelector(outputCurrent).innerHTML = "<b>itp.data.length:  \t </b>" +  +itp.data.length  + "<br>" +
														  "<b>itp.aShIndex:  \t </b>" +  itp.aShIndex  +  "<br>" +
														  "<b>itp.aSh.name:  \t </b>" + (itp.aSh? itp.aSh.name : itp.aSh) + "<br>" +
													 	  "<b>itp.JSONdata:  \t </b>" + JSON.stringify( itp.JSONdata ) + "<br>";
													 //	  "<b>localStorage.dataLS: </b>" + JSON.stringify( localStorage.dataLS ); 
		console.dir( itp.aSh );
		console.log( "itp.aSh (активный лист - АЛ): " + JSON.stringify(itp.aSh) );
	}

		// может, лучше хранить ссылку на активный лист вместо функции определения АЛ ??
	itp.activeSheet = function () {		
		var n;

		itp.data.forEach( function (el, i) {
			if (el.active) { n = i; }
		});
		return n;
	}

	itp._keyup = function (e) {
		var td = document.querySelector('td.selected:hover');
	//	console.log(e.target.nodeName);
	//	console.log(e.target);
	//	console.log(e.currentTarget);
		if (td) { console.log(td); }
	}


	itp._colName = function (n) {		
		var chCount = itp._config.colChars.end.charCodeAt(0) - itp._config.colChars.start.charCodeAt(0) + 1,
			arr = [];

		function getChar(i) { return String.fromCharCode( itp._config.colChars.start.charCodeAt(0) + i ); }

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

	itp._NfromColName = function (str) {		// добавить проверку символов на попадание в диапазон [startChar...endChar]
		var startCode = itp._config.colChars.start.charCodeAt(0),
			endCode = itp._config.colChars.end.charCodeAt(0),
			count = endCode - startCode + 1,
			strArr = str.split("").reverse();
       
		return strArr.reduce( function (pr, cur, i) {
        	return pr + Math.pow(count, i) + cur.charCodeAt(0) - startCode;
        }, 0);
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

	itp._saveToServer = function (url) {
   		var xhr = new XMLHttpRequest();

  		xhr.onreadystatechange = function () {
        	if (xhr.readyState === 4) {
            	if (xhr.status === 200) { console.log(xhr.response); }
       		}
		};
		xhr.open( 'POST', url );
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send( "itpData=" + encodeURIComponent(JSON.stringify(itp.data)) ); 
	}

class itpClass {
	constructor (sheetCount=3) {
		this._conf = {
			rCount: 	20,
			cCount: 	20,
			scrollSize: 16,		// px
			cell: 		{ width: 100, height: 30 },	// px;
			sheetCount: 3,
			sheets: 	[], //[ "Лист 1", "Лист 2", "Лист 3" ],	// убрать?
			hideSheets: true,
			colChars: 	{ start: "A", end: "Z" }
		}

		this.sheetCount = sheetCount || this._conf.sheetCount; 
		console.log("-".repeat(5) + "constructor" +  "-".repeat(5));
		console.dir(this);
		console.log("-".repeat(10));
		itpClass.init();
	//	this.init();
	}
	static init () {	// пока тренеровочно
	//	let itpAppInit = itpApp || {};
		console.dir(this);
		console.log("-".repeat(10));
		console.log("4");
		console.log(`${4*10}`);
	//	console.log("itpApp: ");
	//	console.log(itpApp);
	//	console.dir(itpApp? itpApp : null);
	}

		/*
		var rCountInput  = document.querySelector('#rCount'),
			cCountInput  = document.querySelector('#cCount'),
			shCountInput = document.querySelector('#shCount'),
			select 		 = document.querySelector('select');
			
		document.querySelector('select').selectedIndex = itp._config.hideSheets ? 1 : 0;
			
		rCountInput.value = itp._config.rCount;
		cCountInput.value = itp._config.cCount;
		shCountInput.value = 3;	// itp._config.sheets.length;
	
	//	itp.data =  localStorage.dataLS? JSON.parse(localStorage.dataLS) : [];	// листы

		document.querySelector('#btnCreate').addEventListener("click", function () {
			var i;
			itp.rCount  = +rCountInput.value;
			itp.cCount  = +cCountInput.value;
			itp.shCount = +shCountInput.value;

			itp.data = [];
			for (i = 0; i < itp.shCount; i++) {
				itp._config.sheets.push("Лист " + (i+1));
				itp.data[i] = { name: itp._config.sheets[i] };
			}
			console.log(itp._config.sheets);
		//	itp._config.sheets.forEach( function (el, i) {
		//		itp.data[i] = { name: el };	
		//	});
			itp.aShIndex = 0;	
			itp.aSh = itp.data[ itp.aShIndex ];		
			itp.aSh["active"] = true;
			itp._config.hideSheets = document.querySelector('select').selectedIndex ? true : false ;

			itp._createTabs();
		});

		document.querySelector('#btnRestore').addEventListener("click", function () {
			itp.data 	 = JSON.parse( localStorage.dataLS );
			itp.aShIndex = itp.activeSheet();
			itp.aSh 	 = itp.data[ itp.aShIndex ];	
			itp._config.hideSheets = document.querySelector('select').selectedIndex ? true : false ;

			itp._createTabs();
		});

		document.querySelector('#btnGetJSON').addEventListener("click", function () {
			itp._getJSONData('http://keramet.kh.ua/itpGetJSON.php',  function () {
				var output = document.querySelector("#outputCurrentState");
    			console.log( JSON.stringify(itp.JSONdata) );
    			output.innerHTML = 	"<b>JSON from server: </b>  см. Консоль...";
				setTimeout(function () { output.innerHTML = ""; }, 3000);
			});
		});
		*/

}	// end of itpClass

console.log("1");
const itpApp = new itpClass (4);
console.log("itpApp: ");
console.log(itpApp);

console.log("2");


document.addEventListener("DOMContentLoaded", itp.init);

document.addEventListener("DOMContentLoaded", itpClass.init);

console.log("3");












	