"use strict";

class itpClass {	//   Объект:  itpApp.

	constructor (sheetCount=0) {	//	проверить, как работает, если sheetCount >0, <0 ?
		this._conf = {	//	подумать, нужен ли ? (может, исп-ть пересенную класса: let _conf = { ... })
			rCount 	  : 30,
			cCount 	  : 20,
			scrollSize: 16,						// px - для задания размеров таблиц
			cellSize  : { w: 100, h: 30, p: 5 },	// px; (p - padding)
			tab	  	  : { w: 70, p: 5, m: 5, n: "name" },
			sheetCount: 3,
			colChars  : { start: "A", end: "Z" },
		}
		this.data 			= [];
		this.sheetCount 	= sheetCount;	//	 можно получить из this.data (itpApp.data.length)
		this.nextSheetId 	= 0;
		this.isNeedSave 	= false;
		this.dataJSON 		= null;
		this.formula 		= new FormulaClass();
		this.aSh   			= null;			//	активный лист
		this.aCell 			= null;			//	активная ячейка
		this.table 			= document.querySelector("#tt");
	}

	init ()	{
		let rCountInput  = document.querySelector('#rCount'),	//  подумать, если нет такого эл-та (null) ?
			cCountInput  = document.querySelector('#cCount'),
			shCountInput = document.querySelector('#shCount');

		rCountInput.min = getRcountMin() + 1;
		cCountInput.min = getCcountMin() + 1;
		// console.log( "getCcountMin(): ", getCcountMin() );		

		rCountInput.value  = Math.max( itpApp._conf.rCount, rCountInput.min );
		cCountInput.value  = Math.max( itpApp._conf.cCount, cCountInput.min );
		shCountInput.value = itpApp._conf.sheetCount;

		document.querySelector('#btnCreate' ).addEventListener("click", createClk);
		document.querySelector('#btnRestore').addEventListener("click", restoreClk);
	
		
		function createClk () {
			if (itpApp.isInit) return console.log(`itpApp.isInit  ...  itpApp: ${itpApp}.`);
		
			itpApp.sheetCount = +shCountInput.value;
			for (let i = 0, sh; i < itpApp.sheetCount; i++) {
				sh = new itpSheetClass();
				sh.id = ++itpApp.nextSheetId;
				sh.rCount = +rCountInput.value || itpApp._conf.rCount;
				sh.cCount = +cCountInput.value || itpApp._conf.rCount;
				sh.name = `Лист ${i+1}`;
				itpApp.data.push(sh);
			}

			itpApp.aSh = itpApp.data[0];
			itpApp.aSh["active"] = true;
			
			itpApp.createTabs();
			itpApp.isInit = true;
		}

		function restoreClk () {
			if (itpApp.isInit) return console.log(`restoreClk()...   itpApp.isInit: ${itpApp.isInit}.`);

			itpApp.getData()
				.then( function () {
					if ( itpApp.dataJSON ) {
						itpApp.dataJSON.forEach( (sh, i) => {
							let newSh = new itpSheetClass().fromJSON( sh );
							itpApp.data.push( newSh );
							if ( newSh["active"] )  itpApp.aSh = itpApp.data[ i ];
						});

						itpApp.sheetCount  = itpApp.data.length;
						itpApp.nextSheetId = itpApp.data.length;

						if ( !itpApp.aSh ) console.log("Нет активного листа!");

						itpApp.createTabs();
						itpApp.isInit = true;
					} else {
						console.info(`Данные не загружены! ... itpApp.dataLS: ${itpApp.dataLS};  itpApp.dataServ: ${itpApp.dataServ}.`);
						// предложить создать проект "с нуля"
					}
				});

			// if ( itpApp.dataJSON ) {
			// 	itpApp.dataJSON.forEach( (sh, i) => {
			// 		let newSh = new itpSheetClass().fromJSON( sh );
			// 		itpApp.data.push( newSh );
			// 		if ( newSh["active"] )  itpApp.aSh = itpApp.data[ i ];
			// 	});

			// 	itpApp.sheetCount  = itpApp.data.length;
			// 	itpApp.nextSheetId = itpApp.data.length;
			// 	if ( !itpApp.aSh ) console.log("Нет активного листа!");
			// } else {
			// 	console.log(`Данные не загружены! ... itpApp.dataLS: ${itpApp.dataLS};  itpApp.dataServ: ${itpApp.dataServ}.`);
			// }
	
			// itpApp.createTabs();
			// itpApp.isInit = true;
		}

		function getRcountMin() {
			let main = document.querySelector('main'),
				divFormulaH   = 50,
				divSheetsTabH = 29,
				bottom = Math.trunc (0.03 * document.documentElement.clientHeight),	// 0.03 (3%) - т.к. html.height: 98%;
				temp   = main.offsetHeight -
					     divFormulaH - divSheetsTabH - 
					     main.offsetTop - itpApp._conf.scrollSize - bottom;

			document.querySelector('div.formula').style.height   = divFormulaH + "px";
			document.querySelector('div.sheetsTab').style.height = divSheetsTabH + "px";
			document.querySelector('div.tableDiv').style.height  = temp + "px";

			// console.log(temp);
			return Math.trunc( temp / (itpApp._conf.cellSize.h+3) );
		};

		function getCcountMin() {
			let temp = document.documentElement.clientWidth - 16 - 2;
			
			return Math.trunc( temp / (itpApp._conf.cellSize.w+3) );
		}


	}//	enf of  init()	

	
	checkSize () {	//	пока только табы
		let tabs    = document.querySelectorAll(".sheetsTab a span"),
			tagSize = itpApp._conf.tab.w +
					  itpApp._conf.tab.m +
					  itpApp._conf.tab.p * 2 + 2,
			diff    = document.querySelector("div.sheetsTab").clientWidth - 
					  tabs.length * tagSize;

		if ( diff < 150 ) {		//	"150" получено эмперическим путём :)
			itpApp._conf.tab.w -= 10;
			[].forEach.call( tabs, function (tab, i) {
				tab.style.width = itpApp._conf.tab.w + "px";
				if ( itpApp._conf.tab.n == "name" && i ) {
					tab.innerHTML = itpApp.data[ i-1 ].id;
				}
			});
			itpApp._conf.tab.n = "id";
		}

	}// end of  checkSize


