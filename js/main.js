
"use strict";

class itpClass {	// всё приложение.  Объект:  itpApp.

	constructor (sheetCount=0) {	//	проверить, как работает, если sheetCount >0, <0 ?
		this._conf = {	//	подумать, нужен ли ? (может, исп-ть пересенную класса: let _conf = { ... })
			rCount: 	30,
			cCount: 	20,
			scrollSize: 16,		// px - для задания размеров таблиц
			cellSize:	{ w: 100, h: 30 },	// px;
			sheetCount: 3,	//	или  { sheetCount: sheetCount || 3, }
			colChars: 	{ start: "A", end: "Z" },
			hideSheets: true,
		}
		this.data 			= [];
		this.sheetCount 	= sheetCount;	//	 можно получить из this.data (itpApp.data.length)
		this.nextSheetId 	= 0;
		this.isNeedSave 	= false;
		this.dataJSON 		= null;
		this.isFormulaMode 	= false;
		this.aSh   			= null;
		this.aCell 			= null;
		this.hideSheets 	= this._conf.hideSheets;
	}

	init ()	{
		let rCountInput  = document.querySelector('#rCount'),	//  подумать, если нет такого эл-та (null) ?
			cCountInput  = document.querySelector('#cCount'),
			shCountInput = document.querySelector('#shCount'),
			select 		 = document.querySelector('select');

		rCountInput.value  = itpApp._conf.rCount;
		cCountInput.value  = itpApp._conf.cCount;
		shCountInput.value = itpApp._conf.sheetCount;
		select.selectedIndex = itpApp._conf.hideSheets ? 1 : 0;	

		document.querySelector('#btnCreate' ).addEventListener("click", createClk);
		document.querySelector('#btnRestore').addEventListener("click", restoreClk);
		console.dir(itpApp);
	
		function createClk () {
			if (itpApp.isInit) return console.log(`itpApp.isInit  ...  itpApp: ${itpApp}.`);
		
			itpApp.sheetCount = +shCountInput.value;
			for (let i = 0, sh; i < itpApp.sheetCount; i++) {
				sh = new itpSheetClass();
				sh.id = ++itpApp.nextSheetId;
				sh.rCount = +rCountInput.value || itpApp._conf.rCount;
				sh.cCount = +cCountInput.value || itpApp._conf.rCount;
				sh.name = `Лист ${i+1}`;
			//	sh.getFromJSON();
				itpApp.data.push(sh);
			}

			itpApp.hideSheets = document.querySelector('select').selectedIndex ? true : false;	//	попробовать select вместо document.querySelector('select')
			itpApp.aSh   = itpApp.data[0];
			itpApp.aSh["active"] = true;
			
			itpApp.createTabs();
			itpApp.isInit = true;
		}

		function restoreClk () {
			if (itpApp.isInit) return console.log(`restoreClk()...   itpApp.isInit: ${itpApp.isInit}.`);

			itpApp.getData();

			if ( itpApp.dataJSON ) {
				itpApp.dataJSON.forEach( (sh, i) => {
					let newSh = new itpSheetClass().fromJSON( sh );
					itpApp.data.push(newSh);
					if ( newSh["active"] )  itpApp.aSh = itpApp.data[i];
				});

				itpApp.sheetCount  = itpApp.data.length;
				itpApp.nextSheetId = itpApp.data.length;
				if ( !itpApp.aSh ) console.log("Нет активного листа!");
			} else {
				console.log(`Данные не загружены! ... itpApp.dataLS: ${itpApp.dataLS};  itpApp.dataServ: ${itpApp.dataServ}.`);
			}
	
			itpApp.createTabs();
			itpApp.isInit = true;
		}

	}//	enf of  init()	

