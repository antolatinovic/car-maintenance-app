import SwiftUI

/// Header de l'ecran d'accueil avec avatar et notification
struct HomeHeaderView: View {
    let user: User
    var hasNotifications: Bool = true
    var notificationCount: Int = 0
    var onNotificationTap: (() -> Void)?

    var body: some View {
        HStack(alignment: .center, spacing: AppDimensions.spacingM) {
            // Avatar + Texte de bienvenue
            HStack(spacing: AppDimensions.spacingM) {
                AvatarView(
                    imageURL: user.avatarURL,
                    size: AppDimensions.avatarSizeM,
                    initials: user.initials,
                    backgroundColor: AppColors.accentPrimary
                )

                VStack(alignment: .leading, spacing: AppDimensions.spacingXXS) {
                    Text("Welcome Back!")
                        .font(AppFonts.welcomeText)
                        .foregroundColor(AppColors.textSecondary)

                    Text(user.fullName)
                        .font(AppFonts.userName)
                        .foregroundColor(AppColors.textPrimary)
                }
            }

            Spacer()

            // Bouton notification
            NotificationButton(
                hasNotifications: hasNotifications,
                count: notificationCount,
                action: onNotificationTap
            )
        }
        .padding(.horizontal, AppDimensions.screenPaddingHorizontal)
        .padding(.vertical, AppDimensions.spacingM)
    }
}

/// Bouton de notification avec badge
struct NotificationButton: View {
    var hasNotifications: Bool = false
    var count: Int = 0
    var action: (() -> Void)?

    var body: some View {
        Button(action: { action?() }) {
            ZStack(alignment: .topTrailing) {
                // Fond du bouton
                Circle()
                    .fill(AppColors.backgroundSecondary)
                    .frame(width: 44, height: 44)

                // Icone
                Image(systemName: hasNotifications ? "bell.badge.fill" : "bell.fill")
                    .font(.system(size: 20, weight: .medium))
                    .foregroundColor(AppColors.textPrimary)
                    .frame(width: 44, height: 44)

                // Badge avec nombre
                if count > 0 {
                    Text(count > 99 ? "99+" : "\(count)")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 5)
                        .padding(.vertical, 2)
                        .background(AppColors.accentDanger)
                        .clipShape(Capsule())
                        .offset(x: 8, y: -4)
                } else if hasNotifications {
                    // Point simple si pas de nombre
                    Circle()
                        .fill(AppColors.accentSuccess)
                        .frame(width: AppDimensions.notificationBadgeSize, height: AppDimensions.notificationBadgeSize)
                        .overlay(
                            Circle()
                                .stroke(AppColors.backgroundPrimary, lineWidth: 2)
                        )
                        .offset(x: 4, y: -2)
                }
            }
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

/// Style de bouton avec effet de scale
struct ScaleButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.95 : 1.0)
            .animation(.easeInOut(duration: 0.1), value: configuration.isPressed)
    }
}

// MARK: - Preview
#Preview("Home Header") {
    VStack {
        HomeHeaderView(
            user: .mock,
            hasNotifications: true,
            notificationCount: 3
        )

        Divider()
            .background(AppColors.separator)

        HomeHeaderView(
            user: .mock,
            hasNotifications: true,
            notificationCount: 0
        )

        Divider()
            .background(AppColors.separator)

        HomeHeaderView(
            user: .mock,
            hasNotifications: false
        )

        Spacer()
    }
    .background(AppColors.backgroundPrimary)
}
