import SwiftUI

/// Grille des cartes budget sur l'ecran d'accueil
struct BudgetCardsGridView: View {
    let budgets: [BudgetSummary]
    var onViewAllTap: (() -> Void)?
    var onBudgetTap: ((BudgetSummary) -> Void)?

    private let columns = [
        GridItem(.flexible(), spacing: AppDimensions.spacingM),
        GridItem(.flexible(), spacing: AppDimensions.spacingM)
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // Header de section
            sectionHeader

            // Grille 2x2
            LazyVGrid(columns: columns, spacing: AppDimensions.spacingM) {
                ForEach(budgets) { budget in
                    BudgetCardView(budget: budget) {
                        onBudgetTap?(budget)
                    }
                }
            }
        }
    }

    private var sectionHeader: some View {
        HStack {
            VStack(alignment: .leading, spacing: AppDimensions.spacingXXS) {
                Text("Budget investi")
                    .font(AppFonts.h3)
                    .foregroundColor(AppColors.textPrimary)

                Text("Depuis l'achat")
                    .font(AppFonts.small)
                    .foregroundColor(AppColors.textSecondary)
            }

            Spacer()

            Button(action: { onViewAllTap?() }) {
                HStack(spacing: AppDimensions.spacingXS) {
                    Text("Voir tout")
                        .font(AppFonts.captionMedium)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .medium))
                }
                .foregroundColor(AppColors.accentPrimary)
            }
        }
    }
}

/// Version avec periode selectionnable
struct BudgetCardsWithPeriod: View {
    let budgets: [BudgetSummary]
    @Binding var selectedPeriod: BudgetPeriod
    var onViewAllTap: (() -> Void)?

    enum BudgetPeriod: String, CaseIterable {
        case month = "Ce mois"
        case quarter = "3 mois"
        case halfYear = "6 mois"
        case year = "1 an"
        case total = "Total"
    }

    private let columns = [
        GridItem(.flexible(), spacing: AppDimensions.spacingM),
        GridItem(.flexible(), spacing: AppDimensions.spacingM)
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // Header avec titre
            HStack {
                Text("Budget investi")
                    .font(AppFonts.h3)
                    .foregroundColor(AppColors.textPrimary)

                Spacer()

                Button(action: { onViewAllTap?() }) {
                    HStack(spacing: AppDimensions.spacingXS) {
                        Text("Details")
                        Image(systemName: "chevron.right")
                            .font(.system(size: 12))
                    }
                    .font(AppFonts.captionMedium)
                    .foregroundColor(AppColors.accentPrimary)
                }
            }

            // Selecteur de periode
            periodSelector

            // Grille
            LazyVGrid(columns: columns, spacing: AppDimensions.spacingM) {
                ForEach(budgets) { budget in
                    BudgetCardView(budget: budget)
                }
            }
        }
    }

    private var periodSelector: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppDimensions.spacingS) {
                ForEach(BudgetPeriod.allCases, id: \.self) { period in
                    PeriodChip(
                        title: period.rawValue,
                        isSelected: selectedPeriod == period
                    ) {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedPeriod = period
                        }
                    }
                }
            }
        }
    }
}

/// Chip pour la selection de periode
struct PeriodChip: View {
    let title: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(AppFonts.captionMedium)
                .foregroundColor(isSelected ? AppColors.backgroundPrimary : AppColors.textSecondary)
                .padding(.horizontal, AppDimensions.spacingM)
                .padding(.vertical, AppDimensions.spacingS)
                .background(isSelected ? AppColors.accentPrimary : AppColors.backgroundSecondary)
                .clipShape(Capsule())
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

// MARK: - Preview
#Preview("Budget Cards Grid") {
    ScrollView {
        VStack(spacing: 30) {
            BudgetCardsGridView(budgets: BudgetSummary.mockData)

            Divider()
                .background(AppColors.separator)

            BudgetCardsWithPeriod(
                budgets: BudgetSummary.mockData,
                selectedPeriod: .constant(.total)
            )
        }
        .padding()
    }
    .background(AppColors.backgroundPrimary)
}
