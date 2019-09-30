<?php
/*
社内イントラ共有予定表プログラム
スケジュールテーブルを取得する
idと日付をキーにする
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

$data = array();
$st = $pdo->prepare(
	"SELECT *
	FROM schedule
	AS sch LEFT JOIN employee AS em
	ON sch.id = em.id
	WHERE date >= ? and date <= ?
	ORDER BY sch.id, date"
);
$st->execute(array($_POST['datefrom'],$_POST['dateto']));

while ($row = $st->fetch()) {
	$id = htmlspecialchars($row['id']);
	$name = htmlspecialchars($row['name']);
	$date = htmlspecialchars($row['date']);
	$plan = htmlspecialchars($row['plan']);

	/*配列を生成*/
	
	$row2 = array(
		"id" => $id,
		"name" => $name,
		"date" => $date,
		"plan" => $plan,
	);

	/*配列をアペンド*/

	$data[] = $row2;
}


header('Content-Type: application/json; charset=utf-8');
echo json_encode($data,  JSON_UNESCAPED_UNICODE);

?>
