import SwiftUI

/// Widget des prochaines echeances de maintenance
struct UpcomingMaintenanceView: View {
    let maintenances: [MaintenanceSchedule]
    var maxItems: Int = 3
    var onViewAllTap: (() -> Void)?
    var onMaintenanceTap: ((MaintenanceSchedule) -> Void)?

    var body: some View {
        VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
            // Header de section
            sectionHeader

            // Liste des echeances
            if maintenances.isEmpty {
                emptyState
            } else {
                VStack(spacing: AppDimensions.spacingS) {
                    ForEach(maintenances.prefix(maxItems)) { maintenance in
                        MaintenanceRowView(maintenance: maintenance) {
                            onMaintenanceTap?(maintenance)
                        }
                    }
                }
            }
        }
    }

    private var sectionHeader: some View {
        HStack {
            HStack(spacing: AppDimensions.spacingS) {
                Text("Prochaines echeances")
                    .font(AppFonts.h3)
                    .foregroundColor(AppColors.textPrimary)

                // Badge count si urgents
                let urgentCount = maintenances.filter { $0.urgency == .urgent || $0.urgency == .overdue }.count
                if urgentCount > 0 {
                    Text("\(urgentCount)")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(AppColors.accentDanger)
                        .clipShape(Capsule())
                }
            }

            Spacer()

            Button(action: { onViewAllTap?() }) {
                HStack(spacing: AppDimensions.spacingXS) {
                    Text("Calendrier")
                        .font(AppFonts.captionMedium)

                    Image(systemName: "chevron.right")
                        .font(.system(size: 12, weight: .medium))
                }
                .foregroundColor(AppColors.accentPrimary)
            }
        }
    }

    private var emptyState: some View {
        CardContainer(
            backgroundColor: AppColors.backgroundSecondary,
            cornerRadius: AppDimensions.cornerRadiusM
        ) {
            HStack(spacing: AppDimensions.spacingM) {
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 32))
                    .foregroundColor(AppColors.accentSuccess)

                VStack(alignment: .leading, spacing: AppDimensions.spacingXXS) {
                    Text("Tout est a jour !")
                        .font(AppFonts.bodyBold)
                        .foregroundColor(AppColors.textPrimary)

                    Text("Aucune maintenance prevue prochainement")
                        .font(AppFonts.caption)
                        .foregroundColor(AppColors.textSecondary)
                }

                Spacer()
            }
        }
    }
}

/// Ligne individuelle d'une echeance de maintenance
struct MaintenanceRowView: View {
    let maintenance: MaintenanceSchedule
    var onTap: (() -> Void)?

    var body: some View {
        Button(action: { onTap?() }) {
            CardContainer(
                backgroundColor: AppColors.backgroundSecondary,
                cornerRadius: AppDimensions.cornerRadiusM,
                padding: AppDimensions.spacingM
            ) {
                HStack(spacing: AppDimensions.spacingM) {
                    // Indicateur d'urgence avec icone de categorie
                    ZStack {
                        Circle()
                            .fill(maintenance.urgency.color.opacity(0.15))
                            .frame(width: 44, height: 44)

                        Image(systemName: maintenance.category.icon)
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(maintenance.urgency.color)
                    }

                    // Infos
                    VStack(alignment: .leading, spacing: AppDimensions.spacingXXS) {
                        Text(maintenance.title)
                            .font(AppFonts.bodyBold)
                            .foregroundColor(AppColors.textPrimary)
                            .lineLimit(1)

                        HStack(spacing: AppDimensions.spacingS) {
                            // Date relative
                            Text(maintenance.relativeDueDate)
                                .font(AppFonts.caption)
                                .foregroundColor(maintenance.urgency.color)

                            // Kilometrage si applicable
                            if let mileage = maintenance.formattedDueMileage {
                                Text("•")
                                    .foregroundColor(AppColors.textTertiary)

                                Text(mileage)
                                    .font(AppFonts.caption)
                                    .foregroundColor(AppColors.textSecondary)
                            }
                        }
                    }

                    Spacer()

                    // Cout estime + chevron
                    VStack(alignment: .trailing, spacing: AppDimensions.spacingXXS) {
                        if let cost = maintenance.formattedEstimatedCost {
                            Text(cost)
                                .font(AppFonts.captionMedium)
                                .foregroundColor(AppColors.textSecondary)
                        }

                        Image(systemName: "chevron.right")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(AppColors.textTertiary)
                    }
                }
            }
        }
        .buttonStyle(CardButtonStyle())
    }
}

/// Version compacte pour widget
struct MaintenanceRowCompact: View {
    let maintenance: MaintenanceSchedule

    var body: some View {
        HStack(spacing: AppDimensions.spacingM) {
            // Indicateur urgence
            Circle()
                .fill(maintenance.urgency.color)
                .frame(width: AppDimensions.urgencyIndicatorSize, height: AppDimensions.urgencyIndicatorSize)

            // Titre
            Text(maintenance.title)
                .font(AppFonts.caption)
                .foregroundColor(AppColors.textPrimary)
                .lineLimit(1)

            Spacer()

            // Date
            Text(maintenance.relativeDueDate)
                .font(AppFonts.small)
                .foregroundColor(maintenance.urgency.color)
        }
        .padding(.vertical, AppDimensions.spacingXS)
    }
}

// MARK: - Preview
#Preview("Upcoming Maintenance") {
    ScrollView {
        VStack(spacing: 30) {
            UpcomingMaintenanceView(maintenances: MaintenanceSchedule.mockData)

            Divider()
                .background(AppColors.separator)

            // Avec echeance en retard
            UpcomingMaintenanceView(
                maintenances: [MaintenanceSchedule.mockOverdue] + MaintenanceSchedule.mockData
            )

            Divider()
                .background(AppColors.separator)

            // Etat vide
            UpcomingMaintenanceView(maintenances: [])
        }
        .padding()
    }
    .background(AppColors.backgroundPrimary)
}
