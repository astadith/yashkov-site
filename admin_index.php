<?php
/**
 * Панель управления сайтом художника Александра Яшкова
 * URL: yashkov29.ru/admin/
 * Совместимо со всеми версиями PHP (5.6 - 8.x)
 */
session_start();

$ROOT_DIR = dirname(__DIR__);
$DATA_FILE = $ROOT_DIR . '/gallery-data.json';
$CONTENT_FILE = $ROOT_DIR . '/content-data.json';
$INDEX_HTML = $ROOT_DIR . '/index.html';
$CONFIG_FILE = __DIR__ . '/.auth.json';
$WORKS_DIR = $ROOT_DIR . '/assets/img/works';
$THUMBS_DIR = $WORKS_DIR . '/_thumbs';

function get_v($arr, $k, $def = '') {
    return (is_array($arr) && isset($arr[$k])) ? $arr[$k] : $def;
}

// Инициализация файла авторизации
if (!file_exists($CONFIG_FILE)) {
    $default_hash = password_hash('yashkov2026', PASSWORD_DEFAULT);
    file_put_contents($CONFIG_FILE, json_encode([
        'login' => 'admin',
        'password' => $default_hash
    ]));
}

// Инициализация данных текстов
if (!file_exists($CONTENT_FILE)) {
    file_put_contents($CONTENT_FILE, json_encode([
        'phone' => '+7 (921) 673-53-30',
        'phone_clean' => '+79216735330',
        'email' => 'art_yashkov@mail.ru',
        'address' => 'г. Архангельск, Соломбала, Никольский пр-т, 44 к. 1',
        'about_title' => 'Художник, педагог',
        'about_lead' => 'Александр Николаевич Яшков родился 21 марта 1969 года в Холмогорах. С детства тянулся к рисованию, и изобразительное искусство стало делом всей жизни.',
        'studio_note' => 'Для всех занятий материалы предоставляются!'
    ], JSON_UNESCAPED_UNICODE));
}

$config = json_decode(file_get_contents($CONFIG_FILE), true);
$content = json_decode(file_get_contents($CONTENT_FILE), true);
$message = '';
$message_type = 'success';
$active_tab = isset($_GET['tab']) ? $_GET['tab'] : 'gallery';

// Выход
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit;
}

// Авторизация
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'login') {
    $login = trim(get_v($_POST, 'login', ''));
    $pass = trim(get_v($_POST, 'password', ''));

    if ($login === $config['login'] && password_verify($pass, $config['password'])) {
        $_SESSION['yashkov_auth'] = true;
        $_SESSION['yashkov_user'] = $login;
        header('Location: index.php');
        exit;
    } else {
        $message = 'Неверный логин или пароль';
        $message_type = 'error';
    }
}

// Проверка сессии
$is_auth = !empty($_SESSION['yashkov_auth']);
if (!$is_auth) {
    render_login($message, $message_type);
    exit;
}

// Загрузка галереи
$gallery = [];
if (file_exists($DATA_FILE)) {
    $gallery = json_decode(file_get_contents($DATA_FILE), true);
    if (!is_array($gallery)) $gallery = [];
}