	createTabs (isAddTab=true)	{	//	 false, когда надо запретить создавать новые листы
		let sheetsTab = document.querySelector("div.sheetsTab");

		if (itpApp.isInit) return console.log("createTabs()... Приложение уже инициализировано! Для пересоздания обновите страницу (F5)...");

		if ( isAddTab ) createAddTab();
		createSheetTab();	

		function createAddTab() {		// создаём вкладку "Добавить новый лист"
			let tabNew 	= sheetsTab.querySelector(".addSheet");	

			if ( tabNew ) {
				console.log("Вкладка 'Добавить новый лист' уже есть!");
				return sheetsTab;	//	?
			}
			tabNew = document.createElement("a");
			tabNew.href = "#";		// подумать над адресом ссылки ?
			tabNew.title = "Добавить новый лист";
			tabNew.innerHTML = "<span class='addSheet'><b> + </b></span>";
			tabNew.onclick = () => alert(`createAddTab()...  Пока не работает :( `), false;
			sheetsTab.appendChild(tabNew); 

			return sheetsTab;	//	подумать, что возвращать ?
		}

		function createSheetTab () {
			let tab, sheet,
				main = document.querySelector("main"),
				sheetInnerHTML = document.querySelector("div.sheet").innerHTML;		// может, как-то подключить шаблон или создать функцию для генерации HTML

			itpApp.data.forEach( function (el, i) {
				tab = document.createElement("a");
				tab.href = "#";
				tab.innerHTML = "<span" + ( el.active ? " class='active'" : "" ) + ">" + el.name + "</span>";
				tab.onclick = _clickSheetTab;
			//	tab.addEventListener("click", _clickSheetTab);
				sheetsTab.appendChild(tab);

				if (itpApp.hideSheets) {	
					if (i) {		// создаём дивы для листов (при скрытии) - переместить в createSheets
						sheet = document.createElement("div");
						sheet.className = 'sheet';
						sheet.id = "sh-" + i;
						sheet.innerHTML = sheetInnerHTML;
						main.appendChild(sheet);
					}
					itpApp.createSheets(i);
				//	itp._createSheets(i);	// заменить на itpApp.createSheets(i)!!!
					if (el.active) { document.getElementById('sh-' + i).classList.add("active"); }
				}
			});	

			if ( !itpApp.hideSheets ) {
				document.getElementById('sh-0').classList.add("active");
				itpApp.createSheets();
			//	itp._createSheets();		// заменить на itpApp.createSheets()!!!
			}

			function _clickSheetTab (e) {
				console.time("Смена листа");
				let tabs = document.querySelectorAll(".sheetsTab a span:not(.addSheet)");

				if ( e.target.classList.contains("active") ) return;

				[].forEach.call(tabs, (item, i) => {
		 			item.classList.remove("active"); 
		 	
		 			if (item === e.target) {
		 				if ( itpApp.hideSheets ) {
		 					document.getElementById('sh-' + (+itpApp.aSh.id-1)).classList.remove("active");
		 				//	document.querySelector('div.sheet.active').classList.remove("active")
		 					document.getElementById('sh-' + i).classList.add("active");
		 				} 
		 				itpApp.data[i].active = true;
		 				itpApp.aSh.active = false;
		 				itpApp.aSh = itpApp.data[i];
		 			}
				});
		
				e.target.classList.add("active");

				if ( !itpApp._conf.hideSheets ) {
					clearSheet();
				 	itpApp.createSheets();
				}

			//	itpApp.isNeedSave = true;
				itpApp.saveData();

				console.timeEnd("Смена листа");
				return false;
			}

			function clearSheet () {			// используем, когда пересоздаём листы
				let sheet = document.querySelector("div.sheet.active"),
					tableGrid = sheet.querySelector('.itpTable');

				sheet.querySelector('.itpTableCol').innerHTML = "";
				sheet.querySelector('.itpTableRow').innerHTML = "",
				tableGrid.getElementsByTagName('tbody')[0].innerHTML = "";
			}

		}// end of  createSheetTab()

	}// end of  createTabs()

