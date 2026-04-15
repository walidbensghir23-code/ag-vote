package com.ag.config;

import com.ag.entity.*;
import com.ag.repository.*;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.List;

@Configuration
public class DataInitializer {

    private final UserRepository userRepository;
    private final EntrepriseRepository entrepriseRepository;
    private final ActionnaireRepository actionnaireRepository;
    private final ResolutionRepository resolutionRepository;
    private final AssembleeGeneraleRepository agRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, EntrepriseRepository entrepriseRepository,
                           ActionnaireRepository actionnaireRepository, ResolutionRepository resolutionRepository,
                           AssembleeGeneraleRepository agRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.entrepriseRepository = entrepriseRepository;
        this.actionnaireRepository = actionnaireRepository;
        this.resolutionRepository = resolutionRepository;
        this.agRepository = agRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Bean
    public ApplicationRunner initData() {
        return args -> {
            // ── Ne rien insérer si la DB contient déjà des données ──
            if (userRepository.count() > 0) {
                System.out.println("=== Base de données déjà initialisée — aucune insertion ===");
                return;
            }

            System.out.println("=== Initialisation des données de démonstration ===");

            User admin = User.builder().username("admin").password(passwordEncoder.encode("admin"))
                    .role(Role.ADMIN).nom("Dupont").prenom("Jean").email("admin@ag.fr").build();
            User user1 = User.builder().username("martin").password(passwordEncoder.encode("martin"))
                    .role(Role.USER).nom("Martin").prenom("Claire").email("claire@ag.fr").build();
            User user2 = User.builder().username("leblanc").password(passwordEncoder.encode("leblanc"))
                    .role(Role.USER).nom("Leblanc").prenom("Pierre").email("pierre@ag.fr").build();
            User user3 = User.builder().username("moreau").password(passwordEncoder.encode("moreau"))
                    .role(Role.USER).nom("Moreau").prenom("Sophie").email("sophie@ag.fr").build();
            userRepository.saveAll(List.of(admin, user1, user2, user3));

            Entreprise e1 = Entreprise.builder().nom("TechInnovation SA").siret("12345678901234")
                    .description("Leader en solutions technologiques").secteur("Technologies").build();
            Entreprise e2 = Entreprise.builder().nom("GreenEnergy SARL").siret("98765432109876")
                    .description("Énergies renouvelables & développement durable").secteur("Énergie").build();
            entrepriseRepository.saveAll(List.of(e1, e2));

            Actionnaire a1 = Actionnaire.builder().user(user1).entreprise(e1).nombreActions(500).build();
            Actionnaire a2 = Actionnaire.builder().user(user2).entreprise(e1).nombreActions(300).build();
            Actionnaire a3 = Actionnaire.builder().user(user3).entreprise(e1).nombreActions(200).build();
            Actionnaire a4 = Actionnaire.builder().user(user1).entreprise(e2).nombreActions(400).build();
            Actionnaire a5 = Actionnaire.builder().user(user2).entreprise(e2).nombreActions(600).build();
            actionnaireRepository.saveAll(List.of(a1, a2, a3, a4, a5));

            Resolution r1 = Resolution.builder().titre("Approbation des comptes 2024")
                    .description("Approbation des comptes annuels de l'exercice 2024")
                    .dateAG(LocalDate.of(2025, 3, 15)).ordre(1).entreprise(e1).build();
            Resolution r2 = Resolution.builder().titre("Distribution de dividendes")
                    .description("Distribution d'un dividende de 2€ par action")
                    .dateAG(LocalDate.of(2025, 3, 15)).ordre(2).entreprise(e1).build();
            Resolution r3 = Resolution.builder().titre("Nomination nouveau directeur")
                    .description("Nomination de M. Dupois comme directeur général")
                    .dateAG(LocalDate.of(2025, 3, 15)).ordre(3).entreprise(e1).build();
            Resolution r4 = Resolution.builder().titre("Augmentation du capital social")
                    .description("Augmentation du capital de 500.000€")
                    .dateAG(LocalDate.of(2025, 4, 10)).ordre(1).entreprise(e2).build();
            Resolution r5 = Resolution.builder().titre("Plan d'investissement 2025-2027")
                    .description("Approbation du plan stratégique triennal")
                    .dateAG(LocalDate.of(2025, 4, 10)).ordre(2).entreprise(e2).build();
            resolutionRepository.saveAll(List.of(r1, r2, r3, r4, r5));

            AssembleeGenerale ag1 = AssembleeGenerale.builder()
                    .titre("AG Ordinaire 2024 - TechInnovation")
                    .date(LocalDate.of(2025, 3, 15)).description("AG Ordinaire annuelle")
                    .lieu("Siège social - Paris 8ème").entreprise(e1).resolutions(List.of(r1, r2, r3)).build();
            AssembleeGenerale ag2 = AssembleeGenerale.builder()
                    .titre("AG Extraordinaire - GreenEnergy")
                    .date(LocalDate.of(2025, 4, 10)).description("AG Extraordinaire pour augmentation de capital")
                    .lieu("Hôtel Marriott - Lyon").entreprise(e2).resolutions(List.of(r4, r5)).build();
            agRepository.saveAll(List.of(ag1, ag2));

            System.out.println("=== Données insérées avec succès ===");
            System.out.println("  Admin   : admin / admin");
            System.out.println("  Users   : martin / martin | leblanc / leblanc | moreau / moreau");
        };
    }
}