	createTabs (isAddTab=true)	{	//	 false, когда надо запретить создавать новые листы
		let sheetsTab = document.querySelector("div.sheetsTab");

		if (itpApp.isInit) return console.log("createTabs()... Приложение уже инициализировано! Для пересоздания обновите страницу (F5)...");

		document.querySelector("header").style.display = "none";
		document.querySelector("div.formula").style.display = "block";
		document.getElementById('sh-0').classList.add("active");

		if ( isAddTab ) createAddTab();

		itpApp.data.forEach( sheet => createSheetTab(sheet) );
		itpApp.createSheet();
		// itpApp.reFresh();
		document.body.onselectstart = () => false;


		function createAddTab() {		// создаём вкладку "Добавить новый лист"
			let tabNew 	= sheetsTab.querySelector(".addSheet");	

			if ( tabNew )  return console.log("Вкладка 'Добавить новый лист' уже есть!");

			tabNew           = document.createElement("a");
			tabNew.href      = "#";		// подумать над адресом ссылки ?
			tabNew.title     = "Добавить новый лист";
			tabNew.innerHTML = "<span class='addSheet'><b> + </b></span>";
			tabNew.onclick   = _clickAddTab; 
			sheetsTab.appendChild(tabNew); 


			function _clickAddTab() {
				let sh  = new itpSheetClass(),
					tab = document.createElement("a");

				sh.id     = ++itpApp.nextSheetId;
				sh.rCount = itpApp._conf.rCount;
				sh.cCount = itpApp._conf.rCount;
				sh.name   = `Лист ${sh.id}`;
				itpApp.data.push( sh );
				createSheetTab( sh );
		
				return false;
			}
		}// end of  createAddTab

		function createSheetTab (sheet) {
			let tab  = document.createElement("a");

			tab.href      = "#";
			tab.innerHTML = "<span" + ( sheet.active ? " class='active'" : "" ) + ">" + sheet[ itpApp._conf.tab.n ] + "</span>";
			tab.onclick   = _clickSheetTab;
			tab.children[0].style.width = itpApp._conf.tab.w + "px";
			sheetsTab.appendChild( tab );
			itpApp.checkSize();
			
			
			function _clickSheetTab (e) {
				let tabs = document.querySelectorAll(".sheetsTab a span:not(.addSheet)");

				if ( e.target.classList.contains("active") || e.target.nodeName == "A" ) return;
				console.time("Смена листа");

				[].forEach.call( tabs, (item, i) => {
		 			item.classList.remove("active"); 
		 	
		 			if (item === e.target) {
		 				itpApp.aSh.active = false;
		 				itpApp.data[ i ].active = true;
		 				itpApp.aSh = itpApp.data[ i ];
		 				itpApp.reFresh(true);	// может запускать только изменение выделенного диапазона?
		 			}
				});
				e.target.classList.add("active");
				itpApp.saveData();

				console.timeEnd("Смена листа");
				return false;
			}

			// function _checkSize() {
			// 	let tabs    = document.querySelectorAll(".sheetsTab a span"),
			// 		tagSize = itpApp._conf.tab.w +
			// 				  itpApp._conf.tab.m +
			// 				  itpApp._conf.tab.p * 2 + 2,
			// 		diff    = document.querySelector("div.sheetsTab").clientWidth - 
			// 				  (tabs.length + 0) * tagSize;
			
			// 	if ( diff < 2 * tagSize ) {		//	"2" получено эмперическим путём :)
			// 		itpApp._conf.tab.w -= 10;
			// 		[].forEach.call( tabs, function (tab, i) {
			// 			tab.style.width = itpApp._conf.tab.w + "px";
			// 			if ( itpApp._conf.tab.n == "name" ) {
			// 				if (i) tab.innerHTML = itpApp.data[ i-1 ].id;
			// 			}
			// 		});
			// 		itpApp._conf.tab.n = "id";
			// 	}
			// }

		}// end of  createSheetTab()

	}// end of  createTabs()

