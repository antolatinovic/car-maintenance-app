import Foundation
import SwiftUI

/// Categories de depenses
enum ExpenseCategory: String, CaseIterable, Codable {
    case total = "Budget Total"
    case fuel = "Carburant"
    case maintenance = "Entretien"
    case other = "Autres"

    var icon: String {
        switch self {
        case .total:
            return "dollarsign.circle.fill"
        case .fuel:
            return "fuelpump.fill"
        case .maintenance:
            return "wrench.and.screwdriver.fill"
        case .other:
            return "ellipsis.circle.fill"
        }
    }

    var color: Color {
        switch self {
        case .total:
            return AppColors.accentPrimary
        case .fuel:
            return AppColors.accentWarning
        case .maintenance:
            return AppColors.accentSuccess
        case .other:
            return AppColors.textSecondary
        }
    }
}

/// Sous-categories de depenses "Autres"
enum OtherExpenseType: String, CaseIterable, Codable {
    case insurance = "Assurance"
    case parking = "Stationnement"
    case tolls = "Peages"
    case fines = "Amendes"
    case cleaning = "Lavage"
    case accessories = "Accessoires"
    case other = "Divers"
}

/// Resume du budget par categorie (pour affichage dashboard)
struct BudgetSummary: Identifiable {
    let id = UUID()
    let category: ExpenseCategory
    let amount: Double
    let trend: Double? // Pourcentage de variation vs periode precedente

    var formattedAmount: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.locale = Locale(identifier: "fr_FR")
        formatter.maximumFractionDigits = 0
        return formatter.string(from: NSNumber(value: amount)) ?? "\(Int(amount)) EUR"
    }

    var formattedAmountCompact: String {
        if amount >= 1000 {
            let formatter = NumberFormatter()
            formatter.numberStyle = .decimal
            formatter.maximumFractionDigits = 1
            let thousands = amount / 1000
            return "\(formatter.string(from: NSNumber(value: thousands)) ?? "\(thousands)")k EUR"
        }
        return formattedAmount
    }

    var trendText: String? {
        guard let trend = trend else { return nil }
        let sign = trend >= 0 ? "+" : ""
        return "\(sign)\(Int(trend))%"
    }

    var trendColor: Color {
        guard let trend = trend else { return AppColors.textSecondary }
        // Pour les depenses, une baisse est positive (vert) et une hausse est negative (rouge)
        return trend <= 0 ? AppColors.accentSuccess : AppColors.accentDanger
    }
}

/// Depense individuelle
struct Expense: Identifiable, Codable {
    let id: UUID
    var vehicleId: UUID
    var category: ExpenseCategory
    var otherType: OtherExpenseType?
    var amount: Double
    var date: Date
    var mileage: Int?
    var description: String
    var vendor: String?
    var documentId: UUID?
    var notes: String?

    var formattedAmount: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.locale = Locale(identifier: "fr_FR")
        return formatter.string(from: NSNumber(value: amount)) ?? "\(amount) EUR"
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.locale = Locale(identifier: "fr_FR")
        return formatter.string(from: date)
    }
}

// MARK: - Mock Data
extension BudgetSummary {
    static let mockData: [BudgetSummary] = [
        BudgetSummary(category: .total, amount: 3245.50, trend: 12),
        BudgetSummary(category: .fuel, amount: 1820.00, trend: -5),
        BudgetSummary(category: .maintenance, amount: 985.50, trend: 25),
        BudgetSummary(category: .other, amount: 440.00, trend: 0)
    ]

    static let mockEmpty: [BudgetSummary] = [
        BudgetSummary(category: .total, amount: 0, trend: nil),
        BudgetSummary(category: .fuel, amount: 0, trend: nil),
        BudgetSummary(category: .maintenance, amount: 0, trend: nil),
        BudgetSummary(category: .other, amount: 0, trend: nil)
    ]
}

extension Expense {
    static let mockFuel = Expense(
        id: UUID(),
        vehicleId: UUID(),
        category: .fuel,
        otherType: nil,
        amount: 85.50,
        date: Date(),
        mileage: 45230,
        description: "Plein essence",
        vendor: "TotalEnergies",
        documentId: nil,
        notes: nil
    )

    static let mockMaintenance = Expense(
        id: UUID(),
        vehicleId: UUID(),
        category: .maintenance,
        otherType: nil,
        amount: 320.00,
        date: Calendar.current.date(byAdding: .day, value: -15, to: Date())!,
        mileage: 44500,
        description: "Vidange + filtres",
        vendor: "Garage Dupont",
        documentId: nil,
        notes: "Huile 5W30 Long Life"
    )
}