	createSheets (sheetIndex=0) {
		let sheet 	  = document.getElementById("sh-" + sheetIndex),
			tableCol  = sheet.querySelector('.itpTableCol'),
			tableRow  = sheet.querySelector('.itpTableRow'),
			tableGrid = sheet.querySelector('.itpTable'),
			tbodyGrid = tableGrid.getElementsByTagName('tbody')[0],
			selMode = false, selRange = {};
		//	tbodyGrid = document.createElement("tbody");	// подумать, как лучше...

		if ( !tableCol.rows.length ) {		// были ли для этого дива созданы таблицы 
			itpApp._conf.hideSheets ? _fillSheet(sheetIndex) : _fillSheet( +itp.aSh.id - 1 );

			tableGrid.onclick 	 	= _clickGrid;
			tableGrid.ondblclick 	= _dblclickGrid;
			tableGrid.onselectstart = () => false;	
			tableGrid.onmousedown   = _tgMousedown;
			tableGrid.onmouseup 	= _tgMouseup;
			tableGrid.onmousemove = function (e) {}
			
			sheet.querySelector('div.table').onscroll = _gridScroll;

			tableCol.onclick = _clickTH; //__clickTHCol;
			tableRow.onclick = _clickTH; //__clickTHCol;
		}

		function _fillSheet(n) {
			console.time("_fillSheet(" + n + ")... ");
			let cell, itpSh = itpApp.data[n];

			if ( !itpSh ) return console.log(`Нет данных листа [${n}]`);

			tableGrid.width  = itpSh.cCount * itpApp._conf.cellSize.w + itpApp._conf.scrollSize + "px";
			tableGrid.height = itpSh.rCount * itpApp._conf.cellSize.h + itpApp._conf.scrollSize + "px";
			tableCol.width 	 = tableGrid.width;
			tableRow.height  = tableGrid.height;
		
			for (let r = 0; r < itpSh.rCount; r++) {
				tbodyGrid.insertRow(r);
				tableRow.insertRow(r).insertCell(0).outerHTML = "<th>" + (r + 1) + "</th>";

				for (let c = 0; c < itpSh.cCount; c++) {
					if (r === 0) { 
						if (c === 0 ) { tableCol.insertRow(0) };
						tableCol.rows[0].insertCell(c).outerHTML = "<th>" +  itpCellClass.getColName(c) + "</th>";
					}

					cell = itpCellClass.getColName(c) + (r + 1);
					tbodyGrid.rows[r].insertCell(c).innerHTML = itpSh.cells[cell] ? 
						itpSh.cells[cell].value : "";
				}
			}
			//	tableGrid.appendChild(tbodyGrid);	// если	tbody создаём динамически (tbodyGrid = document.createElement("tbody");)
			console.timeEnd("_fillSheet(" + n + ")... ");
		}// end of  _fillSheet()


		function _clickGrid (e) {
			let cellName, aCell,
				formula   = document.querySelector("input.formula"),	//  может, добавить в itpApp ?
				inputCell = document.querySelector("#inputCell");		//  -------//---------

			if (e.target.nodeName === "TD")  {
			//	if ( e.target.classList.contains("selected") ) {
			//		e.target.classList.remove("selected");
			//	} else {
					_unSelect();
					e.target.classList.add("selected");
			//	}

				cellName =	itpCellClass.getColName( e.target.cellIndex ) + (e.target.parentNode.rowIndex + 1);

				if (itpApp.aSh.cells[cellName]) {
					aCell = itpApp.aSh.cells[cellName];
				} else {
					aCell 		  = new itpCellClass();
					aCell.sheetId = itpApp.aSh.id;
					aCell.name 	  = cellName;
					aCell.id      = `[${aCell.sheetId}]${aCell.name}`;
				}

				itpApp.aCell = aCell;
				formula.value = itpApp.aCell.text;		
				inputCell.value = itpApp.aCell.id;
			}
		}// end of  _clickGrid()


		function _dblclickGrid (e) {		
			var input, cellName,
				formula = document.querySelector("input.formula"); 

			if (e.target.nodeName === "TD") {
				cellName =	itpCellClass.getColName( e.target.cellIndex ) + (e.target.parentNode.rowIndex + 1);
				e.target.className = "input";
				input = document.createElement("input");
				input.className = "inGrid";
				input.value = itpApp.aSh.cells[cellName]? itpApp.aSh.cells[cellName].text : "";	//	может, использовать itpApp.aCell?

				input.onblur  = __inputBlur;
				input.onkeyup = function (e) { if (e.keyCode === 13) this.blur(); };
				input.oninput = function (e) { formula.value = this.value; };
	
				e.target.innerHTML = "";
				e.target.appendChild(input);
				input.focus();
			}

			function __inputBlur () {
			//	let cell =	itp._colName(e.target.cellIndex) + (e.target.parentNode.rowIndex + 1);

				this.parentNode.classList.remove("input");
				itpApp.aCell = itpApp.aSh.addCell(cellName, this.value);
				this.parentNode.innerHTML = itpApp.aCell.value;
				__reFresh();
				itpApp.isNeedSave = true;
			}

			function __reFresh () {		//	reCalculation all cells in active sheet. Добавить как метод
			/*	реализовать
				let cell, r, c,
					tableGrid = document.querySelector("div.sheet.active").querySelector('.itpTable');

				for (cell in itpApp.aSh.cells) {
					console.dir(cell);
					
					c = cell.getColumnN() - 1;
					r = cell.getRow() - 1;
					tableGrid.rows[r].cells[c].innerHTML = cell.getValue();
				}
			*/
			}

		}// end of  _dblclickGrid()


		function _tgMousedown (e) {
			if (e.target.nodeName === "TD") {
				_unSelect();	//	написать реализацию
				selMode = true;
				selRange.startR = e.target.parentNode.rowIndex + 1;
				selRange.startC = e.target.cellIndex + 1;
			} 
		}

		function _tgMouseup (e) {
			let sel, selector, range, cell;
			
			if (e.target.nodeName === "TD" && selMode) {
				selRange.endR = e.target.parentNode.rowIndex + 1;
				selRange.endC = e.target.cellIndex + 1;

				if (selRange.endR !== selRange.startR || selRange.endC !== selRange.startR) {	// проверка, что выбрана больше, чем 1 ячейка
					__checkStartEnd();
					selector = "tr:nth-child(n+" + selRange.startR + "):not(:nth-child(n+" + (selRange.endR+1) + ")) " +
						   	   "td:nth-child(n+" + selRange.startC + "):not(:nth-child(n+" + (selRange.endC+1) + "))";

					range = document.querySelector("div.sheet.active").querySelectorAll(selector);
					[].forEach.call( range, cell => cell.classList.add("selected") );
				
				/* 	используюя 	 document.getSelection()
						sel = document.getSelection();
						console.dir(sel.anchorNode);
						console.dir(sel.focusNode); 	*/	
				}
				selMode = false;
				selRange = {};
			}

			function __checkStartEnd() {	// если  выделение начато с нижнего угла. Может, реализовать через selRange.prototype
				let temp;
				if (selRange.startR > selRange.endR) {
					temp 			= selRange.startR;
					selRange.startR = selRange.endR;
					selRange.endR 	= temp;
				}
				if (selRange.startC > selRange.endC) {
					temp 			= selRange.startC;
					selRange.startC = selRange.startC;
					selRange.startC = temp;
				}
			}
		}// end of  _tgMouseup()

		function _gridScroll () {
			let needAddC = this.scrollWidth - (this.clientWidth + this.scrollLeft),
				needAddR = this.scrollHeight - (this.clientHeight + this.scrollTop);

			tableRow.style.top  = -this.scrollTop  + "px";
			tableCol.style.left = -this.scrollLeft + "px";

			if (needAddC < itpApp._conf.cellSize.w)  __addCol();
			if (needAddR < itpApp._conf.cellSize.h)  __addRow();

			function __addRow() {	
				let sheet = document.querySelector("div.sheet.active"),	
					tableRow = sheet.querySelector('.itpTableRow'),			// надо ли заново объявлять ? 
					tableGrid = sheet.querySelector('.itpTable'),			//
					tbodyGrid = tableGrid.querySelector('tbody'),			//
					c;

				tbodyGrid.insertRow(itpApp.aSh.rCount);
				tableRow.insertRow(itpApp.aSh.rCount).insertCell(0).outerHTML = "<th>" + (itpApp.aSh.rCount + 1) + "</th>";

				for (c = 0; c < itpApp.aSh.cCount; c++) {
					tbodyGrid.rows[itpApp.aSh.rCount].insertCell(c);
				}
	
				itpApp.aSh.rCount++;
				tableGrid.height = itpApp.aSh.rCount * itpApp._conf.cellSize.h + itpApp._conf.scrollSize + "px";
			//	tableGrid.height = (tableGrid.scrollHeight + itpApp._conf.cellSize.h) + "px";
				tableRow.height = tableGrid.height;
			}

			function __addCol() {
				let sheet = document.querySelector("div.sheet.active"),
					tableCol = sheet.querySelector('.itpTableCol'),				// надо ли заново объявлять ?
					tableGrid = sheet.querySelector('.itpTable'),				//
					tbodyGrid = tableGrid.getElementsByTagName('tbody')[0],		//
					selTHRow = sheet.querySelector('.itpTableRow  th.selected'),
					selIndex = selTHRow? selTHRow.parentNode.rowIndex : -1,
					r, cell;

				tableCol.rows[0].insertCell(itpApp.aSh.cCount).outerHTML = 
					"<th>" + itpCellClass.getColName( itpApp.aSh.cCount ) + "</th>";

				for (r = 0; r < itpApp.aSh.rCount; r++) {
					cell = tbodyGrid.rows[r].insertCell(itpApp.aSh.cCount);
					if (r === selIndex) cell.classList.add("selected");
				}

				itpApp.aSh.cCount++;
				tableGrid.width  = itpApp.aSh.cCount * itpApp._conf.cellSize.w + itpApp._conf.scrollSize + "px";
			//	tableGrid.width = (tableGrid.scrollWidth + itp._config.cell.width) + "px";
				tableCol.width = tableGrid.width;	
			}
		}//	end of  _gridScroll()


		function _clickTH(e) {
			var range, selector;

			if (e.target.nodeName === "TH")  {
				_unSelect();
				e.target.classList.add("selected");

				if (this.classList.contains("itpTableCol")) { 	// щелчок по заголовку столбцов
					selector =  "td:nth-child(" + (e.target.cellIndex + 1) + ")";
				} else {
					selector =  "tr:nth-child(" + (e.target.parentNode.rowIndex + 1) + ") td";;
				}

				range = document.querySelector("div.sheet.active").querySelectorAll(selector);
				[].forEach.call(range, el => el.classList.add("selected") );
			}
		}
	

		function _unSelect() {	
			let selected = document.querySelectorAll("td.selected, th.selected");
		
			[].forEach.call( selected, cell => cell.classList.remove("selected") );	
		//	itp.inputCell.value = "";
		}

	}// end of  createSheets

