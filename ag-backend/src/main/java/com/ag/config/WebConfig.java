package com.ag.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Configuration Spring MVC pour servir les fichiers uploadés.
 *
 * Rend le dossier uploads/ accessible via l'URL :
 * http://localhost:8080/uploads/<nom_du_fichier>
 *
 * Le chemin absolu est construit dynamiquement depuis le répertoire courant
 * pour fonctionner quel que soit l'endroit où le projet est lancé.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Chemin absolu vers le dossier uploads/
        String uploadPath = Paths.get("uploads/").toAbsolutePath().toUri().toString();

        // Toute requête /uploads/** sera servie depuis ce dossier
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}
