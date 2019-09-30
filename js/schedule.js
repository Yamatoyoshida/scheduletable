//画面入力日付期間を元にAjax通信によりshceduleテーブルを取得
//また同様にAjax通信によりemployeeテーブルを全件取得
//employeeデータと日付期間で画面出力用スケジュールデータ一覧を生成
//employee.idと日付でscheduleテーブルを検索し、予定を取得・画面に表示
//取得できない場合を空の予定を画面に表示
//JavaScriptライブラリHandsontableで出力を実現
//Handsontableは画面上でデータの入力、更新、削除ができる
//データが更新されたらAjax通信でscheduleテーブルを更新する
//
//2019.5.10 	Yamato Yoshida
//

//画面取得時、日付セット
window.onload = function () {
	let date = new Date(),
		aaa = date.getDay();

	//週初め（日曜日）を取得
	date.setDate(date.getDate() - aaa);

	let year = date.getFullYear(),
		month = date.getMonth() + 1,
		day = date.getDate(),
		yyyy = ('000' + year).slice(-4),
		mm = ('0' + month).slice(-2),
		dd = ('0' + day).slice(-2),

		ymd = yyyy + "-" + mm + "-" + dd;

	//本日日付を画面に出力
	document.getElementById('datefrom').value = ymd;

	//3週間後をセット
	ymd = changeDateTo(date, 21);
	//3週間後日付を画面に出力
	document.getElementById('dateto').value = ymd;
	//スケジュールテーブル生成
	makeTable();
};


// 日付変更関数
//dateをd日後へ変更する
function changeDateTo(date, d) {
	date.setDate(date.getDate() + d);

	let year = date.getFullYear(),
		month = date.getMonth() + 1,
		day = date.getDate(),
		yyyy = ('000' + year).slice(-4),
		mm = ('0' + month).slice(-2),
		dd = ('0' + day).slice(-2),
		ymd = yyyy + "-" + mm + "-" + dd;
	return ymd;
};

//画面のボタン「前週」「翌週」押下で処理切り分け
//1週間を前後させる
	function weekChange(id) {
		let date = new Date(document.getElementById('datefrom').value);
	num = '';

	if (id === 'prev') {
		//「前週」ボタン押下時 -7日
		num = -7;
	} else if (id === 'next') {
		//「翌週」ボタン押下時 +7日
		num = +7;
	}
	//datefromをセット
	let ymd = changeDateTo(date, num);
	//日付を画面に出力
	document.getElementById('datefrom').value = ymd;
	//datetoをセット
	ymd = changeDateTo(date, 21)
	//日付を画面に出力
	document.getElementById('dateto').value = ymd;

	//スケジュールテーブル更新
	makeTable();
};

function makeTable() {
	let
		url = "./php/scheduleget.php",
		datefrom = document.getElementById('datefrom').value,
		dateto = document.getElementById('dateto').value,
		//完了を知らせるためにDeferredオブジェクトを生成しそれを返す
		deferred = new jQuery.Deferred();
	jQuery.ajax({
		type: "POST",
		url: url,
		cache : false,
		crossDomain: true,
		dataType: 'json',
		data: {
			"datefrom": datefrom,
			"dateto": dateto
		},
	}).done(function (data) {
		//画面出力用スケジュールテーブル生成、画面へ出力
		tableDesign(data, datefrom, dateto);
		console.log('done to makeTable');
	}).fail(function () {
		console.log('fail to makeTable');
	}).always(function () {
		console.log('ajax makeTable finish');
		//ajax処理を終了したことをDeferredオブジェクトに通知
		deferred.resolve();
	});
	//完了を知らせるためにDeferredオブジェクトを生成しそれを返す
	return deferred;
}

////////////////////////////

//従業員テーブルを全件取得
function tableDesign(scheduledata, datefrom, dateto) {
	let 
		url = "./php/employeeget.php",
		//完了を知らせるためにDeferredオブジェクトを生成しそれを返す
		deferred = new jQuery.Deferred(),
		dateArray = new Array;

	jQuery.ajax({
		type: "POST",
		cache : false,
		url: url,
		crossDomain: true,
		dataType: 'json'
	}).done(function (employeedata) {

		//画面入力日付より、日付格納テーブルを生成
		dateArray = makeDateArray(datefrom, dateto);

		//画面表示用スケジュールテーブルの生成、出力
		makeScheduleArray(scheduledata, employeedata, dateArray);

	}).fail(function () {
		console.log('fail to get employee');

	}).always(function () {
		console.log('ajax employeeget finish');
		//ajax処理を終了したことをDeferredオブジェクトに通知
		deferred.resolve();
	})
}

