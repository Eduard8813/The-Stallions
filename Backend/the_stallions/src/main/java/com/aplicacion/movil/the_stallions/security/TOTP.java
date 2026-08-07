package com.aplicacion.movil.the_stallions.security;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Implementación de TOTP (RFC 6238) usada para la verificación en dos pasos
 * con apps de autenticación como Google Authenticator o Authy.
 *
 * Algoritmo: HMAC-SHA1, 6 dígitos, período de 30 segundos.
 */
public final class TOTP {

    private static final String BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    private static final int SECRET_BYTES = 20;
    private static final int TIME_STEP_SECONDS = 30;
    private static final int DIGITS = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    private TOTP() {
    }

    /** Genera un secreto compartido aleatorio (32 caracteres base32). */
    public static String generateSecret() {
        byte[] bytes = new byte[SECRET_BYTES];
        RANDOM.nextBytes(bytes);
        return base32Encode(bytes);
    }

    /** Verifica un código de 6 dígitos contra el secreto, tolerando desfase de reloj. */
    public static boolean verify(String secret, String code, int window) {
        if (secret == null || secret.isBlank() || code == null || code.isBlank()) {
            return false;
        }
        long step = System.currentTimeMillis() / 1000 / TIME_STEP_SECONDS;
        for (int i = -window; i <= window; i++) {
            if (timingSafeEqual(code, generateCode(secret, step + i))) {
                return true;
            }
        }
        return false;
    }

    /** Construye la URL otpauth:// para escanear con la app de autenticación. */
    public static String buildOtpAuthUrl(String secret, String email) {
        Map<String, String> params = new LinkedHashMap<>();
        params.put("secret", secret);
        params.put("issuer", "The Stallions");
        params.put("algorithm", "SHA1");
        params.put("digits", String.valueOf(DIGITS));
        params.put("period", String.valueOf(TIME_STEP_SECONDS));
        return "otpauth://totp/" + urlEncode("The Stallions:" + email) + "?" + encodeParams(params);
    }

    private static String generateCode(String secret, long timeStep) {
        try {
            byte[] key = base32Decode(secret);
            byte[] counter = ByteBuffer.allocate(8).putLong(timeStep).array();

            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(counter);

            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);
            int otp = binary % (int) Math.pow(10, DIGITS);
            return String.format("%0" + DIGITS + "d", otp);
        } catch (Exception e) {
            return "";
        }
    }

    private static byte[] base32Decode(String input) {
        String cleaned = input.toUpperCase().replace("=", "").trim();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int buffer = 0;
        int bitsLeft = 0;
        for (char c : cleaned.toCharArray()) {
            int value = BASE32_ALPHABET.indexOf(c);
            if (value < 0) {
                continue;
            }
            buffer = (buffer << 5) | value;
            bitsLeft += 5;
            if (bitsLeft >= 8) {
                out.write((buffer >> (bitsLeft - 8)) & 0xFF);
                bitsLeft -= 8;
            }
        }
        return out.toByteArray();
    }

    private static String base32Encode(byte[] data) {
        StringBuilder sb = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xFF);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                sb.append(BASE32_ALPHABET.charAt((buffer >> (bitsLeft - 5)) & 0x1F));
                bitsLeft -= 5;
            }
        }
        if (bitsLeft > 0) {
            sb.append(BASE32_ALPHABET.charAt((buffer << (5 - bitsLeft)) & 0x1F));
        }
        return sb.toString();
    }

    private static boolean timingSafeEqual(String a, String b) {
        if (a.length() != b.length()) {
            return false;
        }
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }

    private static String encodeParams(Map<String, String> params) {
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, String> entry : params.entrySet()) {
            if (sb.length() > 0) {
                sb.append('&');
            }
            sb.append(entry.getKey()).append('=').append(urlEncode(entry.getValue()));
        }
        return sb.toString();
    }

    private static String urlEncode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8).replace("+", "%20");
    }
}
