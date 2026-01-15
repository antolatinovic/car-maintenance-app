import SwiftUI

/// Point d'entree de l'application CarMaintenance
@main
struct CarMaintenanceApp: App {
    // MARK: - App Configuration

    init() {
        // Configuration de l'apparence globale
        configureAppearance()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .preferredColorScheme(.dark) // Force le mode sombre
        }
    }

    // MARK: - Appearance Configuration

    private func configureAppearance() {
        // Configuration de la navigation bar
        let navigationBarAppearance = UINavigationBarAppearance()
        navigationBarAppearance.configureWithOpaqueBackground()
        navigationBarAppearance.backgroundColor = UIColor(AppColors.backgroundPrimary)
        navigationBarAppearance.titleTextAttributes = [
            .foregroundColor: UIColor.white
        ]
        navigationBarAppearance.largeTitleTextAttributes = [
            .foregroundColor: UIColor.white
        ]

        UINavigationBar.appearance().standardAppearance = navigationBarAppearance
        UINavigationBar.appearance().scrollEdgeAppearance = navigationBarAppearance
        UINavigationBar.appearance().compactAppearance = navigationBarAppearance
        UINavigationBar.appearance().tintColor = UIColor(AppColors.accentPrimary)

        // Configuration de la tab bar (si utilisation native)
        let tabBarAppearance = UITabBarAppearance()
        tabBarAppearance.configureWithOpaqueBackground()
        tabBarAppearance.backgroundColor = UIColor(AppColors.backgroundSecondary)

        UITabBar.appearance().standardAppearance = tabBarAppearance
        UITabBar.appearance().scrollEdgeAppearance = tabBarAppearance
        UITabBar.appearance().tintColor = UIColor(AppColors.accentPrimary)

        // Configuration des text fields
        UITextField.appearance().tintColor = UIColor(AppColors.accentPrimary)

        // Configuration des switch
        UISwitch.appearance().onTintColor = UIColor(AppColors.accentPrimary)
    }
}

// MARK: - Environment Keys (pour injection de dependances future)

private struct UserRepositoryKey: EnvironmentKey {
    static let defaultValue: Any? = nil
}

private struct VehicleRepositoryKey: EnvironmentKey {
    static let defaultValue: Any? = nil
}

extension EnvironmentValues {
    var userRepository: Any? {
        get { self[UserRepositoryKey.self] }
        set { self[UserRepositoryKey.self] = newValue }
    }

    var vehicleRepository: Any? {
        get { self[VehicleRepositoryKey.self] }
        set { self[VehicleRepositoryKey.self] = newValue }
    }
}
