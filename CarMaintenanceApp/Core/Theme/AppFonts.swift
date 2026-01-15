import SwiftUI

/// Design System - Typographie
/// Reference: PRD Section 6.1 - SF Pro Display/Text
struct AppFonts {
    // MARK: - Headlines
    static let h1 = Font.system(size: 28, weight: .bold, design: .default)
    static let h2 = Font.system(size: 22, weight: .semibold, design: .default)
    static let h3 = Font.system(size: 18, weight: .semibold, design: .default)

    // MARK: - Body
    static let body = Font.system(size: 16, weight: .regular, design: .default)
    static let bodyMedium = Font.system(size: 16, weight: .medium, design: .default)
    static let bodyBold = Font.system(size: 16, weight: .semibold, design: .default)

    // MARK: - Caption & Small
    static let caption = Font.system(size: 14, weight: .regular, design: .default)
    static let captionMedium = Font.system(size: 14, weight: .medium, design: .default)
    static let small = Font.system(size: 12, weight: .regular, design: .default)
    static let smallMedium = Font.system(size: 12, weight: .medium, design: .default)

    // MARK: - Special Purpose
    static let welcomeText = Font.system(size: 14, weight: .regular, design: .default)
    static let userName = Font.system(size: 20, weight: .semibold, design: .default)
    static let vehicleName = Font.system(size: 24, weight: .bold, design: .default)
    static let vehicleSubtitle = Font.system(size: 14, weight: .medium, design: .default)

    // MARK: - Numbers & Stats
    static let budgetAmount = Font.system(size: 24, weight: .bold, design: .rounded)
    static let budgetAmountSmall = Font.system(size: 20, weight: .bold, design: .rounded)
    static let statValue = Font.system(size: 32, weight: .bold, design: .rounded)
    static let statLabel = Font.system(size: 12, weight: .medium, design: .default)

    // MARK: - Buttons
    static let buttonLarge = Font.system(size: 16, weight: .semibold, design: .default)
    static let buttonMedium = Font.system(size: 14, weight: .semibold, design: .default)
    static let buttonSmall = Font.system(size: 12, weight: .semibold, design: .default)

    // MARK: - Tab Bar
    static let tabBarLabel = Font.system(size: 10, weight: .medium, design: .default)
}

// MARK: - Preview
#Preview("Typography") {
    ScrollView {
        VStack(alignment: .leading, spacing: 16) {
            Group {
                Text("Headlines")
                    .font(AppFonts.caption)
                    .foregroundColor(AppColors.textSecondary)

                Text("Heading 1 - 28pt Bold")
                    .font(AppFonts.h1)
                    .foregroundColor(AppColors.textPrimary)

                Text("Heading 2 - 22pt Semibold")
                    .font(AppFonts.h2)
                    .foregroundColor(AppColors.textPrimary)

                Text("Heading 3 - 18pt Semibold")
                    .font(AppFonts.h3)
                    .foregroundColor(AppColors.textPrimary)
            }

            Divider()
                .background(AppColors.separator)

            Group {
                Text("Body")
                    .font(AppFonts.caption)
                    .foregroundColor(AppColors.textSecondary)

                Text("Body Regular - 16pt")
                    .font(AppFonts.body)
                    .foregroundColor(AppColors.textPrimary)

                Text("Body Bold - 16pt Semibold")
                    .font(AppFonts.bodyBold)
                    .foregroundColor(AppColors.textPrimary)

                Text("Caption - 14pt Regular")
                    .font(AppFonts.caption)
                    .foregroundColor(AppColors.textSecondary)

                Text("Small - 12pt Regular")
                    .font(AppFonts.small)
                    .foregroundColor(AppColors.textTertiary)
            }

            Divider()
                .background(AppColors.separator)

            Group {
                Text("Special")
                    .font(AppFonts.caption)
                    .foregroundColor(AppColors.textSecondary)

                Text("3 245,50 EUR")
                    .font(AppFonts.budgetAmount)
                    .foregroundColor(AppColors.textPrimary)

                Text("Tesla Model 3")
                    .font(AppFonts.vehicleName)
                    .foregroundColor(AppColors.textPrimary)
            }
        }
        .padding()
    }
    .background(AppColors.backgroundPrimary)
}
