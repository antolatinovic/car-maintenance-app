import Foundation
import SwiftUI

/// ViewModel pour l'ecran d'accueil
@MainActor
class HomeViewModel: ObservableObject {
    // MARK: - Published Properties

    @Published var user: User = .mock
    @Published var vehicle: Vehicle = .mock
    @Published var budgets: [BudgetSummary] = BudgetSummary.mockData
    @Published var upcomingMaintenances: [MaintenanceSchedule] = MaintenanceSchedule.mockData

    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var hasNotifications: Bool = true
    @Published var notificationCount: Int = 2

    // MARK: - Computed Properties

    var sortedMaintenances: [MaintenanceSchedule] {
        upcomingMaintenances
            .filter { $0.status == .pending }
            .sorted { m1, m2 in
                // Trier par urgence puis par date
                if m1.urgency != m2.urgency {
                    return urgencyOrder(m1.urgency) < urgencyOrder(m2.urgency)
                }
                guard let date1 = m1.dueDate, let date2 = m2.dueDate else {
                    return m1.dueDate != nil
                }
                return date1 < date2
            }
    }

    private func urgencyOrder(_ urgency: MaintenanceUrgency) -> Int {
        switch urgency {
        case .overdue: return 0
        case .urgent: return 1
        case .soon: return 2
        case .upcoming: return 3
        case .optional: return 4
        }
    }

    var totalBudget: Double {
        budgets.first { $0.category == .total }?.amount ?? 0
    }

    var urgentMaintenanceCount: Int {
        upcomingMaintenances.filter {
            $0.urgency == .urgent || $0.urgency == .overdue
        }.count
    }

    // MARK: - Initialization

    init() {
        // Initialisation avec donnees mockees
        // En production, charger depuis le repository
    }

    // MARK: - Data Loading

    func loadData() async {
        isLoading = true
        errorMessage = nil

        do {
            // Simuler un delai reseau
            try await Task.sleep(nanoseconds: 500_000_000)

            // En production, charger depuis les services
            // user = try await userRepository.getCurrentUser()
            // vehicle = try await vehicleRepository.getMainVehicle()
            // budgets = try await expenseRepository.getBudgetSummary()
            // upcomingMaintenances = try await maintenanceRepository.getUpcoming()

            isLoading = false
        } catch {
            errorMessage = "Erreur de chargement: \(error.localizedDescription)"
            isLoading = false
        }
    }

    func refreshData() async {
        await loadData()
    }

    // MARK: - Navigation Actions

    func onNotificationTap() {
        print("[HomeViewModel] Notification tapped")
        // TODO: Navigation vers notifications
    }

    func onVehicleTap() {
        print("[HomeViewModel] Vehicle card tapped")
        // TODO: Navigation vers details vehicule
    }

    func onEditVehicleTap() {
        print("[HomeViewModel] Edit vehicle tapped")
        // TODO: Navigation vers edition vehicule
    }

    func onVehicleQuickAction(_ action: VehicleCardView.QuickAction) {
        switch action {
        case .details:
            print("[HomeViewModel] Vehicle details action")
            // TODO: Navigation vers details vehicule
        case .mileage:
            print("[HomeViewModel] Update mileage action")
            // TODO: Afficher modal mise a jour kilometrage
        case .more:
            print("[HomeViewModel] More actions")
            // TODO: Afficher menu d'actions
        }
    }

    func onBudgetTap(_ budget: BudgetSummary) {
        print("[HomeViewModel] Budget tapped: \(budget.category.rawValue)")
        // TODO: Navigation vers details budget/categorie
    }

    func onViewAllBudgetsTap() {
        print("[HomeViewModel] View all budgets tapped")
        // TODO: Navigation vers page budget complete
    }

    func onMaintenanceTap(_ maintenance: MaintenanceSchedule) {
        print("[HomeViewModel] Maintenance tapped: \(maintenance.title)")
        // TODO: Navigation vers details echeance
    }

    func onViewCalendarTap() {
        print("[HomeViewModel] View calendar tapped")
        // TODO: Navigation vers calendrier
    }

    // MARK: - Actions

    func updateMileage(_ newMileage: Int) async {
        // En production:
        // vehicle.currentMileage = newMileage
        // try await vehicleRepository.updateVehicle(vehicle)
        print("[HomeViewModel] Mileage updated to: \(newMileage)")
    }

    func markMaintenanceComplete(_ maintenance: MaintenanceSchedule) async {
        // En production:
        // var updated = maintenance
        // updated.status = .completed
        // updated.completedAt = Date()
        // try await maintenanceRepository.update(updated)
        print("[HomeViewModel] Maintenance marked complete: \(maintenance.title)")
    }
}

// MARK: - Preview Helper
extension HomeViewModel {
    static var preview: HomeViewModel {
        let vm = HomeViewModel()
        vm.user = .mock
        vm.vehicle = .mock
        vm.budgets = BudgetSummary.mockData
        vm.upcomingMaintenances = MaintenanceSchedule.mockData
        return vm
    }

    static var previewEmpty: HomeViewModel {
        let vm = HomeViewModel()
        vm.user = .mock
        vm.vehicle = .mock
        vm.budgets = BudgetSummary.mockEmpty
        vm.upcomingMaintenances = []
        return vm
    }

    static var previewLoading: HomeViewModel {
        let vm = HomeViewModel()
        vm.isLoading = true
        return vm
    }
}