// Обработка действий авторизованного пользователя
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = get_v($_POST, 'action', '');

    // Смена пароля
    if ($action === 'change_password') {
        $active_tab = 'security';
        $old_p = get_v($_POST, 'old_password', '');
        $new_p = trim(get_v($_POST, 'new_password', ''));

        if (!password_verify($old_p, $config['password'])) {
            $message = 'Текущий пароль указан неверно';
            $message_type = 'error';
        } elseif (strlen($new_p) < 6) {
            $message = 'Новый пароль должен содержать не менее 6 символов';
            $message_type = 'error';
        } else {
            $config['password'] = password_hash($new_p, PASSWORD_DEFAULT);
            file_put_contents($CONFIG_FILE, json_encode($config));
            $message = 'Пароль успешно изменён!';
            $message_type = 'success';
        }
    }

    // Сохранение текстов сайта
    if ($action === 'save_texts') {
        $active_tab = 'texts';
        $content['phone'] = trim(get_v($_POST, 'phone', $content['phone']));
        $content['phone_clean'] = preg_replace('/[^\+0-9]/', '', $content['phone']);
        $content['email'] = trim(get_v($_POST, 'email', $content['email']));
        $content['address'] = trim(get_v($_POST, 'address', $content['address']));
        $content['studio_note'] = trim(get_v($_POST, 'studio_note', $content['studio_note']));

        file_put_contents($CONTENT_FILE, json_encode($content, JSON_UNESCAPED_UNICODE));

        // Обновляем index.html
        if (file_exists($INDEX_HTML)) {
            $html = file_get_contents($INDEX_HTML);
            $html = preg_replace('/href="tel:[^"]+"/', 'href="tel:' . $content['phone_clean'] . '"', $html);
            $html = preg_replace('/href="mailto:[^"]+"/', 'href="mailto:' . $content['email'] . '"', $html);
            file_put_contents($INDEX_HTML, $html);
        }

        $message = 'Контакты на сайте успешно обновлены!';
        $message_type = 'success';
    }

    // Добавление новой работы
    if ($action === 'add_work') {
        $active_tab = 'gallery';
        $title = trim(get_v($_POST, 'title', ''));
        $desc = trim(get_v($_POST, 'desc', ''));
        $cat = get_v($_POST, 'cat', 'zhivopis');

        $valid_cats = ['zhivopis', 'grafika', 'plener', 'sculpture'];
        if (!in_array($cat, $valid_cats)) $cat = 'zhivopis';

        if (empty($title)) {
            $message = 'Пожалуйста, введите название работы';
            $message_type = 'error';
        } elseif (!isset($_FILES['photo']) || $_FILES['photo']['error'] !== UPLOAD_ERR_OK) {
            $message = 'Пожалуйста, выберите файл фотографии для загрузки';
            $message_type = 'error';
        } else {
            $res = process_uploaded_image($_FILES['photo'], $cat, $WORKS_DIR, $THUMBS_DIR);
            if ($res['success']) {
                $caption = '«' . $title . '»';
                if (!empty($desc)) {
                    $caption .= ' · ' . $desc;
                }

                $new_item = [
                    'src' => $res['thumb_rel'],
                    'full' => $res['full_rel'],
                    'cap' => $caption,
                    'cat' => $cat,
                    'pid' => time()
                ];

                file_put_contents($DATA_FILE . '.bak', json_encode($gallery, JSON_UNESCAPED_UNICODE));
                array_unshift($gallery, $new_item);
                file_put_contents($DATA_FILE, json_encode($gallery, JSON_UNESCAPED_UNICODE));

                $message = 'Работа «' . htmlspecialchars($title) . '» успешно добавлена в галерею на сайт!';
                $message_type = 'success';
            } else {
                $message = 'Ошибка при обработке фото: ' . $res['error'];
                $message_type = 'error';
            }
        }
    }

    // Удаление работы
    if ($action === 'delete_work') {
        $active_tab = 'gallery';
        $pid = get_v($_POST, 'pid', '');
        $found = false;
        $updated = [];
        foreach ($gallery as $item) {
            if (isset($item['pid']) && (string)$item['pid'] === (string)$pid) {
                $found = true;
            } else {
                $updated[] = $item;
            }
        }
        if ($found) {
            file_put_contents($DATA_FILE . '.bak', json_encode($gallery, JSON_UNESCAPED_UNICODE));
            $gallery = $updated;
            file_put_contents($DATA_FILE, json_encode($gallery, JSON_UNESCAPED_UNICODE));
            $message = 'Работа успешно удалена из галереи.';
            $message_type = 'success';
        }
    }

    // Редактирование подписи
    if ($action === 'edit_caption') {
        $active_tab = 'gallery';
        $pid = get_v($_POST, 'pid', '');
        $new_cap = trim(get_v($_POST, 'caption', ''));
        if (!empty($new_cap)) {
            foreach ($gallery as &$item) {
                if (isset($item['pid']) && (string)$item['pid'] === (string)$pid) {
                    $item['cap'] = $new_cap;
                    break;
                }
            }
            file_put_contents($DATA_FILE, json_encode($gallery, JSON_UNESCAPED_UNICODE));
            $message = 'Подпись работы успешно обновлена!';
            $message_type = 'success';
        }
    }
}