	createSheet (sheetIndex=0) {
		let sheet 	  = document.getElementById("sh-0"),
			tt        = document.querySelector("#tt"),	// itpApp.table ?
			divScroll = document.querySelector("#divScroll");
		
		if (itpApp.isInit) return console.log("createSheet()... Приложение уже инициализировано! ");	// нужна ли эта проверка
		
		_createSheetTable();
		itpApp.reFresh(true);

		// tt.onclick 	 	 = _clickGrid;
		tt.addEventListener( "click",  _clickGrid );
		tt.addEventListener( "click",  _clickTH   );
		tt.onselectstart = () => false;		//	может, убрать? т.к. использую на body
		tt.ondblclick 	 = _dblclickGrid;
		tt.onmousedown   = _tgMousedown;
		tt.onmouseup 	 = _tgMouseup;
		tt.onmousemove   = _tgMousemove;
		tt.onwheel       = (e) => document.querySelector(".tableDiv").scrollTop += e.deltaY;

		sheet.querySelector('div.tableDiv').onscroll = _gridScroll;

		window.onresize = () => {
			_createSheetTable();
			itpApp.reFresh(true);
		}

		function onResize(e) {
			let tableDiv = document.querySelector('div.tableDiv'),
				TDs      = document.querySelectorAll("td:last-child"),
				padding  = 2 * itpApp._conf.cellSize.p,	//	px (padding  в ячейке - см. файл "style.css" )
				maxW	 = itpApp._conf.cellSize.w - padding, 
				diff, tdW;

			diff = tableDiv.clientWidth - tt.clientWidth - 5;
			tdW  = TDs[0].clientWidth - padding;
		
			if (diff < 0) {
				tdW = tdW - (-diff);
				if (tdW <= 1)  {  deleteLastTd();
								  return;         }  
			} else {
				tdW += diff;
				if (tdW > maxW) {
					let newTdW = tdW - maxW;
					tdW -= newTdW;
					[].forEach.call( TDs, function (td) {
						td.style.width    = tdW + 'px';
						td.style.maxWidth = tdW + 'px';
					});
					if ( newTdW > padding ) addLastTd( newTdW - padding );
				}
			}
			[].forEach.call( TDs, function (td) {
				td.style.width    = tdW + 'px';
				td.style.maxWidth = tdW + 'px';
			});

			itpApp.checkSize();


			function deleteLastTd() {
				[].forEach.call( tt.rows, function (r) {
					r.deleteCell( -1 );
				});
			}

			function addLastTd(width) {
				[].forEach.call( tt.rows, function (r, i) {
					let c = r.insertCell( -1 );
					c.style.width = width + "px";
					// if ( !i )  c.outerHTML = "<th></th>";
				});
			}

		}// end of  onResize


		function _createSheetTable()  {	//	создание структуры листа и заполнение данными
			let tableDiv = document.querySelector('div.tableDiv'),
				tbody	 = itpApp.table.querySelector("tbody"),
				row      = document.createElement("tr"),
				cell     = document.createElement("td"),
				countC, countR, lastTdW;

			_setTableDivSize();

			if ( tbody )  itpApp.table.innerHTML = "";  
			tbody  = document.createElement("tbody"); 

			countR = Math.trunc( tableDiv.clientHeight / (itpApp._conf.cellSize.h+3) );  
			countC = Math.trunc( tableDiv.clientWidth  / (itpApp._conf.cellSize.w+3) );
			
			lastTdW = (tableDiv.clientWidth-16-2-1) - 
					  countC * (itpApp._conf.cellSize.w + 1) -
					  2 * itpApp._conf.cellSize.p;

			for (let c = 0; c < countC; c++) {
				row.appendChild( cell.cloneNode(false) );
			}
			if (lastTdW > 0) {
				cell.style.width = lastTdW + "px";
				row.appendChild( cell );
			}

			for (let r = 0; r < countR; r++) {
				tbody.appendChild( row.cloneNode(true) );
				if ( r ) tbody.rows[r].cells[0].outerHTML = "<th></th>"; 
			}

			itpApp.table.appendChild( tbody );


			function _setTableDivSize() {
				let main 	      = document.querySelector('main'),
					divFormulaH   = document.querySelector('div.formula'  ).clientHeight, 
					divSheetsTabH = document.querySelector('div.sheetsTab').clientHeight, 
					bottom 		  = Math.trunc (0.03 * document.documentElement.clientHeight);	// 0.03 (2%) - т.к. html.height: 98%;

				tableDiv.style.height = ( main.offsetHeight - main.offsetTop -
				    	  				  divFormulaH - divSheetsTabH - 
				     	  				  bottom - itpApp._conf.scrollSize ) + "px";
			}

		}// end of  _createSheetTable

	

		function _clickGrid (e) {
			let cellName, aCell;

			if (e.target.nodeName === "TD" && e.target.parentNode.rowIndex !== 0)  {
				_unSelect();

				cellName =	itpCellClass.getColName( (e.target.cellIndex-1) + itpApp.aSh.corner.c - 1) +
							((e.target.parentNode.rowIndex-1) + itpApp.aSh.corner.r);

				if ( itpApp.formula.active ) {
					itpApp.formula.input.value += cellName;
					itpApp.formula.text = itpApp.formula.input.value;
					itpApp.formula.input.focus();
					e.target.classList.add("formula");
					return;
				} else {
					let cells = document.querySelectorAll("td.formula");
					[].forEach.call( cells, cell => cell.classList.remove("formula") );
					
					e.target.classList.add("selected");
					if (itpApp.aSh.cells[cellName]) {
						aCell = itpApp.aSh.cells[cellName];
					} else {
						aCell 		  = new itpCellClass();
						aCell.sheetId = itpApp.aSh.id;
						aCell.name 	  = cellName;
					//	aCell.id      = `[${aCell.sheetId}]${aCell.name}`;
					}

					itpApp.aCell = aCell;
					itpApp.formula.input.value = itpApp.aCell.text;		
					itpApp.formula.inputCell.value = itpApp.aCell.id;
				}
			}
			
		}// end of  _clickGrid()


		function _dblclickGrid (e) {		
			let input, cellName, size;
				// formula = document.querySelector("input.formula"); 

			if (e.target.nodeName === "TD") {
				cellName =	itpCellClass.getColName( (e.target.cellIndex-1) + itpApp.aSh.corner.c - 1) +
							( (e.target.parentNode.rowIndex-1) + itpApp.aSh.corner.r);
				size = e.target
				e.target.className = "input";
				input = document.createElement("input");
				input.className = "inGrid";
				// console.dir(e.target);
				// console.dir(input);
				input.style.width = e.target.clientWidth - 10 - 2  + "px";
				
				input.value = itpApp.aSh.cells[cellName]? itpApp.aSh.cells[cellName].text : "";	//	может, использовать itpApp.aCell?

				input.onblur  = __inputBlur;
				input.onkeyup = function (e) { if (e.keyCode === 13) this.blur(); }
				input.oninput = function (e) { 
					// formula.value = this.value;
					itpApp.formula.input.value = this.value
					// itpApp.formula.checkActive();
					// console.log( itpApp.formula.active );
				}
	
				e.target.innerHTML = "";
				e.target.appendChild(input);
				// console.dir(input);
				input.focus();
			}

			function __inputBlur () {
				if ( itpApp.formula.active ) {
					this.value += cellName;
					itpApp.formula.input.value += cellName;
					itpApp.formula.text = itpApp.formula.input.value;
					this.focus();
					return;
				}

				this.parentNode.classList.remove("input");
				if ( this.value ) {
					itpApp.aCell = itpApp.aSh.addCell(cellName, this.value);
					this.parentNode.innerHTML = itpApp.aCell.value;
				} else {
					this.parentNode.innerHTML = this.value
					if ( itpApp.aSh.cells[cellName] ) delete itpApp.aSh.cells[cellName];
				}
				itpApp.reFresh();
				itpApp.isNeedSave = true;
			}
		}// end of  _dblclickGrid()


		function _tgMousedown (e) {
			if (e.target.nodeName === "TD") {
				_unSelect();
				itpApp.sr = new SelRangeClass( 
									e.target.parentNode.rowIndex + (itpApp.aSh.corner.r-1),
								 	e.target.cellIndex + (itpApp.aSh.corner.c-1),
								 	itpApp.aSh.id );
				// console.log("row: ", e.target.parentNode.rowIndex);
				// console.log("col: ", e.target.cellIndex);
				// console.log("corner: ", JSON.stringify(itpApp.aSh.corner));
				if ( !itpApp.formula.active ) itpApp.aCell = null;
			}	
		}

		function _tgMouseup (e) {
			if (itpApp.sr && itpApp.sr.inProcess && (e.target.nodeName === "TD" || e.target.nodeName === "TABLE")) {
				itpApp.sr.checkStartEnd().show("selected");
				// itpApp.sr.checkStartEnd().setClass("selected");
				itpApp.sr.inProcess = false;
			} 
		}

		function _tgMousemove (e) {
			if (itpApp.sr && itpApp.sr.inProcess && e.target.nodeName === "TD") {
				let endR = e.target.parentNode.rowIndex + (itpApp.aSh.corner.r-1),
					endC = e.target.cellIndex + (itpApp.aSh.corner.c-1);

				itpApp.sr.checkEnd(endR, endC);
			}
		}

		function _gridScroll () {
			let needAddC = this.scrollWidth  - (this.clientWidth  + this.scrollLeft),
				needAddR = this.scrollHeight - (this.clientHeight + this.scrollTop),
				r, c;

			// console.log("_gridScroll");
			r = Math.trunc( this.scrollTop / (itpApp._conf.cellSize.h+1) ) + 1;
			if (r !== itpApp.aSh.corner.r) {
				itpApp.aSh.corner.r = r;
				fillRowsTh(r);
				itpApp.reFresh();
			}

			c = Math.trunc( this.scrollLeft / (itpApp._conf.cellSize.w+1) ) + 1;
			if (c !== itpApp.aSh.corner.c) {
				itpApp.aSh.corner.c = c;
				fillColsTh(c);
				itpApp.reFresh();
			}

			if (needAddC < itpApp._conf.cellSize.w) {
				itpApp.aSh.cCount++;
				divScroll.style.width = (itpApp.aSh.cCount+1) * (itpApp._conf.cellSize.w+1) + itpApp._conf.scrollSize + "px";
				console.log("divScroll.style.width: ", divScroll.style.width);
			
			} 
			
			if (needAddR < itpApp._conf.cellSize.h) {
				itpApp.aSh.rCount++;
				divScroll.style.height = (itpApp.aSh.rCount+1) * (itpApp._conf.cellSize.h+1) + itpApp._conf.scrollSize + "px";
			
			console.log("divScroll.style.height: ", divScroll.style.height);
			}

			function fillRowsTh (n=1) {
				for (let i = 0, r = tt.rows.length-1; i < r; i++) {
					tt.rows[i+1].cells[0].innerHTML = n + i;
				}
			}

			function fillColsTh (n=1) {
				for (let i = 0, c = tt.rows[0].cells.length-1; i < c; i++) {
					tt.rows[0].cells[i+1].innerHTML = itpCellClass.getColName( n + i - 1);
				}
			}

		}//	end of  _gridScroll()


		function _clickTH(e) {
			var range, selector;

			if (e.target.nodeName === "TH" || e.target.parentNode.rowIndex === 0 )  	{
				_unSelect();
				e.target.classList.add("selected");

				// if (this.classList.contains("itpTableCol")) { 	// щелчок по заголовку столбцов
				if ( !e.target.parentNode.rowIndex ) {
					selector =  "td:nth-child(" + (e.target.cellIndex + 1) + ")";
				} else {
					selector =  "tr:nth-child(" + (e.target.parentNode.rowIndex + 1) + ") td";
				}

				range = document.querySelector("div.sheet.active").querySelectorAll(selector);
				[].forEach.call( range, el => el.classList.add("selected") );
			}
		}
	

		function _unSelect() {	
			let selected = document.querySelectorAll("td.selected, th.selected, td.hovered");
		
			[].forEach.call( selected, cell => cell.classList.remove("selected", "hovered") );
			itpApp.sr = null;

		}

	}// end of  createSheet

