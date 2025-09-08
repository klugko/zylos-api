/**
 * Exemple d'utilisation du système de statuts personnalisés
 *
 * Ce fichier montre comment utiliser les différents endpoints
 * pour gérer les statuts personnalisés dans un projet.
 */

import { Injectable } from "@nestjs/common";

@Injectable()
export class CustomStatusExample {
  /**
   * Exemple complet d'utilisation du système de statuts personnalisés
   */
  async demonstrateCustomStatusSystem() {
    const projectId = "project-uuid-example";
    const taskId = "task-uuid-example";

    // 1. Initialiser les statuts par défaut
    console.log("1. Initialisation des statuts par défaut...");
    // POST /custom-statuses/project/{projectId}/initialize-defaults

    // 2. Créer un statut personnalisé
    console.log("2. Création d'un statut personnalisé...");
    const customStatus = {
      name: "En validation marketing",
      description: "Tâche en attente de validation par l'équipe marketing",
      color: "#FF6B6B",
      order: 3,
      projectId: projectId,
      isDefault: false,
    };
    // POST /custom-statuses

    // 3. Lister les statuts du projet
    console.log("3. Récupération des statuts du projet...");
    // GET /custom-statuses/project/{projectId}?activeOnly=true

    // 4. Assigner un statut à une tâche
    console.log("4. Assignation d'un statut à une tâche...");
    const statusAssignment = {
      taskId: taskId,
      customStatusId: "status-uuid",
      startDate: new Date().toISOString(),
    };
    // POST /status-assignments

    // 5. Obtenir les informations complètes d'une tâche
    console.log("5. Récupération des informations de la tâche...");
    // GET /task-status-sync/task/{taskId}

    // 6. Surveiller les alertes
    console.log("6. Surveillance des alertes...");
    // GET /status-alerts/project/{projectId}?unresolvedOnly=true

    // 7. Obtenir les statistiques
    console.log("7. Récupération des statistiques...");
    // GET /status-alerts/project/{projectId}/status-statistics

    // 8. Suggérer un changement de statut
    console.log("8. Suggestion de changement de statut...");
    // GET /status-alerts/task/{taskId}/suggest-status

    // 9. Résoudre une alerte
    console.log("9. Résolution d'une alerte...");
    // PUT /status-alerts/{alertId}/resolve
    const alertResolution = {
      resolution: "Tâche débloquée après discussion avec l'équipe marketing",
    };

    console.log("Exemple terminé !");
  }

  /**
   * Exemple de flux de travail typique
   */
  async typicalWorkflow() {
    const projectId = "project-uuid";
    const taskId = "task-uuid";

    // Étape 1: Initialiser le projet avec des statuts par défaut
    console.log("Initialisation du projet...");
    // POST /custom-statuses/project/{projectId}/initialize-defaults

    // Étape 2: Créer des statuts spécifiques à l'équipe
    console.log("Création de statuts personnalisés...");
    const teamStatuses = [
      {
        name: "En attente client",
        description: "Tâche en attente de retour du client",
        color: "#FF9800",
        order: 2,
        projectId: projectId,
      },
      {
        name: "En révision technique",
        description: "Tâche en cours de révision par l'équipe technique",
        color: "#9C27B0",
        order: 4,
        projectId: projectId,
      },
    ];

    // Étape 3: Assigner des statuts aux tâches
    console.log("Assignation des statuts...");
    // Les statuts sont assignés automatiquement lors des changements de statut des tâches

    // Étape 4: Surveiller les alertes
    console.log("Surveillance des alertes...");
    // Le système surveille automatiquement et génère des alertes

    // Étape 5: Analyser les performances
    console.log("Analyse des performances...");
    // GET /status-alerts/project/{projectId}/status-statistics
  }

  /**
   * Exemple de gestion des alertes
   */
  async alertManagement() {
    const projectId = "project-uuid";

    // Récupérer toutes les alertes non résolues
    console.log("Récupération des alertes non résolues...");
    // GET /status-alerts/project/{projectId}?unresolvedOnly=true

    // Analyser les statistiques des alertes
    console.log("Analyse des statistiques...");
    // GET /status-alerts/project/{projectId}/statistics

    // Résoudre les alertes par priorité
    console.log("Résolution des alertes critiques...");
    // PUT /status-alerts/{alertId}/resolve

    // Obtenir des suggestions pour les tâches bloquées
    console.log("Génération de suggestions...");
    // GET /status-alerts/task/{taskId}/suggest-status
  }
}