render_dashboard($gallery, $content, $active_tab, $message, $message_type);

// -----------------------------------------------------------------------------
// ОБРАБОТКА ИЗОБРАЖЕНИЙ (WEBP & GD)
// -----------------------------------------------------------------------------

function process_uploaded_image($file, $cat, $works_dir, $thumbs_dir) {
    if (!is_dir($works_dir . '/' . $cat)) {
        @mkdir($works_dir . '/' . $cat, 0755, true);
    }
    if (!is_dir($thumbs_dir)) {
        @mkdir($thumbs_dir, 0755, true);
    }

    $tmp = $file['tmp_name'];
    $info = @getimagesize($tmp);
    if (!$info) {
        return ['success' => false, 'error' => 'Загруженный файл не является изображением'];
    }

    $mime = $info['mime'];
    $w = $info[0];
    $h = $info[1];

    switch ($mime) {
        case 'image/jpeg':
            $src_img = @imagecreatefromjpeg($tmp);
            break;
        case 'image/png':
            $src_img = @imagecreatefrompng($tmp);
            break;
        case 'image/webp':
            $src_img = function_exists('imagecreatefromwebp') ? @imagecreatefromwebp($tmp) : null;
            break;
        default:
            return ['success' => false, 'error' => 'Формат не поддерживается (используйте JPG, PNG или WebP)'];
    }

    if (!$src_img) {
        return ['success' => false, 'error' => 'Не удалось открыть изображение'];
    }

    if (function_exists('exif_read_data') && ($mime === 'image/jpeg')) {
        $exif = @exif_read_data($tmp);
        if (!empty($exif['Orientation'])) {
            switch ($exif['Orientation']) {
                case 3: $src_img = imagerotate($src_img, 180, 0); break;
                case 6: $src_img = imagerotate($src_img, -90, 0); $temp = $w; $w = $h; $h = $temp; break;
                case 8: $src_img = imagerotate($src_img, 90, 0); $temp = $w; $w = $h; $h = $temp; break;
            }
        }
    }

    $filename_base = $cat . '_' . time() . '_' . rand(100, 999);
    $full_path = $works_dir . '/' . $cat . '/' . $filename_base . '.webp';
    $thumb_path = $thumbs_dir . '/' . $filename_base . '.webp';

    // 1. Полный размер (Full max 1920px)
    $max_full = 1920;
    if ($w > $max_full || $h > $max_full) {
        if ($w >= $h) {
            $new_w = $max_full;
            $new_h = (int)($h * ($max_full / $w));
        } else {
            $new_h = $max_full;
            $new_w = (int)($w * ($max_full / $h));
        }
        $full_img = imagecreatetruecolor($new_w, $new_h);
        imagecopyresampled($full_img, $src_img, 0, 0, 0, 0, $new_w, $new_h, $w, $h);
    } else {
        $full_img = $src_img;
    }
    imagewebp($full_img, $full_path, 88);

    // 2. Миниатюра (Thumb max 640px)
    $max_thumb = 640;
    if ($w >= $h) {
        $tw = $max_thumb;
        $th = (int)($h * ($max_thumb / $w));
    } else {
        $th = $max_thumb;
        $tw = (int)($w * ($max_thumb / $h));
    }
    $thumb_img = imagecreatetruecolor($tw, $th);
    imagecopyresampled($thumb_img, $src_img, 0, 0, 0, 0, $tw, $th, $w, $h);
    imagewebp($thumb_img, $thumb_path, 82);

    imagedestroy($src_img);
    if ($full_img !== $src_img) imagedestroy($full_img);
    imagedestroy($thumb_img);

    return [
        'success' => true,
        'full_rel' => 'assets/img/works/' . $cat . '/' . $filename_base . '.webp',
        'thumb_rel' => 'assets/img/works/_thumbs/' . $filename_base . '.webp'
    ];
}

