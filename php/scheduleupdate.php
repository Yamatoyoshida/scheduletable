<?php
/*
スケジュールテーブルを更新する
idと日付をキーにして検索
存在しなければレコードを挿入
レコードが存在すればplanを更新
レコードが存在し、かつnewValueが空白なら（予定が削除されたら）
レコードを削除する
*/


/**以下　データベース接続のテンプレート */
/** MySQL データベース名 */
define('DB_NAME', 'database_schedule');

/** MySQL データベースのユーザー名 */
define('DB_USER', 'database_sch');

/** MySQL データベースのパスワード */
define('DB_PASSWORD', 'password');

/** MySQL のホスト名 */
define('DB_HOST', 'xxxx.ne.jp');

/** データベースのテーブルを作成する際のデータベースの文字セット */
define('DB_CHARSET', 'utf8');

/** データベースの照合順序 (ほとんどの場合変更する必要はありません) */
define('DB_COLLATE', '');


// 文字化け対策
$options = array(PDO::MYSQL_ATTR_INIT_COMMAND=>"SET CHARACTER SET 'utf8'");

// PHPのエラーを表示するように設定
error_reporting(E_ALL & ~E_NOTICE);

// データベースの接続
try {
	$pdo = new PDO('mysql:host='.DB_HOST.';dbname='.DB_NAME, DB_USER, DB_PASSWORD, $options);
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
	echo $e->getMessage();
	exit;
}

/**以上　データベース接続のテンプレート */


$id = htmlspecialchars($_POST['id']);
$date = date(htmlspecialchars($_POST['date']));
$oldValue  = htmlspecialchars($_POST['oldValue']);
$newValue  = htmlspecialchars($_POST['newValue']);

//idと日付でテーブルを検索
//件数チェック
$st = $pdo->query("SELECT  * FROM schedule WHERE id= {$id} AND date= '{$date}'");
$count = $st->fetchColumn();

if($count == ''){
	//データが無い場合、レコードを新規挿入
	$st = $pdo->prepare("INSERT INTO schedule VALUES({$id},'{$date}','{$newValue}')");
	$st->execute();
	echo "予定を挿入しました。変更前：、変更後：{$newValue}、id：{$id}、日付：{$date}";
	
	}else{
	//データが存在する場合planを更新
	if($newValue == ''){
		//変更後予定が空白の場合、レコードを削除
		$st = $pdo->prepare("DELETE FROM schedule WHERE id= {$id} AND date= '{$date}'");
		$st->execute();
		echo "予定を更新しました。変更前：{$oldValue}、変更後：、id：{$id}、日付：{$date}";
	}else{
		//変更後予定が空白でない場合、レコードのplanを更新
		$st = $pdo->prepare("UPDATE schedule SET plan= '{$newValue}' WHERE id= {$id} AND date= '{$date}'");
		$st->execute();
		echo "予定を更新しました。変更前：{$oldValue}、変更後：{$newValue}、id：{$id}、日付：{$date}";
		}
	}

?>
