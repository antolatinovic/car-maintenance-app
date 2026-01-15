import Foundation
import SwiftUI

/// Niveau d'urgence d'une echeance
enum MaintenanceUrgency: String, CaseIterable {
    case overdue = "En retard"
    case urgent = "Urgent"        // < 7 jours
    case soon = "Bientot"         // 7-30 jours
    case upcoming = "A venir"     // > 30 jours
    case optional = "Optionnel"

    var color: Color {
        switch self {
        case .overdue:
            return AppColors.accentDanger
        case .urgent:
            return AppColors.accentDanger.opacity(0.8)
        case .soon:
            return AppColors.accentWarning
        case .upcoming:
            return AppColors.accentSuccess
        case .optional:
            return AppColors.textSecondary
        }
    }

    var icon: String {
        switch self {
        case .overdue:
            return "exclamationmark.triangle.fill"
        case .urgent:
            return "exclamationmark.circle.fill"
        case .soon:
            return "clock.fill"
        case .upcoming:
            return "calendar"
        case .optional:
            return "questionmark.circle"
        }
    }
}

/// Categories de maintenance (PRD Section 3.5.2)
enum MaintenanceCategory: String, CaseIterable, Codable {
    case oilChange = "Vidange & filtres"
    case brakes = "Freinage"
    case mechanical = "Mecanique"
    case tires = "Pneumatiques"
    case revision = "Revisions"
    case climate = "Climatisation"
    case custom = "Personnalise"

    var icon: String {
        switch self {
        case .oilChange:
            return "drop.fill"
        case .brakes:
            return "circle.circle"
        case .mechanical:
            return "gear"
        case .tires:
            return "circle.grid.2x2"
        case .revision:
            return "checklist"
        case .climate:
            return "snowflake"
        case .custom:
            return "wrench.fill"
        }
    }

    var color: Color {
        switch self {
        case .oilChange:
            return Color(hex: "#F0B429")
        case .brakes:
            return AppColors.accentDanger
        case .mechanical:
            return AppColors.textSecondary
        case .tires:
            return Color(hex: "#2D3748")
        case .revision:
            return AppColors.accentPrimary
        case .climate:
            return Color(hex: "#38B2AC")
        case .custom:
            return AppColors.accentSuccess
        }
    }
}

/// Type de rappel
enum ReminderType: String, Codable {
    case date = "Date"
    case mileage = "Kilometrage"
    case both = "Date ou kilometrage"
}

/// Status d'une echeance
enum MaintenanceStatus: String, Codable {
    case pending = "En attente"
    case completed = "Termine"
    case overdue = "En retard"
    case skipped = "Ignore"
}

/// Echeance de maintenance
struct MaintenanceSchedule: Identifiable, Codable {
    let id: UUID
    var vehicleId: UUID
    var title: String
    var category: MaintenanceCategory
    var description: String?
    var reminderType: ReminderType
    var dueDate: Date?
    var dueMileage: Int?
    var notificationAdvanceDays: Int
    var notificationAdvanceKm: Int?
    var estimatedCost: Double?
    var location: String?
    var notes: String?
    var status: MaintenanceStatus
    var completedAt: Date?

    // MARK: - Computed Properties

    var urgency: MaintenanceUrgency {
        guard status == .pending else {
            return .optional
        }

        if let date = dueDate {
            let daysUntil = Calendar.current.dateComponents([.day], from: Date(), to: date).day ?? 0

            if daysUntil < 0 {
                return .overdue
            } else if daysUntil <= 7 {
                return .urgent
            } else if daysUntil <= 30 {
                return .soon
            }
        }

        return .upcoming
    }

    var formattedDueDate: String {
        guard let date = dueDate else { return "Non planifie" }
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.locale = Locale(identifier: "fr_FR")
        return formatter.string(from: date)
    }

    var relativeDueDate: String {
        guard let date = dueDate else { return "Non planifie" }

        let calendar = Calendar.current
        let now = Date()
        let components = calendar.dateComponents([.day], from: now, to: date)

        guard let days = components.day else { return formattedDueDate }

        if days < 0 {
            return "En retard de \(abs(days)) jour\(abs(days) > 1 ? "s" : "")"
        } else if days == 0 {
            return "Aujourd'hui"
        } else if days == 1 {
            return "Demain"
        } else if days <= 7 {
            return "Dans \(days) jours"
        } else if days <= 30 {
            let weeks = days / 7
            return "Dans \(weeks) semaine\(weeks > 1 ? "s" : "")"
        } else {
            return formattedDueDate
        }
    }

    var formattedDueMileage: String? {
        guard let mileage = dueMileage else { return nil }
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return "\(formatter.string(from: NSNumber(value: mileage)) ?? "\(mileage)") km"
    }

    var formattedEstimatedCost: String? {
        guard let cost = estimatedCost else { return nil }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: cost))
    }
}

// MARK: - Mock Data
extension MaintenanceSchedule {
    static let mockData: [MaintenanceSchedule] = [
        MaintenanceSchedule(
            id: UUID(),
            vehicleId: UUID(),
            title: "Vidange huile moteur",
            category: .oilChange,
            description: "Vidange + filtre a huile",
            reminderType: .both,
            dueDate: Calendar.current.date(byAdding: .day, value: 5, to: Date()),
            dueMileage: 50000,
            notificationAdvanceDays: 7,
            notificationAdvanceKm: 500,
            estimatedCost: 120,
            location: "Garage Dupont",
            notes: nil,
            status: .pending,
            completedAt: nil
        ),
        MaintenanceSchedule(
            id: UUID(),
            vehicleId: UUID(),
            title: "Controle technique",
            category: .revision,
            description: "CT obligatoire",
            reminderType: .date,
            dueDate: Calendar.current.date(byAdding: .day, value: 21, to: Date()),
            dueMileage: nil,
            notificationAdvanceDays: 30,
            notificationAdvanceKm: nil,
            estimatedCost: 80,
            location: nil,
            notes: "Penser a prendre RDV",
            status: .pending,
            completedAt: nil
        ),
        MaintenanceSchedule(
            id: UUID(),
            vehicleId: UUID(),
            title: "Changement pneus ete",
            category: .tires,
            description: "Permutation pneus hiver -> ete",
            reminderType: .date,
            dueDate: Calendar.current.date(byAdding: .month, value: 2, to: Date()),
            dueMileage: nil,
            notificationAdvanceDays: 14,
            notificationAdvanceKm: nil,
            estimatedCost: 60,
            location: nil,
            notes: nil,
            status: .pending,
            completedAt: nil
        )
    ]

    static let mockOverdue = MaintenanceSchedule(
        id: UUID(),
        vehicleId: UUID(),
        title: "Revision annuelle",
        category: .revision,
        description: nil,
        reminderType: .date,
        dueDate: Calendar.current.date(byAdding: .day, value: -10, to: Date()),
        dueMileage: nil,
        notificationAdvanceDays: 7,
        notificationAdvanceKm: nil,
        estimatedCost: 350,
        location: nil,
        notes: nil,
        status: .pending,
        completedAt: nil
    )
}
