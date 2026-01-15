import SwiftUI

/// Composant avatar reutilisable avec placeholder
struct AvatarView: View {
    let imageURL: String?
    let size: CGFloat
    let initials: String
    var backgroundColor: Color
    var borderColor: Color?
    var borderWidth: CGFloat

    init(
        imageURL: String? = nil,
        size: CGFloat = AppDimensions.avatarSizeM,
        initials: String = "?",
        backgroundColor: Color = AppColors.accentPrimary,
        borderColor: Color? = nil,
        borderWidth: CGFloat = 2
    ) {
        self.imageURL = imageURL
        self.size = size
        self.initials = initials
        self.backgroundColor = backgroundColor
        self.borderColor = borderColor
        self.borderWidth = borderWidth
    }

    var body: some View {
        Group {
            if let url = imageURL, !url.isEmpty, let imageUrl = URL(string: url) {
                AsyncImage(url: imageUrl) { phase in
                    switch phase {
                    case .empty:
                        placeholderView
                            .overlay(
                                ProgressView()
                                    .tint(AppColors.textPrimary)
                            )
                    case .success(let image):
                        image
                            .resizable()
                            .aspectRatio(contentMode: .fill)
                    case .failure:
                        placeholderView
                    @unknown default:
                        placeholderView
                    }
                }
            } else {
                placeholderView
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(
            Circle()
                .stroke(borderColor ?? .clear, lineWidth: borderColor != nil ? borderWidth : 0)
        )
    }

    private var placeholderView: some View {
        ZStack {
            LinearGradient(
                colors: [
                    backgroundColor.opacity(0.8),
                    backgroundColor
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            Text(initials.prefix(2).uppercased())
                .font(.system(size: size * 0.4, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
        }
    }
}

/// Avatar avec badge de statut
struct AvatarWithBadge: View {
    let imageURL: String?
    let size: CGFloat
    let initials: String
    var badgeColor: Color
    var showBadge: Bool

    init(
        imageURL: String? = nil,
        size: CGFloat = AppDimensions.avatarSizeM,
        initials: String = "?",
        badgeColor: Color = AppColors.accentSuccess,
        showBadge: Bool = true
    ) {
        self.imageURL = imageURL
        self.size = size
        self.initials = initials
        self.badgeColor = badgeColor
        self.showBadge = showBadge
    }

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            AvatarView(
                imageURL: imageURL,
                size: size,
                initials: initials
            )

            if showBadge {
                Circle()
                    .fill(badgeColor)
                    .frame(width: size * 0.25, height: size * 0.25)
                    .overlay(
                        Circle()
                            .stroke(AppColors.backgroundPrimary, lineWidth: 2)
                    )
                    .offset(x: 2, y: 2)
            }
        }
    }
}

// MARK: - Preview
#Preview("Avatars") {
    VStack(spacing: 30) {
        HStack(spacing: 20) {
            AvatarView(size: AppDimensions.avatarSizeS, initials: "JB")
            AvatarView(size: AppDimensions.avatarSizeM, initials: "JB")
            AvatarView(size: AppDimensions.avatarSizeL, initials: "JB")
            AvatarView(size: AppDimensions.avatarSizeXL, initials: "JB")
        }

        HStack(spacing: 20) {
            AvatarView(
                size: AppDimensions.avatarSizeM,
                initials: "MD",
                backgroundColor: AppColors.accentSuccess
            )
            AvatarView(
                size: AppDimensions.avatarSizeM,
                initials: "PL",
                backgroundColor: AppColors.accentWarning
            )
            AvatarView(
                size: AppDimensions.avatarSizeM,
                initials: "XY",
                backgroundColor: AppColors.accentDanger
            )
        }

        HStack(spacing: 20) {
            AvatarWithBadge(
                size: AppDimensions.avatarSizeL,
                initials: "JB",
                badgeColor: AppColors.accentSuccess,
                showBadge: true
            )
            AvatarWithBadge(
                size: AppDimensions.avatarSizeL,
                initials: "MD",
                badgeColor: AppColors.accentWarning,
                showBadge: true
            )
        }
    }
    .padding()
    .background(AppColors.backgroundPrimary)
}
