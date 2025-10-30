<?php
session_start();
require_once 'includes/auth.php';

// Bayi çıkışı yap
bayiLogout();

// Giriş sayfasına yönlendir
header('Location: login.php?logout=1');
exit;
?>