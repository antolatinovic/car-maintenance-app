import Foundation
import SwiftUI

/// Type de carburant/energie du vehicule
enum FuelType: String, CaseIterable, Codable {
    case gasoline = "Essence"
    case diesel = "Diesel"
    case electric = "Electrique"
    case hybrid = "Hybride"
    case pluginHybrid = "Hybride rechargeable"

    var icon: String {
        switch self {
        case .electric:
            return "bolt.fill"
        case .hybrid, .pluginHybrid:
            return "leaf.fill"
        default:
            return "fuelpump.fill"
        }
    }

    var color: Color {
        switch self {
        case .electric:
            return AppColors.accentPrimary
        case .hybrid, .pluginHybrid:
            return AppColors.accentSuccess
        default:
            return AppColors.accentWarning
        }
    }
}

/// Type de transmission
enum TransmissionType: String, CaseIterable, Codable {
    case manual = "Manuelle"
    case automatic = "Automatique"
}

/// Modele vehicule
struct Vehicle: Identifiable, Codable {
    let id: UUID
    var brand: String
    var model: String
    var year: Int
    var registrationPlate: String
    var vin: String?
    var currentMileage: Int
    var purchaseMileage: Int?
    var fuelType: FuelType
    var transmission: TransmissionType
    var enginePower: String?
    var color: String?
    var photoURL: String?
    var purchaseDate: Date?
    var purchasePrice: Double?

    // MARK: - Computed Properties

    var displayName: String {
        "\(brand) \(model)"
    }

    var fullDisplayName: String {
        "\(brand) \(model) \(year)"
    }

    var formattedMileage: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return "\(formatter.string(from: NSNumber(value: currentMileage)) ?? "\(currentMileage)") km"
    }

    var distanceSincePurchase: Int? {
        guard let purchase = purchaseMileage else { return nil }
        return currentMileage - purchase
    }

    var formattedDistanceSincePurchase: String? {
        guard let distance = distanceSincePurchase else { return nil }
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        formatter.groupingSeparator = " "
        return "\(formatter.string(from: NSNumber(value: distance)) ?? "\(distance)") km parcourus"
    }

    var formattedPurchasePrice: String? {
        guard let price = purchasePrice else { return nil }
        let formatter = NumberFormatter()
        formatter.numberStyle = .currency
        formatter.currencyCode = "EUR"
        formatter.locale = Locale(identifier: "fr_FR")
        return formatter.string(from: NSNumber(value: price))
    }
}

// MARK: - Mock Data
extension Vehicle {
    static let mock = Vehicle(
        id: UUID(),
        brand: "Tesla",
        model: "Model 3",
        year: 2023,
        registrationPlate: "AB-123-CD",
        vin: "5YJ3E1EA1PF123456",
        currentMileage: 45230,
        purchaseMileage: 15000,
        fuelType: .electric,
        transmission: .automatic,
        enginePower: "325 ch",
        color: "Blanc Nacre",
        photoURL: nil,
        purchaseDate: Calendar.current.date(byAdding: .year, value: -1, to: Date()),
        purchasePrice: 42990
    )

    static let mockDiesel = Vehicle(
        id: UUID(),
        brand: "Peugeot",
        model: "308",
        year: 2021,
        registrationPlate: "EF-456-GH",
        vin: nil,
        currentMileage: 78500,
        purchaseMileage: 45000,
        fuelType: .diesel,
        transmission: .manual,
        enginePower: "130 ch",
        color: "Gris Artense",
        photoURL: nil,
        purchaseDate: Calendar.current.date(byAdding: .month, value: -18, to: Date()),
        purchasePrice: 18500
    )

    static let mockHybrid = Vehicle(
        id: UUID(),
        brand: "Toyota",
        model: "Yaris Cross",
        year: 2022,
        registrationPlate: "IJ-789-KL",
        vin: nil,
        currentMileage: 32100,
        purchaseMileage: 0,
        fuelType: .hybrid,
        transmission: .automatic,
        enginePower: "116 ch",
        color: "Rouge Tokyo",
        photoURL: nil,
        purchaseDate: Calendar.current.date(byAdding: .month, value: -24, to: Date()),
        purchasePrice: 28900
    )
}
