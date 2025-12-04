<?php
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('Europe/Simferopol');

require __DIR__ . '/vendor/autoload.php';

use Dotenv\Dotenv;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->load();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "errorType" => "invalid method"]);
    exit;
}

function clean($value)
{
    return htmlspecialchars(trim($value), ENT_QUOTES, 'UTF-8');
}

$data = [];
$requiredKeys = ["name", "tel"];
foreach ($requiredKeys as $key) {
    if (!empty($_POST[$key])) {
        $data[$key] = clean($_POST[$key]);
    } else {
        echo json_encode(["status" => "error", "errorType" => "missing field: $key"]);
        exit;
    }
}
$additionKeys = ["addres", "mark", "year", "miles", "transmission", "engine"];
foreach ($additionKeys as $key) {
    if (!empty($_POST[$key])) {
        $data[$key] = clean($_POST[$key]);
    }
}

$provedFiles = [];
if (!empty($_FILES['file']['name'][0])) {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024;
    $finfo = new finfo(FILEINFO_MIME_TYPE);


    foreach ($_FILES['file']['name'] as $index => $origName) {
        // Prove File
        $tmpName = $_FILES['file']['tmp_name'][$index];
        $size = $_FILES['file']['size'][$index];
        $error = $_FILES['file']['error'][$index];

        if ($error !== UPLOAD_ERR_OK) {
            continue;
        }
        if ($size > $maxSize) {
            continue;
        }

        $fileType = $finfo->file($tmpName);
        if (!in_array($fileType, $allowedTypes, true)) {
            continue;
        }

        // File Name
        $extMap = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/gif'  => 'gif',
            'image/webp' => 'webp',
        ];
        $ext = $extMap[$fileType] ?? 'bin';
        $safeBase = preg_replace('/[^a-zA-Z0-9_\-]/', '_', pathinfo($origName, PATHINFO_FILENAME));
        $fileName = $safeBase . "." . $ext;

        $provedFiles[$fileName] = $tmpName;
    }
}

if (!empty($data["transmission"])) {
    $transmissions = [
        "auto" => "Автоматическая",
        "mechanical" => "Механическая",
        "gibrid" => "Гибридная"
    ];
    $data["transmission"] = $transmissions[$data["transmission"]] ?? "Что-то не так";
}
if (!empty($data["engine"])) {
    $engineTypes = [
        "benzin" => "Бензиновый",
        "diesel" => "Дизельный",
        "gaz" => "Газовый",
        "gibrid" => "Гибридный",
        "electro" => "Электро"
    ];
    $data["engine"] = $engineTypes[$data["engine"]] ?? "Что-то не так";
}
$data["time"] = date('d-m-Y, H:i:s');

$title = 'Заявка с сайта';
$body  = "Имя: {$data['name']}<br>
        Телефон: {$data['tel']}<br>
        " . (!empty($data['addres']) ? "Город: {$data['addres']}<br>" : "") . "
        " . (!empty($data['mark']) ? "Марка машины: {$data['mark']}<br>" : "") . "
        " . (!empty($data['year']) ? "Год выпуска: {$data['year']}<br>" : "") . "
        " . (!empty($data['miles']) ? "Пробег: {$data['miles']}<br>" : "") . "
        " . (!empty($data['transmission']) ? "Коробка передач: {$data['transmission']}<br>" : "") . "
        " . (!empty($data['engine']) ? "Тип двигателя: {$data['engine']}<br>" : "") . "
        Время отправки: {$data['time']}";
$altBody = "Имя: {$data['name']} \n
Телефон: {$data['tel']} \n
" . (!empty($data['addres']) ? "Город: {$data['addres']}\n" : "") . "
" . (!empty($data['mark']) ? "Марка машины: {$data['mark']}\n" : "") . "
" . (!empty($data['year']) ? "Год выпуска: {$data['year']}\n" : "") . "
" . (!empty($data['miles']) ? "Пробег: {$data['miles']}\n" : "") . "
" . (!empty($data['transmission']) ? "Коробка передач: {$data['transmission']}\n" : "") . "
" . (!empty($data['engine']) ? "Тип двигателя: {$data['engine']}\n" : "") . "
Время отправки: {$data['time']}";

$mail = new PHPMailer(true);
try {
    $mail->isSMTP();
    $mail->CharSet    = 'UTF-8';
    $mail->SMTPAuth   = true;

    $mail->Host = $_ENV['MAIL_HOST'];
    $mail->Username = $_ENV['MAIL_USERNAME'];
    $mail->Password = $_ENV['MAIL_PASSWORD'];
    $mail->SMTPSecure = $_ENV['MAIL_ENCRYPTION'];
    $mail->Port = $_ENV['MAIL_PORT'];

    $mail->setFrom($_ENV['MAIL_FROM'], 'Заявка с сайта');
    $mail->addAddress('fraksxx@gmail.com');
    // $mail->addAddress('vikypavto82@mail.ru');

    $mail->isHTML(true);
    $mail->Subject = $title;
    $mail->Body    = $body;
    $mail->AltBody = $altBody;
    if (!empty($provedFiles)) {
        foreach ($provedFiles as $name => $file) {
            $mail->addAttachment($file, $name);
        }
    }

    // $mail->SMTPDebug = 2;
    // $mail->Debugoutput = function ($str, $level) {
    //     file_put_contents(__DIR__ . '/smtpForm.log', '[' . $level . '] ' . $str . PHP_EOL, FILE_APPEND | LOCK_EX);
    // };

    $mail->send();

    echo json_encode(["status" => "success"]);
} catch (Exception $e) {
    header('HTTP/1.1 400 Bad Request');
    echo json_encode([
        "status" => "error",
        "errorType" => $mail->ErrorInfo
    ]);
}