	reFresh (all=false) {		// добавить метод reCalc, пересчитывающий все данные в модели
		let divScroll = document.querySelector("#divScroll"),
			tableDiv  = document.querySelector("div.tableDiv"),
			cell, iCell,
			iSh = itpApp.aSh || itpApp.data[0],
			r   = itpApp.table.rows.length, 
			c   = itpApp.table.rows[0].cells.length;

		if ( !iSh ) return console.log("Ошибка: нет объекта 'Sheet'!");

		if ( all ) {
			divScroll.style.width  = (iSh.cCount+1) * (itpApp._conf.cellSize.w+1) + itpApp._conf.scrollSize + "px";
			divScroll.style.height = (iSh.rCount+1) * (itpApp._conf.cellSize.h+1) + itpApp._conf.scrollSize + "px";

			tableDiv.scrollTop  = (iSh.corner.r-1) * (itpApp._conf.cellSize.h+1);
			tableDiv.scrollLeft = (iSh.corner.c-1) * (itpApp._conf.cellSize.w+1);

			for (let i = 1; i < r; i++) {
				itpApp.table.rows[ i ].cells[ 0 ].innerHTML = iSh.corner.r + (i - 1);
			}
			for (let j = 1; j < c; j++) {
				itpApp.table.rows[ 0 ].cells[ j ].innerHTML =  itpCellClass.getColName( iSh.corner.c + (j - 1) - 1 );
			}
		}

		for (let cell in itpApp.aSh.cells) {
			console.log( itpApp.aSh.cells[cell].getValue() );
		}

		for (let i = 1; i < r; i++) {
			for (let j = 1; j < c; j++) {
				cell = itpCellClass.getColName((j-1) + iSh.corner.c - 1) + ((i-1) + iSh.corner.r);
				itpApp.table.rows[i].cells[j].innerHTML = iSh.cells[cell] ? iSh.cells[cell].getValue()/*value*/ : "";
			}
		}


		(function selection() {
			let selected = document.querySelectorAll("td.selected, th.selected");
		
			[].forEach.call( selected, cell => cell.classList.remove("selected", "hovered") );
			
			// if (itpApp.aCell) console.log(itpApp.aCell);
			if (itpApp.sr)    itpApp.sr.show();
			// console.dir( iSh );
		})();


	}