	saveData (onLS=true, onServer=true) {
		let xhr, url = "http://keramet.kh.ua/itpSaveData.php";

		if ( !itpApp.isNeedSave ) return;
   		
   		if (onServer) {
   			xhr = new XMLHttpRequest();
  			xhr.onreadystatechange = () => { if	(xhr.readyState === 4 && xhr.status === 200) console.log(`Запись на сервер...  ${xhr.statusText}`); }
  			xhr.open( 'POST', url );
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send( "itpAppData=" + encodeURIComponent(JSON.stringify(itpApp.data)) ); 
		}

		if (onLS) {
			localStorage.setItem ( "itpAppData" , JSON.stringify(itpApp.data) );
			console.log(`Запись в localStarge  ...  ${localStorage.itpAppData}`); 
		}
		itpApp.isNeedSave = false;
	}

	getData (fromLS=true, fromServer=true, callback) {
   		let xhr, url = "http://keramet.kh.ua/itpGetJSON.php";

   		if (fromLS && localStorage.itpAppData) {
   			itpApp.dataJSON = JSON.parse( localStorage.itpAppData );
   			itpApp.dataLS 	= localStorage.itpAppData;
			console.log(`Загрузка из localStorage!  ...  itpApp.dataLS: ${itpApp.dataLS}.`);
   		}

   		if (fromServer && !itpApp.dataJSON) {
			xhr = new XMLHttpRequest();
   			xhr.onreadystatechange = function () {
        		if (xhr.readyState === 4 && xhr.status === 200) {
                	itpApp.dataJSON = JSON.parse(xhr.responseText);
                	itpApp.dataServ = xhr.responseText;
                	console.log(`Загрузка с сервера...  ${xhr.statusText}`); 
                	if (callback) callback();
       			}
			}
			xhr.open('GET', url);
			xhr.send(); 
   		}
   		// добавить проверку itpApp.dataLS и itpApp.dataServ, и предложить выбор
	}

