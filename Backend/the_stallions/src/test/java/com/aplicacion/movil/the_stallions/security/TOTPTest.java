package com.aplicacion.movil.the_stallions.security;

import org.junit.jupiter.api.Test;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TOTPTest {

    @Test
    void generateSecretDevuelve32CaracteresBase32() {
        String secret = TOTP.generateSecret();
        assertEquals(32, secret.length());
        assertTrue(secret.matches("[A-Z2-7]{32}"));
    }

    @Test
    void generateSecretEsAleatorioEntreLlamadas() {
        assertNotEquals(TOTP.generateSecret(), TOTP.generateSecret());
    }

    @Test
    void buildOtpAuthUrlIncluyeParametrosCorrectos() {
        String url = TOTP.buildOtpAuthUrl("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", "usuario@example.com");
        assertTrue(url.startsWith("otpauth://totp/"));
        assertTrue(url.contains("secret=GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ"));
        assertTrue(url.contains("issuer=The%20Stallions"));
        assertTrue(url.contains("algorithm=SHA1"));
        assertTrue(url.contains("digits=6"));
        assertTrue(url.contains("period=30"));
        assertTrue(url.contains("The%20Stallions%3Ausuario%40example.com"));
    }

    @Test
    void verifyAceptaElCodigoDelMismoSecreto() {
        String secret = TOTP.generateSecret();
        long step = System.currentTimeMillis() / 1000 / 30;
        String code = computeTotp(secret, step);
        assertTrue(TOTP.verify(secret, code, 0));
        assertTrue(TOTP.verify(secret, code, 1));
    }

    @Test
    void verifyRechazaCodigosInvalidos() {
        String secret = TOTP.generateSecret();
        assertFalse(TOTP.verify(secret, "000000", 1));
        assertFalse(TOTP.verify(secret, "", 1));
        assertFalse(TOTP.verify(secret, null, 1));
        assertFalse(TOTP.verify(null, "123456", 1));
        assertFalse(TOTP.verify("   ", "123456", 1));
    }

    /** Replica RFC 6238 (HMAC-SHA1, 6 dígitos, 30 s) para comprobar consistencia. */
    private String computeTotp(String secret, long timeStep) {
        try {
            byte[] key = decodeBase32(secret);
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(key, "HmacSHA1"));
            byte[] hash = mac.doFinal(ByteBuffer.allocate(8).putLong(timeStep).array());
            int offset = hash[hash.length - 1] & 0x0F;
            int binary = ((hash[offset] & 0x7F) << 24)
                    | ((hash[offset + 1] & 0xFF) << 16)
                    | ((hash[offset + 2] & 0xFF) << 8)
                    | (hash[offset + 3] & 0xFF);
            return String.format("%06d", binary % 1_000_000);
        } catch (Exception e) {
            return "";
        }
    }

    private byte[] decodeBase32(String input) {
        String alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        String cleaned = input.toUpperCase().replace("=", "").trim();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        int buffer = 0;
        int bitsLeft = 0;
        for (char c : cleaned.toCharArray()) {
            int value = alphabet.indexOf(c);
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
}