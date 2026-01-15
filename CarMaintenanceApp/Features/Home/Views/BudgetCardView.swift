import SwiftUI

/// Card individuelle pour afficher un budget par categorie
struct BudgetCardView: View {
    let budget: BudgetSummary
    var onTap: (() -> Void)?

    var body: some View {
        Button(action: { onTap?() }) {
            CardContainer(
                backgroundColor: AppColors.backgroundSecondary,
                cornerRadius: AppDimensions.cornerRadiusM,
                padding: AppDimensions.spacingM
            ) {
                VStack(alignment: .leading, spacing: AppDimensions.spacingS) {
                    // Header: Icone + Trend
                    HStack {
                        // Icone de categorie
                        Image(systemName: budget.category.icon)
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(budget.category.color)
                            .frame(width: 32, height: 32)
                            .background(budget.category.color.opacity(0.15))
                            .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusS))

                        Spacer()

                        // Indicateur de tendance
                        if let trendText = budget.trendText {
                            TrendBadge(
                                text: trendText,
                                color: budget.trendColor
                            )
                        }
                    }

                    Spacer()

                    // Titre categorie
                    Text(budget.category.rawValue)
                        .font(AppFonts.caption)
                        .foregroundColor(AppColors.textSecondary)
                        .lineLimit(1)

                    // Montant
                    Text(budget.formattedAmount)
                        .font(AppFonts.budgetAmountSmall)
                        .foregroundColor(AppColors.textPrimary)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                }
            }
            .frame(height: AppDimensions.budgetCardHeight)
        }
        .buttonStyle(CardButtonStyle())
    }
}

/// Badge pour afficher la tendance
struct TrendBadge: View {
    let text: String
    let color: Color

    var body: some View {
        HStack(spacing: 2) {
            Image(systemName: text.hasPrefix("+") ? "arrow.up.right" : "arrow.down.right")
                .font(.system(size: 8, weight: .bold))

            Text(text)
                .font(.system(size: 10, weight: .semibold))
        }
        .foregroundColor(color)
        .padding(.horizontal, 6)
        .padding(.vertical, 3)
        .background(color.opacity(0.15))
        .clipShape(Capsule())
    }
}

/// Version compacte de la card budget
struct BudgetCardCompact: View {
    let budget: BudgetSummary

    var body: some View {
        HStack(spacing: AppDimensions.spacingM) {
            // Icone
            Image(systemName: budget.category.icon)
                .font(.system(size: 16, weight: .medium))
                .foregroundColor(budget.category.color)
                .frame(width: 36, height: 36)
                .background(budget.category.color.opacity(0.15))
                .clipShape(Circle())

            // Texte
            VStack(alignment: .leading, spacing: 2) {
                Text(budget.category.rawValue)
                    .font(AppFonts.caption)
                    .foregroundColor(AppColors.textSecondary)

                Text(budget.formattedAmount)
                    .font(AppFonts.bodyBold)
                    .foregroundColor(AppColors.textPrimary)
            }

            Spacer()

            // Trend
            if let trendText = budget.trendText {
                TrendBadge(text: trendText, color: budget.trendColor)
            }
        }
        .padding(AppDimensions.spacingM)
        .background(AppColors.backgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: AppDimensions.cornerRadiusM))
    }
}

// MARK: - Preview
#Preview("Budget Cards") {
    ScrollView {
        VStack(spacing: 20) {
            Text("Grid Layout")
                .font(AppFonts.h3)
                .foregroundColor(AppColors.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            LazyVGrid(
                columns: [
                    GridItem(.flexible(), spacing: AppDimensions.spacingM),
                    GridItem(.flexible(), spacing: AppDimensions.spacingM)
                ],
                spacing: AppDimensions.spacingM
            ) {
                ForEach(BudgetSummary.mockData) { budget in
                    BudgetCardView(budget: budget)
                }
            }

            Divider()
                .background(AppColors.separator)
                .padding(.vertical)

            Text("Compact Layout")
                .font(AppFonts.h3)
                .foregroundColor(AppColors.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)

            VStack(spacing: AppDimensions.spacingS) {
                ForEach(BudgetSummary.mockData) { budget in
                    BudgetCardCompact(budget: budget)
                }
            }
        }
        .padding()
    }
    .background(AppColors.backgroundPrimary)
}
