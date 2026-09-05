package com.aplicacion.movil.the_stallions.dto.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public class UpdateProfileRequest {

    @Size(max = 80, message = "El nombre no puede superar los 80 caracteres")
    private String firstName;

    @Size(max = 80, message = "El apellido no puede superar los 80 caracteres")
    private String lastName;

    @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
    @jakarta.validation.constraints.Pattern(
            regexp = "^[a-zA-Z0-9._-]+$",
            message = "El nombre de usuario solo admite letras, números, punto, guion y guion bajo"
    )
    private String username;

    @Email(message = "El correo no es válido")
    private String email;

    @Size(max = 40, message = "El teléfono no puede superar los 40 caracteres")
    private String phone;

    private String birthDate; // DD/MM/YYYY
    private String gender;

    @Size(max = 100, message = "La ciudad no puede superar los 100 caracteres")
    private String city;

    @Size(max = 2000, message = "La biografía no puede superar los 2000 caracteres")
    private String bio;

    @Size(max = 500, message = "La foto no es válida")
    private String photoUrl;

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getBirthDate() {
        return birthDate;
    }

    public void setBirthDate(String birthDate) {
        this.birthDate = birthDate;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }
}
