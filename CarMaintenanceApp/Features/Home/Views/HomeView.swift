import SwiftUI

/// Vue principale de l'ecran d'accueil
struct HomeView: View {
    @StateObject private var viewModel = HomeViewModel()
    @State private var showMileageSheet: Bool = false

    var body: some View {
        ZStack {
            // Background
            AppColors.backgroundPrimary
                .ignoresSafeArea()

            // Content
            if viewModel.isLoading {
                loadingView
            } else {
                mainContent
            }
        }
        .task {
            await viewModel.loadData()
        }
        .refreshable {
            await viewModel.refreshData()
        }
    }

    // MARK: - Main Content

    private var mainContent: some View {
        ScrollView(.vertical, showsIndicators: false) {
            VStack(spacing: AppDimensions.spacingL) {
                // Header avec avatar et notification
                HomeHeaderView(
                    user: viewModel.user,
                    hasNotifications: viewModel.hasNotifications,
                    notificationCount: viewModel.notificationCount,
                    onNotificationTap: viewModel.onNotificationTap
                )

                // Carte vehicule principale
                VehicleCardView(
                    vehicle: viewModel.vehicle,
                    onTap: viewModel.onVehicleTap,
                    onEditTap: viewModel.onEditVehicleTap,
                    onQuickAction: viewModel.onVehicleQuickAction
                )
                .padding(.horizontal, AppDimensions.screenPaddingHorizontal)

                // Grille des budgets
                BudgetCardsGridView(
                    budgets: viewModel.budgets,
                    onViewAllTap: viewModel.onViewAllBudgetsTap,
                    onBudgetTap: viewModel.onBudgetTap
                )
                .padding(.horizontal, AppDimensions.screenPaddingHorizontal)

                // Prochaines echeances
                UpcomingMaintenanceView(
                    maintenances: viewModel.sortedMaintenances,
                    onViewAllTap: viewModel.onViewCalendarTap,
                    onMaintenanceTap: viewModel.onMaintenanceTap
                )
                .padding(.horizontal, AppDimensions.screenPaddingHorizontal)

                // Espace pour la tab bar
                Spacer()
                    .frame(height: AppDimensions.tabBarHeight + AppDimensions.spacingL)
            }
            .padding(.top, AppDimensions.spacingS)
        }
    }

    // MARK: - Loading View

    private var loadingView: some View {
        VStack(spacing: AppDimensions.spacingL) {
            Spacer()

            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: AppColors.accentPrimary))
                .scaleEffect(1.5)

            Text("Chargement...")
                .font(AppFonts.body)
                .foregroundColor(AppColors.textSecondary)

            Spacer()
        }
    }
}

// MARK: - Preview
#Preview("Home View") {
    HomeView()
}

#Preview("Home View - Dark") {
    HomeView()
        .preferredColorScheme(.dark)
}