	saveData (onLS=true, onServer=true) {
		let xhr, url = "http://keramet.kh.ua/itpSaveData.php";

		if ( !itpApp.isNeedSave ) return console.log("Nothing to save...");
   		
   		if (onServer) {
   			xhr = new XMLHttpRequest();
  			xhr.onreadystatechange = () => { 
  				if	(xhr.readyState === 4 && xhr.status === 200) console.log(`Запись на сервер...  ${xhr.statusText}`); 
  			}
  			xhr.open( 'POST', url );
			xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
			xhr.send( "itpAppData=" + encodeURIComponent(JSON.stringify( itpApp.data )) ); 
		}

		if (onLS) {
			localStorage.setItem ( "itpAppData" , JSON.stringify(itpApp.data) );
			console.log(`Запись в localStarge  ...  ${localStorage.itpAppData}`); 
		}
		itpApp.isNeedSave = false;


		function saveJSONtoServer() {
			return new Promise( function (resolve, reject) {
				xhr = new XMLHttpRequest();

				xhr.open( 'POST', url );
				xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
				xhr.onload = () => {};
  				xhr.onreadystatechange = () => { 
  					if	(xhr.readyState === 4 && xhr.status === 200) console.log(`Запись на сервер...  ${xhr.statusText}`); 
  				}

				xhr.send( "itpAppData=" + encodeURIComponent(JSON.stringify( itpApp.data )) ); 
			});
		}
	}// end of  saveData

