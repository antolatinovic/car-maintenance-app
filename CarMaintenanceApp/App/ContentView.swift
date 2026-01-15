import SwiftUI

/// Vue principale avec navigation par onglets
struct ContentView: View {
    @State private var selectedTab: TabItem = .home

    var body: some View {
        ZStack(alignment: .bottom) {
            // Contenu selon l'onglet selectionne
            Group {
                switch selectedTab {
                case .home:
                    HomeView()
                case .documents:
                    PlaceholderView(
                        title: "Documents",
                        icon: "doc.text.fill",
                        description: "Scanner et gerer vos factures"
                    )
                case .assistant:
                    PlaceholderView(
                        title: "Assistant IA",
                        icon: "bubble.left.and.bubble.right.fill",
                        description: "Posez vos questions sur votre vehicule"
                    )
                case .calendar:
                    PlaceholderView(
                        title: "Calendrier",
                        icon: "calendar",
                        description: "Planifiez vos maintenances"
                    )
                case .settings:
                    PlaceholderView(
                        title: "Reglages",
                        icon: "gearshape.fill",
                        description: "Personnalisez votre application"
                    )
                }
            }

            // Tab bar personnalisee
            MinimalTabBar(selectedTab: $selectedTab)
        }
        .ignoresSafeArea(.keyboard)
    }
}

/// Vue placeholder pour les onglets non implementes
struct PlaceholderView: View {
    let title: String
    let icon: String
    let description: String

    var body: some View {
        ZStack {
            AppColors.backgroundPrimary
                .ignoresSafeArea()

            VStack(spacing: AppDimensions.spacingL) {
                Spacer()

                // Icone
                Image(systemName: icon)
                    .font(.system(size: 60, weight: .light))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [AppColors.accentPrimary.opacity(0.6), AppColors.accentPrimary.opacity(0.3)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )

                // Titre
                Text(title)
                    .font(AppFonts.h1)
                    .foregroundColor(AppColors.textPrimary)

                // Description
                Text(description)
                    .font(AppFonts.body)
                    .foregroundColor(AppColors.textSecondary)
                    .multilineTextAlignment(.center)

                // Badge "Bientot disponible"
                Text("Bientot disponible")
                    .font(AppFonts.captionMedium)
                    .foregroundColor(AppColors.accentPrimary)
                    .padding(.horizontal, AppDimensions.spacingM)
                    .padding(.vertical, AppDimensions.spacingS)
                    .background(AppColors.accentPrimary.opacity(0.15))
                    .clipShape(Capsule())

                Spacer()

                // Espace pour tab bar
                Spacer()
                    .frame(height: AppDimensions.tabBarHeight)
            }
            .padding()
        }
    }
}

// MARK: - Alternative avec TabView natif
struct ContentViewNative: View {
    @State private var selectedTab: TabItem = .home

    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label(TabItem.home.title, systemImage: TabItem.home.icon)
                }
                .tag(TabItem.home)

            PlaceholderView(
                title: "Documents",
                icon: "doc.text.fill",
                description: "Scanner et gerer vos factures"
            )
            .tabItem {
                Label(TabItem.documents.title, systemImage: TabItem.documents.icon)
            }
            .tag(TabItem.documents)

            PlaceholderView(
                title: "Assistant IA",
                icon: "bubble.left.and.bubble.right.fill",
                description: "Posez vos questions sur votre vehicule"
            )
            .tabItem {
                Label(TabItem.assistant.title, systemImage: TabItem.assistant.icon)
            }
            .tag(TabItem.assistant)

            PlaceholderView(
                title: "Calendrier",
                icon: "calendar",
                description: "Planifiez vos maintenances"
            )
            .tabItem {
                Label(TabItem.calendar.title, systemImage: TabItem.calendar.icon)
            }
            .tag(TabItem.calendar)

            PlaceholderView(
                title: "Reglages",
                icon: "gearshape.fill",
                description: "Personnalisez votre application"
            )
            .tabItem {
                Label(TabItem.settings.title, systemImage: TabItem.settings.icon)
            }
            .tag(TabItem.settings)
        }
        .tint(AppColors.accentPrimary)
    }
}

// MARK: - Preview
#Preview("Content View - Custom Tab Bar") {
    ContentView()
}

#Preview("Content View - Native Tab Bar") {
    ContentViewNative()
        .preferredColorScheme(.dark)
}