//Ajaxで取得したスケジュールテーブル、従業員テーブルと、
//画面入力日付期間より生成した日付テーブルより
//画面出力用カレンダーを生成して出力する
function makeScheduleArray(scheduleData, employeeData, dateArray) {
		let lenOfSch = scheduleData.length,
		lenOfEmp = employeeData.length,
		lenOfDateAry = dateArray.length,
		calendarData = new Array;

	//ヘッダーを生成
	let colHeader = new Array('名前', '部署');

	//列ヘッダー（日付）の生成
	//mm月dd日(aa)の形で配列を生成
	for (let k = 0; k < lenOfDateAry; k++) {
		let lDate = new Date(dateArray[k]),
			month = lDate.getMonth() + 1,
			day = lDate.getDate(),
			mm = ('0' + month).slice(-2),
			dd = ('0' + day).slice(-2),
			dayOfWeek = lDate.getDay(), // 曜日(数値)
			dayOfWeekStr = ["(日)", "(月)", "(火)", "(水)", "(木)", "(金)", "(土)"][dayOfWeek], // 曜日(日本語表記)
			mmddaa = mm + '月' + dd + '日' + dayOfWeekStr;

		colHeader.push(mmddaa);
	}

	//従業員名簿をループ
	for (let i = 0; i < lenOfEmp; i++) {
		let line = new Array();
		//従業員テーブル[名前]を追加
		line.push(employeeData[i][1]);
		//従業員テーブル[部署]を追加
		line.push(employeeData[i][2]);

		//日付配列をループ
		for (let j = 0; j < lenOfDateAry; j++) {
			//空白予定を仮で入れる
			line.push('');

			//従業員＋日付でスケジュールデータを検索
			//予定を検索、該当データが無ければ予定＝空白のまま　あれば更新
			//画面出力用のスケジュールテーブルを生成する.
			for (let k = 0; k < lenOfSch; k++) {
				if (scheduleData[k].id == employeeData[i][0] && scheduleData[k].date == dateArray[j]) {
					//配列のj+2番目の値を上書き（先頭2件は「名前」と「部署」なので2個ずれる）
					line[j + 2] = scheduleData[k].plan;
					//スケジュールテーブルはIDと日付で一意なのでループを抜ける
					break;
				}
			}
		}

		calendarData.push(line);

	}
	//Handsontable生成
	makeHandsonTable(colHeader, calendarData, employeeData, dateArray);

}

//画面日付期間から日付テーブルを生成
function makeDateArray(date1, date2) {
	const DATEFROM = new Date(date1),
		DATETO = new Date(date2);

	//2日付の期間を求める計算
	let termDay = ((DATETO - DATEFROM) / 86400000) + 1,
		dateArray = new Array();

	for (let i = 0; i < termDay; i++) {
		let dateFrom = new Date(date1);
		ymd = changeDateTo(dateFrom, i);
		dateArray.push(ymd);
	}
	return dateArray;
}