	static info () {	// пока тренеровочно
		console.log(`static info (): ... this:`);
		console.dir(this);

		console.log(`static info (): ... itpApp: ${itpApp}.`);
		console.dir(itpApp);
		console.log("-".repeat(10));
	}
		

}// end of itpClass

class itpSheetClass {

	constructor (rCount=30, cCount=20, isHide=true) {	//	false, чтобы переСоздавать листы в одном диве
		this.id 	= -1;		// только создан. потом id >= 0
		this.name 	= "";
		this.rCount = rCount;
		this.cCount = cCount;
		this.cells 	= {};
	}

	fromJSON (sheetJSON=null) {
		if ( !sheetJSON ) return	console.log("Не передан sheetJSON!");

	//	( {this.id, this.name, this.rCount, this.cCount, this.cells} = sheetJSON );
		let {id, name, rCount, cCount, cells, active} = sheetJSON;

		this.id 	= id;		
		this.name 	= name;
		this.rCount = rCount;
		this.cCount = cCount;
		for (let cell in cells) {
			let itpCell = new itpCellClass().fromJSON( cells[cell] );
    		this.cells[itpCell.name] = itpCell;
		}
		this.active	= active || false;

		return this;
	}
	addCell (cellName, text="") {
		if ( !cellName )  return console.log('Не указана ячейка (например: "D4")');

		if ( this.cells[cellName] ) {	//	если text="" ? удалять или нет ?
			this.cells[cellName].text = text;
			this.cells[cellName].getValue();
			return this.cells[cellName];
		} else {
			let cell = new itpCellClass();
			cell.sheetId = this.id;
			cell.name 	 = cellName;
			cell.id 	 = `[${+cell.sheetId}]${cell.name}`;
			cell.text    = text;
			cell.getValue();
			this.cells[cellName] = cell;
			return cell;
		}
	}
	getSelected () {}