// -----------------------------------------------------------------------------
// ВЕРСТКА: ЭКРАН ВХОДА
// -----------------------------------------------------------------------------
function render_login($message, $message_type) {
?>
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Вход в мастерскую · Александр Яшков</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --canvas: #f5f0e6;
    --paper: #fcf9f2;
    --ink: #2b2b28;
    --amber: #c98a2d;
    --amber-deep: #a96f1f;
    --north-deep: #2e4645;
    --serif: "Cormorant Garamond", Georgia, serif;
    --sans: "Manrope", sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--canvas);
    font-family: var(--sans);
    color: var(--ink);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .login-card {
    background: var(--paper);
    border: 1.5px solid rgba(201, 138, 45, 0.4);
    border-radius: 16px;
    box-shadow: 0 20px 50px rgba(43, 43, 40, 0.16);
    width: min(420px, 100%);
    padding: 40px 32px;
    text-align: center;
  }
  .login-logo {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    border: 2px solid var(--amber);
    margin: 0 auto 16px;
    box-shadow: 0 6px 18px rgba(201, 138, 45, 0.3);
  }
  h1 {
    font-family: var(--serif);
    font-size: 1.85rem;
    color: var(--north-deep);
    margin-bottom: 6px;
  }
  .sub {
    font-size: 0.92rem;
    color: #666;
    margin-bottom: 28px;
  }
  .alert {
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 0.88rem;
  }
  .alert-error {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ffcdd2;
  }
  .form-group {
    margin-bottom: 18px;
    text-align: left;
  }
  label {
    display: block;
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--north-deep);
    margin-bottom: 6px;
  }
  input[type="text"], input[type="password"] {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid rgba(43, 43, 40, 0.2);
    border-radius: 8px;
    font-size: 1rem;
    font-family: inherit;
    background: #fff;
    transition: border-color 0.2s;
  }
  input:focus {
    outline: none;
    border-color: var(--amber);
  }
  .btn-submit {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%);
    color: #fff;
    border: none;
    border-radius: 8px;
    font-family: inherit;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 6px 18px rgba(201, 138, 45, 0.35);
    transition: filter 0.2s, transform 0.2s;
  }
  .btn-submit:hover {
    filter: brightness(1.08);
    transform: translateY(-1px);
  }
  .back-link {
    display: inline-block;
    margin-top: 22px;
    font-size: 0.88rem;
    color: #777;
    text-decoration: none;
  }
  .back-link:hover { color: var(--amber-deep); }
</style>
</head>
<body>
<div class="login-card">
  <img src="../assets/img/logo-nav.webp" alt="Логотип" class="login-logo">
  <h1>Управление сайтом</h1>
  <p class="sub">Творческая мастерская Александра Яшкова</p>

  <?php if (!empty($message)): ?>
    <div class="alert alert-<?php echo $message_type; ?>"><?php echo htmlspecialchars($message); ?></div>
  <?php endif; ?>

  <form method="POST">
    <input type="hidden" name="action" value="login">
    <div class="form-group">
      <label>Логин</label>
      <input type="text" name="login" value="admin" required autofocus>
    </div>
    <div class="form-group">
      <label>Пароль</label>
      <input type="password" name="password" placeholder="Введите пароль" required>
    </div>
    <button type="submit" class="btn-submit">Войти в панель</button>
  </form>
  <a href="../" class="back-link">← Вернуться на сайт</a>
</div>
</body>
</html>
<?php
}