/////////////Handsontable生成 START////////////////
function makeHandsonTable(colHeader, calendarData, employeeData, dateArray) {
	//HTMLをクリア
	document.getElementById('append_area').innerHTML = '';
	let
		container1 = document.getElementById('append_area'),
		hot1,
		date = new Date(document.getElementById('datefrom').value),
		day = date.getDay(),
		thisToday = new Date(),
		aaa = thisToday.getDay();

		//本日日付格納ロジック
	let monthOfToday = thisToday.getMonth() + 1,
		dayOfToday = thisToday.getDate(),
		mm = ('0' + monthOfToday).slice(-2),
		dd = ('0' + dayOfToday).slice(-2),
		dayOfWeekStr = ["(日)", "(月)", "(火)", "(水)", "(木)", "(金)", "(土)"][aaa], // 曜日(日本語表記)
		mmddaa = mm + '月' + dd + '日' + dayOfWeekStr;

	//奇数行を色付け
	function rowRendererOdd(instance, td, row, col, prop, value, cellProperties) {
		Handsontable.renderers.TextRenderer.apply(this, arguments);
		td.style.background = '#faf5e1';
	}
	//日曜日列の色定義
	function colRendererSun(instance, td, row, col, prop, value, cellProperties) {
		Handsontable.renderers.TextRenderer.apply(this, arguments);
		td.style.background = '#fff0f5';
	}
	//土曜日列の色定義
	function colRendererSat(instance, td, row, col, prop, value, cellProperties) {
		Handsontable.renderers.TextRenderer.apply(this, arguments);
		td.style.background = '#f0ffff';
	}
	//本日列の色定義
	function colRendererToday(instance, td, row, col, prop, value, cellProperties) {
		Handsontable.renderers.TextRenderer.apply(this, arguments);
		td.style.background = '#fffacd';
	}
	//行ヘッダーの定義
	function rowHeaderRender(instance, td, row, col, prop, value, cellProperties) {
		Handsontable.renderers.TextRenderer.apply(this, arguments);
	}

	//handsontable出力	
	hot1 = new Handsontable(container1, {
		data: calendarData,
		colHeaders: colHeader,
		//rowHeaders: rowHeader,
		fixedRowsTop: 0,
		fixedColumnsLeft: 1,
		autoRowSize: true,
		fillHandle: false,
		autoColumnSize: true,
		//colWidths: 110,
		//wordWrap: true,
		//width: '100%',
		currentRowClassName: 'currentRow',
		currentColClassName: 'currentCol',

		//値が更新された場合の処理		
		afterChange: function (changes, source) {
			if (source === 'loaddata') {
				return;
			}

			if (source == 'edit' ||
				source == 'CopyPaste.paste' ||
				source == 'Autofill.fill') {
				for (let i = 0; i < changes.length; i++) {
					let row = changes[i][0];
					let col = changes[i][1];
					let oldValue = changes[i][2];
					let newValue = changes[i][3];

					if (oldValue != newValue) {
						//変更前と変更後を比較して、データに違いがあればデータベース更新
						//col(列)の先頭2件は「名前」「部署」なのでdateArray検索時2件ずれる
						dataUpdate(employeeData[row][0], dateArray[col - 2], oldValue, newValue);
					}
				}
			}
		},

		cells: function (row, col, prop) {
			var cellProperties = {};

			//列の色分け
			if ((col + 7 - 2 + day) % 7 === 0) {
				//日曜日の場合色付け
				cellProperties.renderer = colRendererSun;
				//土曜日の場合色付け
			} else if ((col + 7 - 2 + day) % 7 === 6) {
				cellProperties.renderer = colRendererSat;
			};

			//行ヘッダー(1,2列目)の定義
			if (col === 0 || col === 1) {
				cellProperties.renderer = rowHeaderRender;
				//読み取り専用
				cellProperties.readOnly = true;
			}

			//本日(曜日)列を色付け
			if (col === aaa + 2) {
				cellProperties.renderer = colRendererToday;
			}

			return cellProperties;
		},


	});

	//画面サイズ変更時の処理
	//resizeをキャッチしたらresize()を発火
	let resizeTimer;
	let interval = Math.floor(1000 / 60 * 10);

	// リサイズ完了時
	window.addEventListener('resize', function (event) {
		if (resizeTimer !== false) {
			clearTimeout(resizeTimer);
		}
		resizeTimer = setTimeout(function () {
			resize();
		}, interval);
	})

	// リサイズの関数
	function resize() {
		hot1.updateSettings({
			width: '100%',
		});
	}
}
/////////////Handsontable生成 END////////////////

//データ更新時の処理
//Ajax通信でスケジュールテーブルを更新する
//予定が削除された場合はスケジュールテーブルのレコードを削除する
//let dataUpdate = (id, date, oldV, newV) => {
function dataUpdate(id, date, oldV, newV) {
	let 
	     url = "./php/scheduleupdate.php",
	     //完了を知らせるためにDeferredオブジェクトを生成しそれを返す
		deferred = new jQuery.Deferred();

	console.log(id);
	console.log(date);
	console.log(oldV);
	console.log(newV);
	jQuery.ajax({
		type: "POST",
		cache : false,
		url: url,
		crossDomain: true,
		data: {
			"id": id,
			"date": date,
			"oldValue": oldV,
			"newValue": newV
		},
		dataType: 'text'
	}).done(function (data) {
		console.log('done to update');
		console.log(data);

	}).fail(function (data) {
		console.log('fail to update');
		console.log(data);
	}).always(function () {
		console.log('ajax update finish');
		//ajax処理を終了したことをDeferredオブジェクトに通知
		deferred.resolve();
	});
	//完了を知らせるためにDeferredオブジェクトを生成しそれを返す
	return deferred;
}