"use strict";

var itp = itp || {};
	
	itp._config = {
		rCount: 10,
		cCount: 20,
		cell: { width: 100, height: 20 }	// px;
	}

	itp.init = function () {
		var rCountInput = document.querySelector('#rCount'),
			cCountInput = document.querySelector('#cCount');
			
		rCountInput.value = itp._config.rCount;
		cCountInput.value = itp._config.cCount;

		document.querySelector('#btnCreate').addEventListener("click", function () {
			itp.rCount = rCountInput.value;
			itp.cCount = cCountInput.value;
			itp._createTables();
		});
	}
		
	itp._createTables = function () {
		var table = document.querySelector('#itpTable'),
			tableCol = document.querySelector('#itpTableCol'),
			tableRow = document.querySelector('#itpTableRow'),
		//	tbody = table.getElementsByTagName('tbody'),
			r, c, row;

		if (itp._isCreat) { alert("Таблица уже создана!"); }
		else {

			table.width  = itp.cCount * itp._config.cell.width + "px";
			table.height = itp.rCount * itp._config.cell.height + "px";

			table.addEventListener("click", function (e) {
				var input; 

				if (e.target.nodeName === "TD") {
					input = document.createElement("input");
					input.className = "inGrid";
					input.value = e.target.innerHTML;
					input.onblur = function () {
						this.parentNode.innerHTML = this.value;
					//	this.parentNode.removeChild(this);
					};
					e.target.style.padding = 0;
					e.target.innerHTML = "";
					e.target.appendChild(input);
					input.focus();

				//	console.log(e.target);
				//	console.log(document.querySelector('td'));
				//	console.log(e.target.nodeName);
				}
				
			});





			for (r = 0; r < itp.rCount; r++) {
				table.insertRow(r);
				tableRow.insertRow(r).insertCell(0).outerHTML = "<th>" + (r + 1) + "</th>";

				for (c = 0; c < itp.cCount; c++) {
					if (r === 0) { 
						if (c === 0 ) { tableCol.insertRow(0) };
						tableCol.rows[0].insertCell(c).outerHTML = "<th>" + String.fromCharCode(65 + c) + "</th>";
						//tableCol.rows[0].insertCell(c).textContent = String.fromCharCode(65 + c);
					 }
					table.rows[r].insertCell(c);
				//		table.rows[r].insertCell(c).textContent =  ( r === 0 ) ? c+1 :
				//											   ( c === 0 ) ? r+1 : "";
				}
			}

			itp._isCreat = true;

			document.querySelector('main').style.display = "block";

			table.onscroll = function() {
				console.log("table.onscroll");
  			//	var scrolledY = table.pageYOffset || document.documentElement.scrollTop,
  		//			scrolledX = table.pageXOffset || document.documentElement.scrollLeft;
  	//			console.log( "Y: " + scrolledY + 'px' );
  //				console.log( "X: " + scrolledX + 'px' );
			}
			console.dir(table);
			console.dir(document.querySelector('td').height);
			console.dir(document.querySelector('th').height);	
	//	document.querySelector('.rowHeader').offsetHeight = document.querySelector('.table').offsetHeight;
	//	console.log(document.querySelector('.table').style.height);
	//	console.log(document.querySelector('.rowHeader').style);
	//	console.log(table.offsetHeight);

		}
	}

document.addEventListener("DOMContentLoaded", itp.init);














	