<?php
/**
 * Next.js Headless Theme
 *
 * Redirects all frontend requests to the Next.js application.
 * Allows admin, login, REST API, and other WordPress internals.
 */

// Redirect frontend requests to Next.js
add_action('template_redirect', function () {
    // Allow WordPress admin area
    if (is_admin()) {
        return;
    }

    // Allow login/logout pages
    if (strpos($_SERVER['REQUEST_URI'], 'wp-login') !== false ||
        strpos($_SERVER['REQUEST_URI'], 'wp-signup') !== false ||
        strpos($_SERVER['REQUEST_URI'], 'wp-activate') !== false) {
        return;
    }

    // Allow REST API
    if (strpos($_SERVER['REQUEST_URI'], 'wp-json') !== false ||
        strpos($_SERVER['REQUEST_URI'], rest_get_url_prefix()) !== false) {
        return;
    }

    // Allow cron
    if (strpos($_SERVER['REQUEST_URI'], 'wp-cron') !== false) {
        return;
    }

    // Allow AJAX requests
    if (defined('DOING_AJAX') && DOING_AJAX) {
        return;
    }

    // Allow XML-RPC (if needed for some integrations)
    if (strpos($_SERVER['REQUEST_URI'], 'xmlrpc.php') !== false) {
        return;
    }

    // Get Next.js URL from environment
    $nextjs_url = getenv('NEXTJS_URL');

    if ($nextjs_url) {
        // Redirect to Next.js with 301 (permanent redirect)
        wp_redirect($nextjs_url, 301);
        exit;
    }
});

// Remove unnecessary frontend features for headless
add_action('after_setup_theme', function () {
    // Remove emoji scripts
    remove_action('wp_head', 'print_emoji_detection_script', 7);
    remove_action('wp_print_styles', 'print_emoji_styles');

    // Remove feed links
    remove_action('wp_head', 'feed_links', 2);
    remove_action('wp_head', 'feed_links_extra', 3);

    // Remove RSD link
    remove_action('wp_head', 'rsd_link');

    // Remove wlwmanifest link
    remove_action('wp_head', 'wlwmanifest_link');

    // Remove WordPress version
    remove_action('wp_head', 'wp_generator');
});

/**
 * Bypass Akismet pour les commentaires soumis via l'API REST
 * Akismet marque souvent les commentaires API comme spam car ils viennent du serveur
 */

// 1. Désactiver complètement Akismet pour les requêtes REST API
add_filter('akismet_get_api_key', function($api_key) {
    if (defined('REST_REQUEST') && REST_REQUEST) {
        return ''; // Retourne une clé vide = Akismet désactivé
    }
    return $api_key;
});

// 2. Forcer le statut "hold" (modération) pour les commentaires REST, pas "spam"
add_filter('pre_comment_approved', function($approved, $commentdata) {
    if (defined('REST_REQUEST') && REST_REQUEST) {
        // Toujours mettre en modération, jamais en spam
        return '0'; // '0' = hold, '1' = approved, 'spam' = spam
    }
    return $approved;
}, 1, 2); // Priorité 1 = s'exécute en premier

// 3. Empêcher Akismet de modifier le statut après insertion (hook tardif)
add_filter('akismet_comment_nonce', function($nonce) {
    if (defined('REST_REQUEST') && REST_REQUEST) {
        return 'inactive'; // Désactive la vérification nonce Akismet pour REST
    }
    return $nonce;
});

// 4. Dernier recours : corriger le statut après qu'Akismet l'ait modifié
add_action('comment_post', function($comment_id, $comment_approved) {
    if (defined('REST_REQUEST') && REST_REQUEST) {
        $comment = get_comment($comment_id);
        if ($comment && $comment->comment_approved === 'spam') {
            // Forcer le passage en modération au lieu de spam
            wp_set_comment_status($comment_id, 'hold');
            error_log("[REST Comments] Comment $comment_id moved from spam to hold");
        }
    }
}, 999, 2); // Priorité très haute = s'exécute après Akismet
