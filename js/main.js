
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
		console.log( "getCcountMin(): ", getCcountMin() );		

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

			itpApp.getData();

			if ( itpApp.dataJSON ) {
				itpApp.dataJSON.forEach( (sh, i) => {
					let newSh = new itpSheetClass().fromJSON( sh );
					itpApp.data.push( newSh );
					if ( newSh["active"] )  itpApp.aSh = itpApp.data[ i ];
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

		function getRcountMin() {
			let main = document.querySelector('main'),
				divFormulaH   = 50,
				divSheetsTabH = 29,
				bottom = Math.trunc (0.02 * document.documentElement.clientHeight),	// 0.02 (2%) - т.к. html.height: 98%;
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

		document.body.onselectstart = () => false;
		itpApp.createSheet();
		itpApp.reFresh();


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
		 				itpApp.reFresh("changeSheet");	// может запускать только изменение выделенного диапазона?
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
			divScroll = document.querySelector("#divScroll"),
			tbodytt   = document.createElement("tbody");
		
		if (itpApp.isInit) return console.log("createSheet()... Приложение уже инициализировано! ");	// нужна ли эта проверка
		
		_fillSheet();

		// tt.onclick 	 	 = _clickGrid;
		tt.addEventListener( "click",  _clickGrid );
		tt.addEventListener( "click",  _clickTH   );
		tt.ondblclick 	 = _dblclickGrid;
		tt.onselectstart = () => false;		//	может, убрать? т.к. использую на body
		tt.onmousedown   = _tgMousedown;
		tt.onmouseup 	 = _tgMouseup;
		tt.onmousemove   = _tgMousemove;
		tt.onwheel       = (e) => document.querySelector(".tableDiv").scrollTop += e.deltaY;

		sheet.querySelector('div.tableDiv').onscroll = _gridScroll;


		window.onresize = function (e) {
			let tableDiv = document.querySelector('div.tableDiv'),
				TDs      = document.querySelectorAll("td:last-child"),
				padding  = 2 * itpApp._conf.cellSize.p,	//	px (padding  в ячейке - см. файл "style.css" )
				maxW	 = itpApp._conf.cellSize.w - padding, 
				diff, tdW;

			diff = tableDiv.clientWidth - tt.clientWidth - 5;
			tdW  = TDs[0].clientWidth - padding;
		
			if (diff < 0) {
				console.log("diff: ", diff);
				tdW = tdW - (-diff);
				console.log("tdW: ", tdW);
				if (tdW <= 1)  {  deleteLastTd();
								  return;         }  
			} else {
				tdW += diff;
				if (tdW > maxW) {
					let newTdW = tdW - maxW;
					tdW -= newTdW;
					[].forEach.call( TDs, function (td) {
						td.style.width = tdW + 'px';
					});
					if ( newTdW > padding ) addLastTd( newTdW - padding );
				}
			}
			[].forEach.call( TDs, function (td) {
				td.style.width = tdW + 'px';
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

		}// end of  window.onresize


		function _fillSheet (n=0) {	//	создание структуры листа и заполнение данными
			console.time(`_fillSheet(${n}) ... `);
			let row   = document.createElement("tr"),
				cell  = document.createElement("td"),
				itpSh = itpApp.data[ n ],
				tableDiv = document.querySelector('div.tableDiv'),
				countC, countR, lastTdW, TDs,
				temp;

			if ( !itpSh ) return console.log(`Нет данных листа [${n}]`);

			divScroll.style.width  = (itpSh.cCount+1) * itpApp._conf.cellSize.w + itpApp._conf.scrollSize + "px";
			divScroll.style.height = (itpSh.rCount+1) * itpApp._conf.cellSize.h + itpApp._conf.scrollSize + "px";

			countR = Math.trunc( tableDiv.clientHeight / (itpApp._conf.cellSize.h+3) );  // 2 - border; 16 - scroll
			// console.log("countR: ", countR);		 

			countC  = Math.trunc( tableDiv.clientWidth / (itpApp._conf.cellSize.w+3) );
			// console.log("countC: ", countC);
			
			lastTdW = (tableDiv.clientWidth-16-2-1) - 
					  countC * (itpApp._conf.cellSize.w + 1) -
					  2 * itpApp._conf.cellSize.p;

			// console.log("tableDiv.clientWidth:", tableDiv.clientWidth);
			// console.log("lastTdW:", lastTdW);


			for (let c = 0; c < countC; c++) {
				row.appendChild( cell.cloneNode(false) );
				if (c) row.cells[c].innerHTML = itpCellClass.getColName(c - 1);
			}

			if (lastTdW > 0) {
				cell.style.width = lastTdW + "px";
				row.appendChild( cell );
			}

			for (let r = 0, rCount = itpSh.rCount; r < countR/*rCount*/; r++) {
				tbodytt.appendChild( row.cloneNode(true) );
				if ( r ) tbodytt.rows[r].cells[0].outerHTML = "<th>" + r + "</th>"
			}

			//	tableGrid.appendChild(tbodyGrid);	// если	tbody создаём динамически (tbodyGrid = document.createElement("tbody");)
			tt.appendChild(tbodytt);	// если	tbody создаём динамически (tbodyGrid = document.createElement("tbody");)

			console.timeEnd(`_fillSheet(${n}) ... `);
		}// end of  _fillSheet()

	

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
					return;
				} else {
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
			let input, cellName, size,
				formula = document.querySelector("input.formula"); 

			if (e.target.nodeName === "TD") {
				cellName =	itpCellClass.getColName( (e.target.cellIndex-1) + itpApp.aSh.corner.c - 1) +
							( (e.target.parentNode.rowIndex-1) + itpApp.aSh.corner.r);
				size = e.target
				e.target.className = "input";
				input = document.createElement("input");
				input.className = "inGrid";
				console.dir(e.target);
				// console.dir(input);
				input.style.width = e.target.clientWidth - 10 - 2  + "px";
				
				input.value = itpApp.aSh.cells[cellName]? itpApp.aSh.cells[cellName].text : "";	//	может, использовать itpApp.aCell?

				input.onblur  = __inputBlur;
				input.onkeyup = function (e) { if (e.keyCode === 13) this.blur(); }
				input.oninput = function (e) { formula.value = this.value; }
	
				e.target.innerHTML = "";
				e.target.appendChild(input);
				console.dir(input);
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
				itpApp.aCell = itpApp.aSh.addCell(cellName, this.value);
				this.parentNode.innerHTML = itpApp.aCell.value;
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
				console.log("row: ", e.target.parentNode.rowIndex);
				console.log("col: ", e.target.cellIndex);
				console.log("corner: ", JSON.stringify(itpApp.aSh.corner));
				itpApp.aCell = null;
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
			r = Math.trunc( this.scrollTop / (itpApp._conf.cellSize.h/1) ) + 1;
			if (r !== itpApp.aSh.corner.r) {
				itpApp.aSh.corner.r = r;
				fillRowsTh(r);
				itpApp.reFresh();
			}

			c = Math.trunc( this.scrollLeft / (itpApp._conf.cellSize.w) ) + 1;
			if (c !== itpApp.aSh.corner.c) {
				itpApp.aSh.corner.c = c;
				fillColsTh(c);
				itpApp.reFresh();
			}

			if (needAddC < itpApp._conf.cellSize.w) {
				itpApp.aSh.cCount++;
				divScroll.style.width = (itpApp.aSh.cCount+1) * itpApp._conf.cellSize.w + itpApp._conf.scrollSize + "px";
			} 
			
			if (needAddR < itpApp._conf.cellSize.h) {
				itpApp.aSh.rCount++;
				divScroll.style.height = (itpApp.aSh.rCount+1) * itpApp._conf.cellSize.h + itpApp._conf.scrollSize + "px";
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

	reFresh (onlyValue=true) {		//	Calculation all cells in active sheet
		let /*table = document.querySelector("#tt"),*/
			cell, iCell,
			iSh = itpApp.aSh,
			r   = itpApp.table.rows.length, 
			c   = itpApp.table.rows[0].cells.length;

		// selection();

		for (let i = 1; i < r; i++) {
			for (let j = 1; j < c; j++) {

				cell = itpCellClass.getColName((j-1) + iSh.corner.c - 1) + ((i-1) + iSh.corner.r);
				itpApp.table.rows[i].cells[j].innerHTML = iSh.cells[cell] ? iSh.cells[cell].value : "";
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

}// end of itpClass

class itpSheetClass {

	constructor (rCount=30, cCount=20, isHide=true) {	//	false, чтобы переСоздавать лист (пока не использую) 
		this.id 	= -1;		// только создан. потом id >= 0
		this.name 	= "";
		this.rCount = rCount;
		this.cCount = cCount;
		this.cells 	= {};		// может, использовать спец.объект (WeakSet)? (или массив?)
		this.corner = {			// может лучше использовать
			r: 1,
			c: 1,
			get name () { return itpCellClass.getColName( this.c-1 ) + this.r; }
		};
	}

	fromJSON (sheetJSON) {		// может, как-то совместить с constructor ?
		if ( !sheetJSON ) return  console.log("Не передан sheetJSON!");

		let {id, name, rCount, cCount, cells, active=false} = sheetJSON;
		this.id 	= id;		
		this.name 	= name;
		this.rCount = rCount;
		this.cCount = cCount;
		for (let cell in cells) {
			let itpCell = new itpCellClass().fromJSON( cells[cell] );
    		this.cells[itpCell.name] = itpCell;
		}
		this.active	= active;

		return this;itpSheetClass
	}
	addCell (cellName, text="") {
		if ( !cellName )  return console.log('Не указана ячейка (например: "D4")');

		if ( this.cells[cellName] ) {	//	если text="" удалять? или value=0 ?
			this.cells[cellName].text = text;
			this.cells[cellName].getValue();
			return this.cells[cellName];
		} else {
			let cell = new itpCellClass();
			cell.sheetId = this.id;
			cell.name 	 = cellName;
		//	cell.id 	 = `[${+cell.sheetId}]${cell.name}`;
			cell.text    = text;
			cell.getValue();
			this.cells[cellName] = cell;
			return cell;
		}
	}
//	getSelected () {}

//	unSelect () {} 	

}//	end of  itpSheetClass


class itpCellClass {

	constructor () {		// подумать, какие параметры можно передавать...
		this.sheetId = -1;
		this.name 	 = "";
	//	this.id 	 = `[${this.sheetId}]${this.name}`;	// может, заменить на getter?
		this.text 	 = "";
		this.value 	 = ""
	//	this.td 	 = null;
	}

	fromJSON (cellJSON) {
		if ( !cellJSON ) return	console.log("Не передан cellJSON!");

		let {sheetId, name, id, text, value} = cellJSON;
		this.sheetId = sheetId;
		this.name 	 = name;
	//	this.id 	 = id;
		this.text 	 = text;
		this.value   = value;
		return this;
	}
	get id () { return `[${this.sheetId}]${this.name}`; }

	getValue () {
		let formula, result,
			sheet = +this.sheetId - 1;	//	для  _getValueByRef(formula)
			// output = document.querySelector("#outputCurrentState");

		if (this.text === "") return 0, this.value = "";

		if (this.text[0] === "=") {
			formula = this.text.substring(1);
			try   {
				result = new Function( "with (Math) { return " + _getValueByRef(formula) + "}" )(); 
			}
			catch (error) {	
				result = "<span class='error'>!</span>";
				console.log("Обибка в формуле - ячейка ", this.id);
				// output.innerHTML = 	"<b>Ошибка в формуле: </b> ячейка " + this.id + "<br>";
				// setTimeout( () => output.innerHTML="", 3000 );
			}

		} else { result = this.text; }
		return this.value = result;

		function _getValueByRef(formula) {		// sheet надо брать из formula!! (чтоб ссылаться на другие листы)  Добавить проверку, попадает ли ref на лист?
			return  formula.replace( /([A-Z]+\d+)/g, ref => {
				let val = itpApp.data[sheet].cells[ref]? itpApp.data[sheet].cells[ref].value
													   : 0;
				return 	val;						   
			});
		}
	}//	end of  getValue()

	get row () { return  +this.name.substring( this.name.search(/\d/) ); }
	
	get column () { return  this.name.substring( 0, this.name.search(/\d/) ); }

	get columnN () { return itpCellClass.getColumnN( this.name ); }

	setTD (txt=this.value) {	//	связь с конкретной ячейкой в HTML-таблице
		let table = document.querySelector("#tt"),
	//	let table = document.querySelector("div.sheet.active").querySelector("table.itpTable"),
			r 	  = this.row - 1,
			c 	  = this.columnN - 1;

		table.rows[r].cells[c].innerHTML = txt;
	//	return this.td;
	}

	static getColName (n=0) {	// получить символ столбца по его номеру	
		let chCount = itpApp._conf.colChars.end.charCodeAt(0) - 
					  itpApp._conf.colChars.start.charCodeAt(0) + 1,
			arr     = [],
			getChar = (i) => String.fromCharCode( itpApp._conf.colChars.start.charCodeAt(0) + i );	// а если i>chCount ?  (i присвоить itpApp._conf.colChars.end?)

		(function decomposition(N, base) {		// подумать, может base убрать?? (использовать сразу chCount)
			let temp = Math.floor(N / base);

			if (!temp) { arr.unshift( getChar(N) ); }
			else {
				arr.unshift( getChar(N % base) );
				decomposition( temp - 1, base );
			}
		})(n, chCount);

		return arr.join("");
	}

	static getRow (cellName) { return +cellName.substring( cellName.search(/\d/) ); }

	static getColumn (cellName) { return cellName.substring( 0, cellName.search(/\d/) ); }

	static getColumnN (cellName) {		//	получить номер столбца. Отсчёт с 1    //  get columnN () { ... }
		let startCode  = itpApp._conf.colChars.start.charCodeAt(0),
			endCode    = itpApp._conf.colChars.end.charCodeAt(0),
			count 	   = endCode - startCode + 1,
			colNameArr = itpCellClass.getColumn(cellName).split("").reverse();

		return colNameArr.reduce( (pr, cur, i) => {
        	return pr + Math.pow(count, i) + cur.charCodeAt(0) - startCode;
        }, 0);
	}

}//	end of  itpCellClass


class SelRangeClass {

	constructor (startR=-1, startC=-1, sheet=-1) {
		this.start     = { r: startR,  c: startC };
		this.end       = { r: startR,  c: startC };
		this.sheet     = sheet;
		this.inProcess = true;
		// this.getSelector();
	}

	get id () { return `[${this.sheet}]${itpCellClass.getColName( this.start.c-1 )}${this.start.r}:${itpCellClass.getColName( this.end.c-1 )}${this.end.r}`; }

	checkEnd (endR, endC) {		//	проверяем, изменился ли диапазон в процессе выделения
		let cp;
		if (this.end.r !== endR || this.end.c !== endC) {
			cp = this.copy().show("hovered", "remove");
			// cp = this.copy().setClass("hovered", "remove");

			if (this.end.r !== endR) this.end.r = endR;
			if (this.end.c !== endC) this.end.c = endC;
			cp = this.copy().show("hovered");
			// cp = this.copy().setClass("hovered");

			itpApp.formula.inputCell.value = cp.toString();
		}
	}

	checkStartEnd () {	// если  выделение начато не из верх.лев. угла
		if (this.start.r > this.end.r)  [this.start.r,  this.end.r] = [this.end.r, this.start.r];
		if (this.start.c > this.end.c) 	[this.start.c,  this.end.c] = [this.end.c, this.start.c];
		// this.getSelector();
		return this;
	}

	// getSelector () {
	// 	return this.selector = "tr:nth-child(n+" + (this.start.r+1) + "):not(:nth-child(n+" + (this.end.r+2) + ")) " +
	// 					   	   "td:nth-child(n+" + (this.start.c+1) + "):not(:nth-child(n+" + (this.end.c+2) + "))";
	// }

	// setClass (cssClass="", operation="add") {  // 
	// 	let range = document.querySelector("div.sheet.active")
	// 					.querySelectorAll(this.selector);
	// 	[].forEach.call( range, cell => cell.classList[operation](cssClass) );
	// 	return this;
	// }

	show (cssClass="selected", operation="add") {		// заменить на setClass ?
		let r, c;

		if ( this.sheet !== itpApp.aSh.id ) return;

		for (let i = 1, rows = itpApp.table.rows.length - 1; i <= rows; i++) {
			r = i + itpApp.aSh.corner.r - 1;
			for (let j = 1, cols = itpApp.table.rows[0].cells.length - 1; j <= cols; j++) {
				c = j + itpApp.aSh.corner.c - 1;
				if ( (r >= this.start.r && r <= this.end.r) && (c >= this.start.c && c <= this.end.c) ) {
					itpApp.table.rows[i].cells[j].classList[ operation ](cssClass);
				}
			}
		}

		return	this;
	}

	copy () {		// для применения стилей, пока диапазон в процессе установления...
		let cp  = new SelRangeClass();
		cp.start.r = this.start.r;
		cp.start.c = this.start.c;
		cp.end.r   = this.end.r;
		cp.end.c   = this.end.c;
		cp.sheet   = this.sheet;		
		cp.checkStartEnd();
		return cp;
	}

//	toString () { return `[${this.sheet}]${itpCellClass.getColName(this.start.c-1)}${this.start.r}:${itpCellClass.getColName(this.end.c-1)}${this.end.r}`; }
	toString () { return  this.id; }

}// end of  SelRangeClass


class FormulaClass {

	constructor (selector='input.formula') {
		this.input     = document.querySelector(selector);		//  this.input = document.querySelector(selector) || 
		this.inputCell = document.querySelector("#inputCell");
		this.active    = false;
		this.text      = "";
		this.onEvents();	//	события на input

	}// end of condtructor

	checkActive () {	//	
		this.text   = this.input.value;
		this.active = ( this.text.search(/[=+-/\*(]$/ig) !== -1 )? true : false;
	}

	onEvents () {	
		this.input.oninput = () => {
			this.checkActive();
			itpApp.aCell.td.innerHTML = this.text;	// !!!
		}
		this.input.onchange = () => {
			this.checkActive();
			console.log("onchange");
		}
		this.input.onkeyup = function (e) { 
			if (e.keyCode === 13) {
				itpApp.formula.active = false;
				itpApp.aCell.td.classList.add("selected");	// !!!
				this.blur();
			}
		}
		this.input.onfocus = (e) => {
			if ( !itpApp.aCell ) {
				console.log("this.input.onfocus()...  Нет активной ячейки!");
				console.dir(e.target);
				e.target.blur();
			} else {
				this.checkActive();
				itpApp.aCell.setTD( this.text );
			//	itpApp.aCell.td.innerHTML = this.text;
			}
		}
		this.input.onblur  = () => { 
			if ( itpApp.aCell && !this.active ) {
				itpApp.aCell.text = this.input.value;
				this.text         = this.input.value;
				itpApp.aSh.addCell( itpApp.aCell.name, itpApp.aCell.text );
				itpApp.aCell.td.innerHTML = itpApp.aCell.getValue();	// !!!
				itpApp.isNeedSave = true;
			} else console.log("this.input.onblur()...   Нет активной ячейки!");
		}

	}// end of   onEvents

/*	setValue (options=null) {
		(function () {
			return options => {
				this.text  = this.input.value;
				if ( !options ) this.value = (this.text === "")? "" : `f(${this.text})=??? ...  написать реализацию f()`;
			}
		})();
	}
*/

}// end of  FormulaClass




const itpApp = new itpClass();

document.addEventListener( "DOMContentLoaded", itpApp.init );

















	