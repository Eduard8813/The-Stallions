package com.aplicacion.movil.the_stallions.service;

import com.aplicacion.movil.the_stallions.dto.Request.ChangePasswordRequest;
import com.aplicacion.movil.the_stallions.dto.Request.UpdateProfileRequest;
import com.aplicacion.movil.the_stallions.dto.Response.*;
import com.aplicacion.movil.the_stallions.exception.NotFoundException;
import com.aplicacion.movil.the_stallions.model.*;
import com.aplicacion.movil.the_stallions.repository.*;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.node.ObjectNode;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
public class UserService {

    private static final DateTimeFormatter BIRTH_DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final List<String> ALLOWED_PROVIDERS = List.of("google", "apple", "facebook");
    private static final List<String> ALLOWED_GENDERS = List.of("male", "female", "other", "prefer_not_to_say");
    private static final List<String> ALLOWED_VISIBILITIES = List.of("public", "contacts", "private");
    private static final long MAX_PHOTO_BYTES = 10L * 1024 * 1024;

    private final UserRepository userRepository;
    private final UserSessionRepository userSessionRepository;
    private final LinkedAccountRepository linkedAccountRepository;
    private final BlockedUserRepository blockedUserRepository;
    private final UserNotificationsRepository userNotificationsRepository;
    private final UserPrivacyRepository userPrivacyRepository;
    private final DataExportRepository dataExportRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public UserService(UserRepository userRepository, UserSessionRepository userSessionRepository,
                       LinkedAccountRepository linkedAccountRepository, BlockedUserRepository blockedUserRepository,
                       UserNotificationsRepository userNotificationsRepository, UserPrivacyRepository userPrivacyRepository,
                       DataExportRepository dataExportRepository, PasswordEncoder passwordEncoder,
                       ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.userSessionRepository = userSessionRepository;
        this.linkedAccountRepository = linkedAccountRepository;
        this.blockedUserRepository = blockedUserRepository;
        this.userNotificationsRepository = userNotificationsRepository;
        this.userPrivacyRepository = userPrivacyRepository;
        this.dataExportRepository = dataExportRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    // ---------- Perfil ----------

    public ProfileResponse getProfile() {
        User user = currentUser();
        touchSession();
        return buildProfileResponse(user);
    }

    public ProfileResponse updateProfile(UpdateProfileRequest request) {
        User user = currentUser();

        if (request.getEmail() != null && !request.getEmail().isBlank()
                && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            throw new IllegalStateException("No se puede cambiar el correo desde el perfil");
        }

        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            String newUsername = request.getUsername().trim();
            if (!newUsername.equals(user.getUsername()) && userRepository.existsByUsername(newUsername)) {
                throw new IllegalStateException("El nombre de usuario ya está en uso");
            }
            user.setUsername(newUsername);
        }

        String firstName = request.getFirstName();
        String lastName = request.getLastName();
        if (firstName != null || lastName != null) {
            user.setFullName(buildFullName(firstName, lastName));
        }

        user.setPhone(request.getPhone());
        user.setGender(resolveGender(request.getGender()));
        user.setCity(request.getCity());
        user.setBio(request.getBio());
        user.setPhotoUrl(request.getPhotoUrl());
        user.setBirthDate(resolveBirthDate(request.getBirthDate()));
        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        return buildProfileResponse(user);
    }

