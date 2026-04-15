package com.ag.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

/**
 * Contrôleur REST pour l'upload de fichiers images.
 *
 * Endpoint : POST /api/admin/upload
 * - Reçoit un fichier image (multipart/form-data)
 * - Valide le type MIME (images uniquement)
 * - Sauvegarde dans le dossier uploads/ du projet
 * - Retourne l'URL publique du fichier
 *
 * Les fichiers sont accessibles via : http://localhost:8080/uploads/<filename>
 */
@RestController
@RequestMapping("/api/admin")
public class FileUploadController {

    /** Dossier de stockage des images uploadées */
    private static final String UPLOAD_DIR = "uploads/";

    /**
     * Upload d'une image depuis le formulaire admin.
     *
     * @param file Le fichier image reçu (champ "file" du formulaire)
     * @return JSON { "url": "http://localhost:8080/uploads/<nom_du_fichier>" }
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        // Validation : vérifier que c'est bien une image
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Seules les images sont acceptées"));
        }

        // Validation : taille max 5 MB
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "La taille max est 5 MB"));
        }

        try {
            // Création du dossier uploads si inexistant
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Génération d'un nom de fichier unique pour éviter les conflits
            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : ".jpg";
            String uniqueName = UUID.randomUUID().toString() + extension;

            // Sauvegarde du fichier sur le disque
            Path filePath = uploadPath.resolve(uniqueName);
            Files.write(filePath, file.getBytes());

            // Retour de l'URL publique accessible depuis le frontend
            String fileUrl = "http://localhost:8080/uploads/" + uniqueName;
            return ResponseEntity.ok(Map.of("url", fileUrl));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur lors de l'upload: " + e.getMessage()));
        }
    }
}