	unSelect () {}

}	//	end of  itpSheetClass


class itpCellClass {
	constructor () {
		this.sheetId = -1;
		this.name 	 = "";
		this.id 	 = `[${this.sheetId}]${this.name}`;
		this.text 	 = "";
		this.value 	 = "";
	}

	fromJSON (cellJSON=null) {
		if ( !cellJSON ) return	console.log("Не передан cellJSON!");

		let {sheetId, name, id, text, value} = cellJSON;

		this.sheetId = sheetId;
		this.name 	 = name;
		this.id 	 = id;
		this.text 	 = text;
		this.value   = value;
		return this;	//	this - ячейка
	}

	getValue () {
		let formula, result,
			sheet = +this.sheetId - 1,	//	для  _getValueByRef(formula)
			output = document.querySelector("#outputCurrentState");

		if (this.text === "") {
			this.value = "";
			return 0;
		}

		if (this.text[0] === "=") {
			formula = this.text.substring(1);
		//	console.dir(itpApp.data);
		//	console.log(`formula: ${formula}.  Лист: ${sheet}.`);
		//	console.log(`_getValueByRef: ${_getValueByRef( formula )}.`);
			try   {
			//	console.log(`return  ${_getValueByRef(formula)}`);
				result = new Function( "return " + _getValueByRef(formula) )(); 
			}
			catch (error) {	
				result = "<span class='error'>!</span>";
				output.innerHTML = 	"<b>Ошибка в формуле: </b> ячейка " + this.id + "<br>";
				setTimeout( () => output.innerHTML="", 3000 );
			//	console.log(`_getValueByRef( ${formula} ): ${_getValueByRef(formula)}`);
			}

		} else { result = this.text; }
		return this.value = result;

		function _getValueByRef(formula) {		// sheet надо брать из formula. Добавить проверку, попадает ли ref на лист. 
			return  formula.replace( /([A-Z]+\d+)/g, ref => {
				let val = itpApp.data[sheet].cells[ref]? itpApp.data[sheet].cells[ref].value
													   : 0;
				return 	val;						   
			});
		}
	}	//	end of  getValue()

	getColumn () { return this.name.substring( 0, this.name.search(/\d/) ); }

	getColumnN () {		//	получить номер столбца (отсчёт от 1)
		let startCode = itpApp._conf.colChars.start.charCodeAt(0),
			endCode = itpApp._conf.colChars.end.charCodeAt(0),
			count = endCode - startCode + 1,
			colNameArr = this.getColumn().split("").reverse();

		return colNameArr.reduce( (pr, cur, i) => {
        	return pr + Math.pow(count, i) + cur.charCodeAt(0) - startCode;
        }, 0);
	}

	getRow () { return this.name.substring( this.name.search(/\d/) ); }

	static getColName (n=0) {		
		let chCount = itpApp._conf.colChars.end.charCodeAt(0) - itpApp._conf.colChars.start.charCodeAt(0) + 1,
			arr = [],
			getChar = (i) => String.fromCharCode( itpApp._conf.colChars.start.charCodeAt(0) + i );

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

}//	end of  itpCellClass


const itpApp = new itpClass();

document.addEventListener("DOMContentLoaded", itpApp.init);

















	