import Foundation

/// Design System - Dimensions et espacements
/// Reference: PRD Section 6.2
struct AppDimensions {
    // MARK: - Spacing
    static let spacingXXS: CGFloat = 2
    static let spacingXS: CGFloat = 4
    static let spacingS: CGFloat = 8
    static let spacingM: CGFloat = 16
    static let spacingL: CGFloat = 24
    static let spacingXL: CGFloat = 32
    static let spacingXXL: CGFloat = 48

    // MARK: - Corner Radius
    static let cornerRadiusXS: CGFloat = 4
    static let cornerRadiusS: CGFloat = 8
    static let cornerRadiusM: CGFloat = 12
    static let cornerRadiusL: CGFloat = 16
    static let cornerRadiusXL: CGFloat = 20
    static let cornerRadiusXXL: CGFloat = 24
    static let cornerRadiusFull: CGFloat = 9999

    // MARK: - Card Dimensions
    static let cardPadding: CGFloat = 16
    static let cardShadowRadius: CGFloat = 8
    static let cardShadowOpacity: CGFloat = 0.3

    // MARK: - Avatar Sizes
    static let avatarSizeXS: CGFloat = 24
    static let avatarSizeS: CGFloat = 32
    static let avatarSizeM: CGFloat = 48
    static let avatarSizeL: CGFloat = 64
    static let avatarSizeXL: CGFloat = 80

    // MARK: - Icon Sizes
    static let iconSizeS: CGFloat = 16
    static let iconSizeM: CGFloat = 20
    static let iconSizeL: CGFloat = 24
    static let iconSizeXL: CGFloat = 32

    // MARK: - Button Heights
    static let buttonHeightS: CGFloat = 32
    static let buttonHeightM: CGFloat = 44
    static let buttonHeightL: CGFloat = 52

    // MARK: - Specific Components

    /// Bottom Tab Bar
    static let tabBarHeight: CGFloat = 80
    static let tabBarIconSize: CGFloat = 24

    /// Vehicle Card (Hero)
    static let vehicleCardHeight: CGFloat = 200
    static let vehicleCardMinHeight: CGFloat = 180
    static let vehicleImageHeight: CGFloat = 100

    /// Budget Cards
    static let budgetCardHeight: CGFloat = 110
    static let budgetCardMinWidth: CGFloat = 150

    /// Maintenance Row
    static let maintenanceRowHeight: CGFloat = 72
    static let urgencyIndicatorSize: CGFloat = 10

    /// Header
    static let headerHeight: CGFloat = 60
    static let notificationBadgeSize: CGFloat = 10

    // MARK: - Screen Padding
    static let screenPaddingHorizontal: CGFloat = 16
    static let screenPaddingVertical: CGFloat = 12

    // MARK: - Safe Area
    static let bottomSafeAreaPadding: CGFloat = 34
}