// -----------------------------------------------------------------------------
// ВЕРСТКА: ПАНЕЛЬ УПРАВЛЕНИЯ
// -----------------------------------------------------------------------------
function render_dashboard($gallery, $content, $active_tab, $message, $message_type) {
    $counts = [
        'all' => count($gallery),
        'zhivopis' => 0,
        'grafika' => 0,
        'plener' => 0,
        'sculpture' => 0
    ];
    foreach ($gallery as $it) {
        $c = get_v($it, 'cat', 'zhivopis');
        if (isset($counts[$c])) $counts[$c]++;
    }
?>
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Мастерская · Управление сайтом</title>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root {
    --canvas: #f5f0e6;
    --paper: #fcf9f2;
    --ink: #2b2b28;
    --ink-soft: #55534b;
    --amber: #c98a2d;
    --amber-deep: #a96f1f;
    --north-deep: #2e4645;
    --north: #3e5c5b;
    --serif: "Cormorant Garamond", Georgia, serif;
    --sans: "Manrope", sans-serif;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    background: var(--canvas);
    font-family: var(--sans);
    color: var(--ink);
    padding-bottom: 80px;
  }
  
  .topbar {
    background: var(--paper);
    border-bottom: 1.5px solid rgba(201, 138, 45, 0.35);
    padding: 14px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 4px 16px rgba(43, 43, 40, 0.06);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .topbar-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .topbar-logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 1.5px solid var(--amber);
  }
  .topbar-title {
    font-family: var(--serif);
    font-size: 1.35rem;
    color: var(--north-deep);
    font-weight: 700;
  }
  .topbar-right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .btn-site {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid rgba(43, 43, 40, 0.2);
    background: #fff;
    color: var(--ink);
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 600;
    transition: all 0.2s;
  }
  .btn-site:hover { border-color: var(--amber); color: var(--amber-deep); }
  .btn-logout {
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid #ffcdd2;
    background: #ffebee;
    color: #c62828;
    text-decoration: none;
    font-size: 0.88rem;
    font-weight: 600;
    transition: all 0.2s;
  }
  .btn-logout:hover { background: #ffcdd2; }

  .tabs-nav {
    display: flex;
    gap: 10px;
    margin: 22px 0 26px;
    border-bottom: 2px solid rgba(201, 138, 45, 0.25);
    padding-bottom: 12px;
    flex-wrap: wrap;
  }
  .tab-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-family: inherit;
    font-size: 0.95rem;
    font-weight: 700;
    text-decoration: none;
    color: var(--ink-soft);
    background: rgba(255, 255, 255, 0.6);
    border: 1.5px solid transparent;
    transition: all 0.2s;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .tab-btn:hover {
    color: var(--amber-deep);
    background: #fff;
  }
  .tab-btn.active {
    background: var(--amber);
    color: #fff;
    border-color: var(--amber-deep);
    box-shadow: 0 4px 14px rgba(201, 138, 45, 0.3);
  }

  .container {
    width: min(1200px, 94%);
    margin: 0 auto;
  }

  .alert {
    padding: 14px 20px;
    border-radius: 8px;
    margin-bottom: 24px;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .alert-success { background: #e8f5e9; color: #2e7d32; border: 1.5px solid #c8e6c9; }
  .alert-error { background: #ffebee; color: #c62828; border: 1.5px solid #ffcdd2; }

  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 14px;
    margin-bottom: 26px;
  }
  .stat-card {
    background: var(--paper);
    border: 1px solid rgba(201, 138, 45, 0.25);
    border-radius: 10px;
    padding: 16px 18px;
    box-shadow: 0 4px 14px rgba(43, 43, 40, 0.04);
  }
  .stat-num {
    font-family: var(--serif);
    font-size: 2rem;
    font-weight: 700;
    color: var(--amber-deep);
    line-height: 1;
  }
  .stat-lbl {
    font-size: 0.82rem;
    color: var(--ink-soft);
    margin-top: 5px;
    font-weight: 600;
  }

  .box-card {
    background: var(--paper);
    border: 1.5px solid rgba(201, 138, 45, 0.35);
    border-radius: 14px;
    padding: 28px;
    margin-bottom: 30px;
    box-shadow: 0 8px 24px rgba(43, 43, 40, 0.05);
  }
  .box-card h2 {
    font-family: var(--serif);
    font-size: 1.6rem;
    color: var(--north-deep);
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .box-card p.sub {
    font-size: 0.92rem;
    color: var(--ink-soft);
    margin-bottom: 20px;
  }
  .upload-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr 1fr auto;
    gap: 14px;
    align-items: flex-end;
  }
  @media (max-width: 900px) {
    .upload-grid { grid-template-columns: 1fr; }
  }
  .form-group {
    margin-bottom: 16px;
  }
  .form-group label {
    display: block;
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
    color: var(--north-deep);
    margin-bottom: 6px;
  }
  .form-group input, .form-group select, .form-group textarea {
    width: 100%;
    padding: 11px 13px;
    border: 1.5px solid rgba(43, 43, 40, 0.18);
    border-radius: 7px;
    font-size: 0.92rem;
    font-family: inherit;
    background: #fff;
  }
  .form-group textarea {
    resize: vertical;
    min-height: 80px;
  }
  .form-group input:focus, .form-group select:focus, .form-group textarea:focus {
    outline: none;
    border-color: var(--amber);
  }
  .btn-primary {
    padding: 12px 24px;
    background: linear-gradient(135deg, var(--amber) 0%, var(--amber-deep) 100%);
    color: #fff;
    border: none;
    border-radius: 7px;
    font-family: inherit;
    font-weight: 700;
    font-size: 0.95rem;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(201, 138, 45, 0.35);
    white-space: nowrap;
    transition: filter 0.2s, transform 0.2s;
  }
  .btn-primary:hover { filter: brightness(1.08); transform: translateY(-1px); }

  .gallery-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
    flex-wrap: wrap;
    gap: 14px;
  }
  .gallery-head h2 {
    font-family: var(--serif);
    font-size: 1.7rem;
    color: var(--north-deep);
  }
  .filter-bar {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .f-btn {
    padding: 6px 14px;
    border-radius: 999px;
    border: 1px solid rgba(43, 43, 40, 0.2);
    background: #fff;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
    color: var(--ink-soft);
    transition: all 0.2s;
  }
  .f-btn.active, .f-btn:hover {
    background: var(--north);
    border-color: var(--north);
    color: #fff;
  }

  .works-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 18px;
  }
  .work-card {
    background: var(--paper);
    border: 1px solid rgba(43, 43, 40, 0.12);
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(43, 43, 40, 0.05);
    display: flex;
    flex-direction: column;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .work-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 24px rgba(43, 43, 40, 0.12);
    border-color: var(--amber);
  }
  .work-thumb-wrap {
    width: 100%;
    aspect-ratio: 4 / 3;
    overflow: hidden;
    background: #e8e3d8;
    position: relative;
  }
  .work-thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
  .work-cat-badge {
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(22, 22, 18, 0.82);
    color: #fff;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 999px;
    backdrop-filter: blur(4px);
  }
  .work-body {
    padding: 14px;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .work-caption {
    font-size: 0.88rem;
    color: var(--ink);
    line-height: 1.4;
    margin-bottom: 12px;
  }
  .work-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid rgba(43, 43, 40, 0.08);
  }
  .btn-act {
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }
  .btn-edit { background: rgba(201, 138, 45, 0.15); color: var(--amber-deep); }
  .btn-edit:hover { background: var(--amber); color: #fff; }
  .btn-del { background: #ffebee; color: #c62828; }
  .btn-del:hover { background: #c62828; color: #fff; }
</style>
</head>
<body>

<header class="topbar">
  <div class="topbar-left">
    <img src="../assets/img/logo-nav.webp" alt="Логотип" class="topbar-logo">
    <div class="topbar-title">Мастерская · Управление сайтом</div>
  </div>
  <div class="topbar-right">
    <a href="../" target="_blank" class="btn-site">👁 Открыть сайт</a>
    <a href="?logout=1" class="btn-logout">Выйти</a>
  </div>
</header>

<div class="container">

  <!-- Навигация по вкладкам -->
  <nav class="tabs-nav">
    <a href="?tab=gallery" class="tab-btn <?php echo $active_tab === 'gallery' ? 'active' : ''; ?>">🎨 Галерея картин (<?php echo $counts['all']; ?>)</a>
    <a href="?tab=texts" class="tab-btn <?php echo $active_tab === 'texts' ? 'active' : ''; ?>">✍️ Контакты и тексты</a>
    <a href="?tab=security" class="tab-btn <?php echo $active_tab === 'security' ? 'active' : ''; ?>">🔒 Безопасность и пароль</a>
  </nav>

  <?php if (!empty($message)): ?>
    <div class="alert alert-<?php echo $message_type; ?>">
      <span><?php echo htmlspecialchars($message); ?></span>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;font-size:1.1rem">✕</button>
    </div>
  <?php endif; ?>

  <?php if ($active_tab === 'gallery'): ?>
    <!-- ВКЛАДКА 1: ГАЛЕРЕЯ -->
    <div class="stats-row">
      <div class="stat-card">
        <div class="stat-num"><?php echo $counts['all']; ?></div>
        <div class="stat-lbl">Всего работ на сайте</div>
      </div>
      <div class="stat-card">
        <div class="stat-num"><?php echo $counts['zhivopis']; ?></div>
        <div class="stat-lbl">Станковая живопись</div>
      </div>
      <div class="stat-card">
        <div class="stat-num"><?php echo $counts['grafika']; ?></div>
        <div class="stat-lbl">Станковая графика</div>
      </div>
      <div class="stat-card">
        <div class="stat-num"><?php echo $counts['plener']; ?></div>
        <div class="stat-lbl">Пленэрные работы</div>
      </div>
      <div class="stat-card">
        <div class="stat-num"><?php echo $counts['sculpture']; ?></div>
        <div class="stat-lbl">Скульптура</div>
      </div>
    </div>

    <!-- Загрузка новой работы -->
    <div class="box-card">
      <h2>🎨 Загрузить новую работу в галерею</h2>
      <p class="sub">Выберите фото с телефона или компьютера — система сама сожмет его в быстрый формат WebP и добавит на сайт.</p>

      <form method="POST" enctype="multipart/form-data">
        <input type="hidden" name="action" value="add_work">
        <div class="upload-grid">
          <div class="form-group" style="margin-bottom:0">
            <label>1. Файл фотографии</label>
            <input type="file" name="photo" accept="image/*" required>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label>2. Раздел галереи</label>
            <select name="cat" required>
              <option value="zhivopis">🎨 Станковая живопись</option>
              <option value="grafika">✏️ Станковая графика</option>
              <option value="plener">🌲 Пленэрные работы</option>
              <option value="sculpture">🗿 Скульптура</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label>3. Название работы</label>
            <input type="text" name="title" placeholder="например: Беломорье" required>
          </div>
          <div class="form-group" style="margin-bottom:0">
            <label>4. Техника и год</label>
            <input type="text" name="desc" placeholder="например: Холст, масло, 2026 г.">
          </div>
          <div>
            <button type="submit" class="btn-primary">+ Опубликовать</button>
          </div>
        </div>
      </form>
    </div>

    <!-- Список работ -->
    <div class="gallery-head">
      <h2>Работы на сайте (<?php echo count($gallery); ?>)</h2>
      <div class="filter-bar">
        <button class="f-btn active" onclick="filterWorks('all', this)">Все (<?php echo $counts['all']; ?>)</button>
        <button class="f-btn" onclick="filterWorks('zhivopis', this)">Живопись (<?php echo $counts['zhivopis']; ?>)</button>
        <button class="f-btn" onclick="filterWorks('grafika', this)">Графика (<?php echo $counts['grafika']; ?>)</button>
        <button class="f-btn" onclick="filterWorks('plener', this)">Пленэр (<?php echo $counts['plener']; ?>)</button>
        <button class="f-btn" onclick="filterWorks('sculpture', this)">Скульптура (<?php echo $counts['sculpture']; ?>)</button>
      </div>
    </div>

    <div class="works-grid" id="worksGrid">
      <?php foreach ($gallery as $item): ?>
        <?php 
          $cat = get_v($item, 'cat', 'zhivopis');
          $pid = get_v($item, 'pid', '');
          $cap = get_v($item, 'cap', '');
          $src = '../' . get_v($item, 'src', '');
          $cat_names = [
            'zhivopis' => 'Живопись',
            'grafika' => 'Графика',
            'plener' => 'Пленэр',
            'sculpture' => 'Скульптура'
          ];
          $cat_lbl = get_v($cat_names, $cat, 'Работа');
        ?>
        <div class="work-card" data-cat="<?php echo htmlspecialchars($cat); ?>">
          <div class="work-thumb-wrap">
            <img src="<?php echo htmlspecialchars($src); ?>" alt="<?php echo htmlspecialchars($cap); ?>" class="work-thumb" loading="lazy">
            <span class="work-cat-badge"><?php echo $cat_lbl; ?></span>
          </div>
          <div class="work-body">
            <div class="work-caption"><?php echo htmlspecialchars($cap); ?></div>
            <div class="work-actions">
              <button class="btn-act btn-edit" onclick="editCaption('<?php echo htmlspecialchars($pid); ?>', '<?php echo htmlspecialchars(addslashes($cap)); ?>')">✏️ Изменить</button>
              <form method="POST" onsubmit="return confirm('Вы уверены, что хотите удалить работу «<?php echo htmlspecialchars(addslashes($cap)); ?>» с сайта?')" style="margin:0">
                <input type="hidden" name="action" value="delete_work">
                <input type="hidden" name="pid" value="<?php echo htmlspecialchars($pid); ?>">
                <button type="submit" class="btn-act btn-del">🗑 Удалить</button>
              </form>
            </div>
          </div>
        </div>
      <?php endforeach; ?>
    </div>

  <?php elseif ($active_tab === 'texts'): ?>
    <!-- ВКЛАДКА 2: ТЕКСТЫ И КОНТАКТЫ -->
    <div class="box-card">
      <h2>✍️ Контактные данные и ключевые тексты сайта</h2>
      <p class="sub">Здесь можно изменить номер телефона, почту или описание мастерской. Изменения сразу вступают в силу на сайте.</p>

      <form method="POST">
        <input type="hidden" name="action" value="save_texts">

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
          <div class="form-group">
            <label>📞 Номер телефона</label>
            <input type="text" name="phone" value="<?php echo htmlspecialchars(get_v($content, 'phone', '')); ?>" required>
          </div>
          <div class="form-group">
            <label>✉️ Адрес электронной почты (Email)</label>
            <input type="email" name="email" value="<?php echo htmlspecialchars(get_v($content, 'email', '')); ?>" required>
          </div>
        </div>

        <div class="form-group">
          <label>📍 Адрес студии / мастерской</label>
          <input type="text" name="address" value="<?php echo htmlspecialchars(get_v($content, 'address', '')); ?>">
        </div>

        <div class="form-group">
          <label>🎨 Примечание в разделе Мастерской</label>
          <input type="text" name="studio_note" value="<?php echo htmlspecialchars(get_v($content, 'studio_note', '')); ?>">
        </div>

        <button type="submit" class="btn-primary" style="margin-top:10px">💾 Сохранить изменения на сайте</button>
      </form>
    </div>

  <?php elseif ($active_tab === 'security'): ?>
    <!-- ВКЛАДКА 3: БЕЗОПАСНОСТЬ -->
    <div class="box-card" style="max-width:600px">
      <h2>🔒 Смена пароля администратора</h2>
      <p class="sub">Задайте новый надёжный пароль для доступа к этой панели управления.</p>

      <form method="POST">
        <input type="hidden" name="action" value="change_password">
        <div class="form-group">
          <label>Текущий пароль</label>
          <input type="password" name="old_password" required placeholder="Введите текущий пароль">
        </div>
        <div class="form-group">
          <label>Новый пароль (не менее 6 знаков)</label>
          <input type="password" name="new_password" required placeholder="Введите новый пароль">
        </div>
        <button type="submit" class="btn-primary" style="margin-top:8px">Обновить пароль</button>
      </form>
    </div>
  <?php endif; ?>

</div>

<!-- Скрытая форма для редактирования подписи -->
<form id="editForm" method="POST" style="display:none">
  <input type="hidden" name="action" value="edit_caption">
  <input type="hidden" name="pid" id="editPid">
  <input type="hidden" name="caption" id="editCaptionText">
</form>

<script>
function filterWorks(cat, btn) {
  document.querySelectorAll('.f-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  var cards = document.querySelectorAll('.work-card');
  cards.forEach(function(card) {
    if (cat === 'all' || card.dataset.cat === cat) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function editCaption(pid, oldCap) {
  var newCap = prompt('Редактирование названия и подписи картины:', oldCap);
  if (newCap !== null && newCap.trim() !== '' && newCap !== oldCap) {
    document.getElementById('editPid').value = pid;
    document.getElementById('editCaptionText').value = newCap.trim();
    document.getElementById('editForm').submit();
  }
}
</script>

</body>
</html>
<?php
}
