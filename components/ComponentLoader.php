<?php
/**
 * Component Loader - Dinamik Component Yükleyici Sistem
 * Tüm component'leri merkezi bir yerden yönetir
 */

class ComponentLoader {
    private static $componentsPath = __DIR__;
    private static $loadedComponents = [];
    
    /**
     * Component yükle
     * @param string $componentName Component adı (navbar, footer, vb.)
     * @param array $data Component'e gönderilecek veri
     * @param array $options Ek seçenekler (cache, variant, vb.)
     */
    public static function load($componentName, $data = [], $options = []) {
        $variant = $options['variant'] ?? 'default';
        $cache = $options['cache'] ?? true;
        $cacheKey = $componentName . '_' . $variant;
        
        // Cache kontrolü
        if ($cache && isset(self::$loadedComponents[$cacheKey])) {
            return self::renderCached($cacheKey, $data);
        }
        
        // Component dosyası yolu
        $componentFile = self::$componentsPath . '/' . $componentName . '.php';
        
        // Variant kontrolü
        if ($variant !== 'default') {
            $variantFile = self::$componentsPath . '/' . $componentName . '-' . $variant . '.php';
            if (file_exists($variantFile)) {
                $componentFile = $variantFile;
            }
        }
        
        // Component dosyası var mı?
        if (!file_exists($componentFile)) {
            self::logError("Component bulunamadı: {$componentName}");
            return false;
        }
        
        // Data değişkenlerini çıkar
        extract($data);
        
        // Component'i cache'le
        if ($cache) {
            ob_start();
            include $componentFile;
            $output = ob_get_clean();
            self::$loadedComponents[$cacheKey] = $output;
            echo $output;
        } else {
            include $componentFile;
        }
        
        return true;
    }
    
    /**
     * Cache'lenmiş component render et
     */
    private static function renderCached($cacheKey, $data) {
        $output = self::$loadedComponents[$cacheKey];
        
        // Dinamik veri değişimi için basit template engine
        foreach ($data as $key => $value) {
            $placeholder = '{{' . $key . '}}';
            $output = str_replace($placeholder, $value, $output);
        }
        
        echo $output;
        return true;
    }
    
    /**
     * Hata kaydet
     */
    private static function logError($message) {
        error_log('[ComponentLoader] ' . $message);
        if (defined('DEBUG') && DEBUG === true) {
            echo "<!-- ComponentLoader Error: {$message} -->";
        }
    }
    
    /**
     * Component path ayarla
     */
    public static function setComponentsPath($path) {
        self::$componentsPath = $path;
    }
    
    /**
     * Cache temizle
     */
    public static function clearCache() {
        self::$loadedComponents = [];
    }
}

/**
 * Helper function - Component yükle (kısa kullanım)
 */
function component($name, $data = [], $options = []) {
    return ComponentLoader::load($name, $data, $options);
}

/**
 * Helper function - Inline component (return olarak)
 */
function get_component($name, $data = [], $options = []) {
    ob_start();
    ComponentLoader::load($name, $data, $options);
    return ob_get_clean();
}
