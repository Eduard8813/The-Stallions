package com.aplicacion.movil.the_stallions.controller;

import com.aplicacion.movil.the_stallions.dto.Request.ChangePasswordRequest;
import com.aplicacion.movil.the_stallions.dto.Request.TwoFactorRequest;
import com.aplicacion.movil.the_stallions.dto.Request.UpdateProfileRequest;
import com.aplicacion.movil.the_stallions.dto.Response.*;
import com.aplicacion.movil.the_stallions.service.UserService;
import tools.jackson.databind.JsonNode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Perfil

    @GetMapping("/profile")
    public ResponseEntity<ProfileResponse> getProfile() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @PutMapping("/profile")
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(request));
    }

    @PostMapping("/profile/photo")
    public ResponseEntity<PhotoResponse> uploadPhoto(@RequestParam("photo") MultipartFile file,
                                                     HttpServletRequest request) {
        return ResponseEntity.ok(userService.updatePhoto(file, request));
    }

    @GetMapping("/photo/{userId}")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long userId) {
        UserService.UserPhoto photo = userService.getPhoto(userId);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(photo.contentType() != null ? photo.contentType() : "image/jpeg"))
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(photo.bytes());
    }

    // Seguridad

    @GetMapping("/security")
    public ResponseEntity<SecurityResponse> getSecurity() {
        return ResponseEntity.ok(userService.getSecuritySettings());
    }

    @PutMapping("/security/password")
    public ResponseEntity<SuccessResponse> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        return ResponseEntity.ok(userService.changePassword(request));
    }

    @PatchMapping("/security/2fa")
    public ResponseEntity<SecurityResponse> setTwoFactor(@Valid @RequestBody TwoFactorRequest request) {
        return ResponseEntity.ok(userService.setTwoFactor(request.getEnabled()));
    }

    // Sesiones

    @GetMapping("/sessions")
    public ResponseEntity<List<UserSessionResponse>> getSessions() {
        return ResponseEntity.ok(userService.getSessions());
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<RevokedResponse> revokeSession(@PathVariable Long id) {
        return ResponseEntity.ok(userService.revokeSession(id));
    }

    // Notificaciones

    @GetMapping("/notifications")
    public ResponseEntity<JsonNode> getNotifications() {
        return ResponseEntity.ok(userService.getNotificationSettings());
    }

    @PatchMapping("/notifications")
    public ResponseEntity<JsonNode> updateNotifications(@RequestBody Map<String, Object> patch) {
        return ResponseEntity.ok(userService.updateNotificationSettings(patch));
    }

    // Privacidad

    @GetMapping("/privacy")
    public ResponseEntity<PrivacyResponse> getPrivacy() {
        return ResponseEntity.ok(userService.getPrivacySettings());
    }

    @PatchMapping("/privacy")
    public ResponseEntity<PrivacyResponse> updatePrivacy(@RequestBody Map<String, Object> patch) {
        return ResponseEntity.ok(userService.updatePrivacySettings(patch));
    }

    // Bloqueados

    @GetMapping("/blocked")
    public ResponseEntity<List<BlockedUserResponse>> getBlockedUsers() {
        return ResponseEntity.ok(userService.getBlockedUsers());
    }

    @DeleteMapping("/blocked/{id}")
    public ResponseEntity<UnblockedResponse> unblockUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.unblockUser(id));
    }

    // Datos

    @PostMapping("/data-export")
    public ResponseEntity<DataExportResponse> requestDataExport() {
        return ResponseEntity.ok(userService.requestDataExport());
    }

    @DeleteMapping("/account")
    public ResponseEntity<SuccessResponse> deleteAccount() {
        return ResponseEntity.ok(userService.deleteAccount());
    }
}
