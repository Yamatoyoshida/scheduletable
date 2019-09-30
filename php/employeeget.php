<?php
/*
社内イントラ共有予定表プログラム
従業員テーブルを全件取得する
idでソートして取得
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

$st = $pdo->prepare(
	"SELECT *
	FROM employee
	ORDER BY id"
);

$st->execute();
while ($row = $st->fetch()) {

	$id = htmlspecialchars($row['id']);
	$name = htmlspecialchars($row['name']);
	$department = htmlspecialchars($row['department']);

	$row2 = array();
	array_push($row2,$id);
	array_push($row2,$name);
	array_push($row2,$department);

$data[] = $row2;
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($data,  JSON_UNESCAPED_UNICODE);

?>
