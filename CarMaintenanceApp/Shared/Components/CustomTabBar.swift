import SwiftUI

/// Onglets de la navigation principale
enum TabItem: Int, CaseIterable, Identifiable {
    case home = 0
    case documents
    case assistant
    case calendar
    case settings

    var id: Int { rawValue }

    var icon: String {
        switch self {
        case .home:
            return "house.fill"
        case .documents:
            return "doc.text.fill"
        case .assistant:
            return "bubble.left.and.bubble.right.fill"
        case .calendar:
            return "calendar"
        case .settings:
            return "gearshape.fill"
        }
    }

    var iconUnselected: String {
        switch self {
        case .home:
            return "house"
        case .documents:
            return "doc.text"
        case .assistant:
            return "bubble.left.and.bubble.right"
        case .calendar:
            return "calendar"
        case .settings:
            return "gearshape"
        }
    }

    var title: String {
        switch self {
        case .home:
            return "Accueil"
        case .documents:
            return "Documents"
        case .assistant:
            return "Assistant"
        case .calendar:
            return "Calendrier"
        case .settings:
            return "Reglages"
        }
    }
}

/// Barre de navigation personnalisee
struct CustomTabBar: View {
    @Binding var selectedTab: TabItem
    var onTabSelected: ((TabItem) -> Void)?

    var body: some View {
        HStack(spacing: 0) {
            ForEach(TabItem.allCases) { tab in
                TabBarButton(
                    tab: tab,
                    isSelected: selectedTab == tab
                ) {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedTab = tab
                        onTabSelected?(tab)
                    }
                }
            }
        }
        .padding(.horizontal, AppDimensions.spacingS)
        .padding(.top, AppDimensions.spacingM)
        .padding(.bottom, AppDimensions.spacingL)
        .background(
            AppColors.backgroundSecondary
                .shadow(color: .black.opacity(0.3), radius: 10, x: 0, y: -5)
        )
    }
}

/// Bouton individuel de la tab bar
struct TabBarButton: View {
    let tab: TabItem
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: AppDimensions.spacingXS) {
                ZStack {
                    // Indicateur de selection
                    if isSelected {
                        Circle()
                            .fill(AppColors.accentPrimary.opacity(0.15))
                            .frame(width: 48, height: 48)
                    }

                    Image(systemName: isSelected ? tab.icon : tab.iconUnselected)
                        .font(.system(size: AppDimensions.tabBarIconSize, weight: isSelected ? .semibold : .regular))
                        .foregroundColor(isSelected ? AppColors.accentPrimary : AppColors.textSecondary)
                }
                .frame(height: 48)

                Text(tab.title)
                    .font(AppFonts.tabBarLabel)
                    .foregroundColor(isSelected ? AppColors.accentPrimary : AppColors.textSecondary)
            }
            .frame(maxWidth: .infinity)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

/// Version minimaliste de la tab bar (style maquette)
struct MinimalTabBar: View {
    @Binding var selectedTab: TabItem

    var body: some View {
        HStack(spacing: 0) {
            ForEach(TabItem.allCases) { tab in
                Button {
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                        selectedTab = tab
                    }
                } label: {
                    VStack(spacing: 6) {
                        Image(systemName: selectedTab == tab ? tab.icon : tab.iconUnselected)
                            .font(.system(size: 22, weight: selectedTab == tab ? .semibold : .regular))
                            .foregroundColor(selectedTab == tab ? AppColors.accentPrimary : AppColors.textSecondary)

                        // Point indicateur au lieu du texte
                        Circle()
                            .fill(selectedTab == tab ? AppColors.accentPrimary : Color.clear)
                            .frame(width: 5, height: 5)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, AppDimensions.spacingM)
                }
                .buttonStyle(PlainButtonStyle())
            }
        }
        .background(
            AppColors.backgroundSecondary
                .ignoresSafeArea(edges: .bottom)
        )
    }
}

// MARK: - Preview
#Preview("Custom Tab Bar") {
    VStack {
        Spacer()
        CustomTabBar(selectedTab: .constant(.home))
    }
    .background(AppColors.backgroundPrimary)
}

#Preview("Minimal Tab Bar") {
    VStack {
        Spacer()
        MinimalTabBar(selectedTab: .constant(.home))
    }
    .background(AppColors.backgroundPrimary)
}

#Preview("Tab Bar Interactive") {
    struct PreviewWrapper: View {
        @State private var selectedTab: TabItem = .home

        var body: some View {
            VStack {
                Text("Selected: \(selectedTab.title)")
                    .font(AppFonts.h2)
                    .foregroundColor(AppColors.textPrimary)

                Spacer()

                MinimalTabBar(selectedTab: $selectedTab)
            }
            .background(AppColors.backgroundPrimary)
        }
    }

    return PreviewWrapper()
}