	getData (fromLS=true, fromServer=true) {
   		let xhr, url = "http://keramet.kh.ua/itpGetJSON.php";

   		if (fromLS) {
			if (localStorage.itpAppData) {
   				itpApp.dataJSON = JSON.parse( localStorage.itpAppData );
   				itpApp.dataLS 	= localStorage.itpAppData;
   				console.info(`Загружено из localStorage!  ...  itpApp.dataLS: ${itpApp.dataLS}.`);
   				return Promise.resolve();
   			} else {
   				console.log("Нет данных в 'localStorage.itpAppData'");
   			}
   		}

   		if (fromServer && !itpApp.dataJSON) {
   			return getJSONfromServer()
   				.then( function (data) {
   					itpApp.dataJSON = JSON.parse(data);
               		itpApp.dataServ = data;
               		console.info(`Загружено c сервера!  ...  itpApp.dataServ: ${itpApp.dataServ}.`);
   				})
   				.catch( function (err) {
   					console.log(`Ошибка при загрузке с сервера...  [${err}]`);
   				});
   		} 	

   		// добавить проверку itpApp.dataLS и itpApp.dataServ, и предложить выбор

   		function getJSONfromServer() {
   			return new Promise(function (resolve, reject) {
   				let xhr = new XMLHttpRequest();

   				xhr.open('GET', url);
   				xhr.onload = function () {
   					if (xhr.status === 200) {
   						resolve( xhr.responseText );
   					} else {
   						reject( `Server error: ${xhr.status}!` );
   					}
   				}
   				xhr.onerror = function () {
   					reject( Error("Сетевая ошибка при AJAX-запросе") );
   				}
				xhr.send();
   			});
   		}
	}// end of  getData


	checkCell (cell) {		// 		попадает ли ячейка в таблицу и возвращает координаты в таблице
		if ( !cell || cell.sheetId !== itpApp.aSh.id ) return false;

		let rowFrom = itpApp.aSh.corner.r,
			rowTo   = (itpApp.table.rows.length-1) + rowFrom - 1,
			colFrom = itpApp.aSh.corner.c,
			colTo   = (itpApp.table.rows[0].cells.length-1) + colFrom - 1;

		if ( (cell.row >= rowFrom && cell.row <= rowTo)  &&
			 (cell.columnN >= colFrom && cell.columnN <= colTo) ) {
			return { "r": cell.row     - rowFrom + 1, 
					 "c": cell.columnN - colFrom + 1  };
		} else return false;

	}

}// end of itpClass


// })();