    public PhotoResponse updatePhoto(MultipartFile file, HttpServletRequest request) {
        User user = currentUser();

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Debes seleccionar una imagen");
        }
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("El archivo debe ser una imagen");
        }
        if (file.getSize() > MAX_PHOTO_BYTES) {
            throw new IllegalArgumentException("La imagen no puede superar los 10 MB");
        }

        try {
            Path dir = Paths.get(uploadDir);
            Files.createDirectories(dir);

            String original = Optional.ofNullable(file.getOriginalFilename()).orElse("photo.jpg");
            String extension = original.contains(".")
                    ? original.substring(original.lastIndexOf('.')) : ".jpg";
            String filename = user.getId() + "-" + System.currentTimeMillis() + extension;
            Path target = dir.resolve(filename);
            file.transferTo(target.toFile());

            String relative = "/uploads/" + filename;
            String baseUrl = request.getRequestURL().toString().replace(request.getRequestURI(), "");
            String photoUrl = baseUrl + request.getContextPath() + relative;

            user.setPhotoUrl(photoUrl);
            user.setUpdatedAt(LocalDateTime.now());
            userRepository.save(user);

            return new PhotoResponse(photoUrl);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar la imagen");
        }
    }

    // ---------- Seguridad ----------

    public SecurityResponse getSecuritySettings() {
        return new SecurityResponse(currentUser().isTwoFactorEnabled());
    }

    public SuccessResponse changePassword(ChangePasswordRequest request) {
        User user = currentUser();

        if (user.getProvider() == AuthProvider.GOOGLE || user.getPasswordHash() == null) {
            throw new IllegalStateException("Esta cuenta usa inicio de sesión con Google");
        }
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("La contraseña actual es incorrecta");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return new SuccessResponse(true);
    }

    public SecurityResponse setTwoFactor(boolean enabled) {
        User user = currentUser();
        user.setTwoFactorEnabled(enabled);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return new SecurityResponse(enabled);
    }

    // ---------- Sesiones ----------

    public List<UserSessionResponse> getSessions() {
        User user = currentUser();
        touchSession();
        Long currentSessionId = currentSessionId();

        return userSessionRepository.findByUserIdAndActiveTrueOrderByLastActiveDesc(user.getId())
                .stream().map(session -> {
                    UserSessionResponse response = new UserSessionResponse();
                    response.setId(String.valueOf(session.getId()));
                    response.setDevice(session.getDevice());
                    response.setPlatform(session.getPlatform());
                    response.setLocation(session.getLocation());
                    response.setLastActive(session.getLastActive() != null
                            ? session.getLastActive().toString() : "");
                    response.setCurrent(currentSessionId != null && currentSessionId.equals(session.getId()));
                    return response;
                }).toList();
    }

    public RevokedResponse revokeSession(Long sessionId) {
        User user = currentUser();
        UserSession session = userSessionRepository.findById(sessionId)
                .filter(s -> s.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new NotFoundException("Sesión no encontrada"));

        session.setActive(false);
        userSessionRepository.save(session);
        return new RevokedResponse(true);
    }

    // ---------- Cuentas vinculadas ----------

    public List<LinkedAccountResponse> getLinkedAccounts() {
        User user = currentUser();
        Map<String, LinkedAccount> linked = new HashMap<>();
        linkedAccountRepository.findByUserId(user.getId())
                .forEach(a -> linked.put(a.getProvider(), a));

        return ALLOWED_PROVIDERS.stream().map(provider -> {
            LinkedAccountResponse response = new LinkedAccountResponse();
            response.setProvider(provider);
            LinkedAccount account = linked.get(provider);
            response.setConnected(account != null);
            response.setEmail(account != null ? account.getAccountEmail() : null);
            return response;
        }).toList();
    }

    public LinkedAccountResponse linkAccount(String provider) {
        User user = currentUser();
        String normalized = normalizeProvider(provider);

        LinkedAccount account = linkedAccountRepository.findByUserIdAndProvider(user.getId(), normalized)
                .orElseGet(() -> {
                    LinkedAccount created = new LinkedAccount();
                    created.setUser(user);
                    created.setProvider(normalized);
                    created.setAccountEmail(normalized.equals("google") ? user.getEmail() : null);
                    return linkedAccountRepository.save(created);
                });

        LinkedAccountResponse response = new LinkedAccountResponse();
        response.setProvider(normalized);
        response.setConnected(true);
        response.setEmail(account.getAccountEmail());
        return response;
    }

    public UnlinkedResponse unlinkAccount(String provider) {
        User user = currentUser();
        String normalized = normalizeProvider(provider);
        linkedAccountRepository.deleteByUserIdAndProvider(user.getId(), normalized);
        return new UnlinkedResponse(false);
    }

    // ---------- Notificaciones ----------

    public JsonNode getNotificationSettings() {
        User user = currentUser();
        return loadNotifications(user);
    }

    public JsonNode updateNotificationSettings(Map<String, Object> patch) {
        User user = currentUser();
        ObjectNode current = loadNotifications(user);
        ObjectNode patchNode = objectMapper.convertValue(patch, ObjectNode.class);
        mergeNodes(current, patchNode);

        UserNotifications entity = userNotificationsRepository.findByUserId(user.getId()).orElseGet(() -> {
            UserNotifications created = new UserNotifications();
            created.setUser(user);
            return created;
        });
        entity.setSettingsJson(current.toString());
        userNotificationsRepository.save(entity);

        return current;
    }

    // ---------- Privacidad ----------

    public PrivacyResponse getPrivacySettings() {
        User user = currentUser();
        return buildPrivacyResponse(loadPrivacy(user));
    }

    public PrivacyResponse updatePrivacySettings(Map<String, Object> patch) {
        User user = currentUser();
        UserPrivacy privacy = loadPrivacy(user);

        if (patch.containsKey("visibility")) {
            String visibility = String.valueOf(patch.get("visibility"));
            if (!ALLOWED_VISIBILITIES.contains(visibility)) {
                throw new IllegalArgumentException("Visibilidad no válida");
            }
            privacy.setVisibility(visibility);
        }
        privacy.setShowEmail(getBoolean(patch, "showEmail", privacy.isShowEmail()));
        privacy.setShowPhone(getBoolean(patch, "showPhone", privacy.isShowPhone()));
        privacy.setShowLocation(getBoolean(patch, "showLocation", privacy.isShowLocation()));
        privacy.setDiscoverable(getBoolean(patch, "discoverable", privacy.isDiscoverable()));
        userPrivacyRepository.save(privacy);

        return buildPrivacyResponse(privacy);
    }

    // ---------- Bloqueados ----------

    public List<BlockedUserResponse> getBlockedUsers() {
        User user = currentUser();
        return blockedUserRepository.findByUserId(user.getId()).stream().map(blocked -> {
            BlockedUserResponse response = new BlockedUserResponse();
            response.setId(String.valueOf(blocked.getId()));
            response.setName(blocked.getName());
            response.setUsername(blocked.getUsername());
            return response;
        }).toList();
    }

    public UnblockedResponse unblockUser(Long blockedId) {
        User user = currentUser();
        boolean existed = blockedUserRepository.existsById(blockedId);
        blockedUserRepository.deleteByIdAndUserId(blockedId, user.getId());
        if (!existed) {
            throw new NotFoundException("Usuario bloqueado no encontrado");
        }
        return new UnblockedResponse(true);
    }

    // ---------- Exportar y eliminar ----------

    public DataExportResponse requestDataExport() {
        User user = currentUser();

        DataExport export = new DataExport();
        export.setUser(user);
        export.setExportId(UUID.randomUUID().toString());
        export.setStatus("processing");
        export.setAvailableForHours(48);
        dataExportRepository.save(export);

        DataExportResponse response = new DataExportResponse();
        response.setExportId(export.getExportId());
        response.setStatus(export.getStatus());
        response.setAvailableForHours(export.getAvailableForHours());
        return response;
    }

    public SuccessResponse deleteAccount() {
        User user = currentUser();
        Long userId = user.getId();

        dataExportRepository.deleteByUserId(userId);
        userNotificationsRepository.deleteByUserId(userId);
        userPrivacyRepository.deleteByUserId(userId);
        blockedUserRepository.deleteByUserId(userId);
        linkedAccountRepository.deleteByUserId(userId);
        userSessionRepository.deleteByUserId(userId);
        userRepository.delete(user);

        return new SuccessResponse(true);
    }

    // ---------- Helpers ----------

    private User currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof String email)) {
            throw new IllegalArgumentException("No autenticado");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No autenticado"));
    }

    private Long currentSessionId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getDetails() instanceof Long sessionId ? sessionId : null;
    }

    private void touchSession() {
        Long sessionId = currentSessionId();
        if (sessionId != null) {
            userSessionRepository.findById(sessionId).ifPresent(session -> {
                session.setLastActive(LocalDateTime.now());
                userSessionRepository.save(session);
            });
        }
    }

    private ProfileResponse buildProfileResponse(User user) {
        ProfileResponse response = new ProfileResponse();
        response.setId(String.valueOf(user.getId()));

        String fullName = user.getFullName() != null ? user.getFullName().trim() : "";
        String[] parts = fullName.split("\\s+");
        response.setFirstName(parts.length > 0 ? parts[0] : "");
        response.setLastName(parts.length > 1 ? String.join(" ", Arrays.copyOfRange(parts, 1, parts.length)) : "");

        response.setUsername(user.getUsername() != null && !user.getUsername().isBlank()
                ? user.getUsername() : user.getEmail().split("@")[0]);
        response.setEmail(user.getEmail());
        response.setPhone(nvl(user.getPhone()));
        response.setBirthDate(user.getBirthDate() != null ? user.getBirthDate().format(BIRTH_DATE_FMT) : null);
        response.setGender(nvl(user.getGender()));
        response.setCity(nvl(user.getCity()));
        response.setBio(nvl(user.getBio()));
        response.setPhotoUrl(user.getPhotoUrl());
        response.setCreatedAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
        return response;
    }

    private String buildFullName(String firstName, String lastName) {
        return ((firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "")).trim();
    }

    private LocalDate resolveBirthDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(value.trim(), BIRTH_DATE_FMT);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Fecha de nacimiento inválida (use DD/MM/YYYY)");
        }
    }

    private String resolveGender(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        if (!ALLOWED_GENDERS.contains(value)) {
            throw new IllegalArgumentException("Género no válido");
        }
        return value;
    }

    private String normalizeProvider(String provider) {
        if (provider == null || !ALLOWED_PROVIDERS.contains(provider.toLowerCase())) {
            throw new IllegalArgumentException("Proveedor no válido");
        }
        return provider.toLowerCase();
    }

    private ObjectNode loadNotifications(User user) {
        ObjectNode defaults = defaultNotifications();
        return userNotificationsRepository.findByUserId(user.getId())
                .map(entity -> {
                    try {
                        JsonNode parsed = objectMapper.readTree(entity.getSettingsJson());
                        ObjectNode base = defaults.deepCopy();
                        if (parsed instanceof ObjectNode node) {
                            mergeNodes(base, node);
                        }
                        return base;
                    } catch (Exception e) {
                        return defaults;
                    }
                })
                .orElse(defaults);
    }

    private ObjectNode defaultNotifications() {
        try {
            return (ObjectNode) objectMapper.readTree(
                    "{\"categories\":{" +
                            "\"tours\":{\"enabled\":false,\"channels\":{\"email\":false,\"push\":false,\"inApp\":false}}," +
                            "\"messages\":{\"enabled\":false,\"channels\":{\"email\":false,\"push\":false,\"inApp\":false}}," +
                            "\"events\":{\"enabled\":false,\"channels\":{\"email\":false,\"push\":false,\"inApp\":false}}," +
                            "\"promotions\":{\"enabled\":false,\"channels\":{\"email\":false,\"push\":false,\"inApp\":false}}}," +
                            "\"quietHours\":{\"enabled\":false,\"start\":\"\",\"end\":\"\"}}");
        } catch (Exception e) {
            return objectMapper.createObjectNode();
        }
    }

    private void mergeNodes(ObjectNode base, ObjectNode patch) {
        for (Map.Entry<String, JsonNode> entry : patch.properties()) {
            String key = entry.getKey();
            JsonNode value = entry.getValue();
            JsonNode existing = base.get(key);
            if (value instanceof ObjectNode patchNode
                    && existing instanceof ObjectNode baseNode) {
                mergeNodes(baseNode, patchNode);
            } else {
                base.set(key, value);
            }
        }
    }

    private UserPrivacy loadPrivacy(User user) {
        return userPrivacyRepository.findByUserId(user.getId()).orElseGet(() -> {
            UserPrivacy created = new UserPrivacy();
            created.setUser(user);
            return userPrivacyRepository.save(created);
        });
    }

    private PrivacyResponse buildPrivacyResponse(UserPrivacy privacy) {
        PrivacyResponse response = new PrivacyResponse();
        response.setVisibility(privacy.getVisibility());
        response.setShowEmail(privacy.isShowEmail());
        response.setShowPhone(privacy.isShowPhone());
        response.setShowLocation(privacy.isShowLocation());
        response.setDiscoverable(privacy.isDiscoverable());
        return response;
    }

    private boolean getBoolean(Map<String, Object> patch, String key, boolean current) {
        return patch.containsKey(key) ? Boolean.parseBoolean(String.valueOf(patch.get(key))) : current;
    }

    private String nvl(String value) {
        return value != null ? value : "";
    }
}
