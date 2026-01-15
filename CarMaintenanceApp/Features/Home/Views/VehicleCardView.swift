import SwiftUI

/// Carte hero du vehicule sur l'ecran d'accueil
struct VehicleCardView: View {
    let vehicle: Vehicle
    var onTap: (() -> Void)?
    var onEditTap: (() -> Void)?
    var onQuickAction: ((QuickAction) -> Void)?

    enum QuickAction {
        case details
        case mileage
        case more
    }

    var body: some View {
        Button(action: { onTap?() }) {
            GradientCardContainer(
                gradient: AppColors.vehicleCardGradient,
                cornerRadius: AppDimensions.cornerRadiusXL,
                padding: AppDimensions.spacingL
            ) {
                VStack(alignment: .leading, spacing: AppDimensions.spacingM) {
                    // Header: Nom + Edit
                    headerSection

                    // Image du vehicule
                    vehicleImageSection

                    // Boutons d'action rapide
                    quickActionsSection
                }
            }
            .frame(height: AppDimensions.vehicleCardHeight)
        }
        .buttonStyle(CardButtonStyle())
    }

    // MARK: - Header Section
    private var headerSection: some View {
        HStack(alignment: .top) {
            VStack(alignment: .leading, spacing: AppDimensions.spacingXS) {
                Text(vehicle.displayName)
                    .font(AppFonts.vehicleName)
                    .foregroundColor(AppColors.textPrimary)

                HStack(spacing: AppDimensions.spacingS) {
                    // Type d'energie avec icone
                    Label {
                        Text(vehicle.fuelType.rawValue)
                    } icon: {
                        Image(systemName: vehicle.fuelType.icon)
                    }
                    .font(AppFonts.vehicleSubtitle)
                    .foregroundColor(vehicle.fuelType.color)

                    Text("•")
                        .foregroundColor(AppColors.textSecondary)

                    // Kilometrage
                    Text(vehicle.formattedMileage)
                        .font(AppFonts.vehicleSubtitle)
                        .foregroundColor(AppColors.textSecondary)
                }
            }

            Spacer()

            // Bouton edit
            Button(action: { onEditTap?() }) {
                Image(systemName: "pencil")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(AppColors.textSecondary)
                    .padding(AppDimensions.spacingS)
                    .background(AppColors.backgroundSecondary.opacity(0.5))
                    .clipShape(Circle())
            }
            .buttonStyle(ScaleButtonStyle())
        }
    }

    // MARK: - Vehicle Image Section
    private var vehicleImageSection: some View {
        HStack {
            Spacer()
            vehicleImage
            Spacer()
        }
        .frame(height: AppDimensions.vehicleImageHeight)
    }

    @ViewBuilder
    private var vehicleImage: some View {
        if let url = vehicle.photoURL, !url.isEmpty, let imageUrl = URL(string: url) {
            AsyncImage(url: imageUrl) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                case .failure, .empty:
                    vehiclePlaceholder
                @unknown default:
                    vehiclePlaceholder
                }
            }
        } else {
            vehiclePlaceholder
        }
    }

    private var vehiclePlaceholder: some View {
        Image(systemName: "car.side.fill")
            .font(.system(size: 70, weight: .light))
            .foregroundStyle(
                LinearGradient(
                    colors: [AppColors.accentPrimary.opacity(0.6), AppColors.accentPrimary.opacity(0.3)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            )
    }

    // MARK: - Quick Actions Section
    private var quickActionsSection: some View {
        HStack(spacing: AppDimensions.spacingM) {
            // Bouton Details
            QuickActionButton(
                title: "Details",
                icon: "info.circle.fill",
                style: .primary
            ) {
                onQuickAction?(.details)
            }

            // Bouton Kilometrage
            QuickActionButton(
                title: "Kilometrage",
                icon: "speedometer",
                style: .secondary
            ) {
                onQuickAction?(.mileage)
            }

            Spacer()

            // Bouton More
            Button(action: { onQuickAction?(.more) }) {
                Image(systemName: "ellipsis")
                    .font(.system(size: 18, weight: .medium))
                    .foregroundColor(AppColors.textSecondary)
                    .padding(AppDimensions.spacingS)
                    .background(AppColors.backgroundSecondary.opacity(0.5))
                    .clipShape(Circle())
            }
            .buttonStyle(ScaleButtonStyle())
        }
    }
}

/// Bouton d'action rapide
struct QuickActionButton: View {
    let title: String
    let icon: String
    var style: Style = .secondary
    var action: (() -> Void)?

    enum Style {
        case primary
        case secondary

        var backgroundColor: Color {
            switch self {
            case .primary:
                return AppColors.accentPrimary
            case .secondary:
                return AppColors.backgroundSecondary.opacity(0.6)
            }
        }

        var foregroundColor: Color {
            switch self {
            case .primary:
                return AppColors.backgroundPrimary
            case .secondary:
                return AppColors.textPrimary
            }
        }
    }

    var body: some View {
        Button(action: { action?() }) {
            HStack(spacing: AppDimensions.spacingS) {
                Image(systemName: icon)
                    .font(.system(size: 12, weight: .semibold))

                Text(title)
                    .font(AppFonts.buttonSmall)
            }
            .foregroundColor(style.foregroundColor)
            .padding(.horizontal, AppDimensions.spacingM)
            .padding(.vertical, AppDimensions.spacingS)
            .background(style.backgroundColor)
            .clipShape(Capsule())
        }
        .buttonStyle(ScaleButtonStyle())
    }
}

/// Style de bouton pour les cartes
struct CardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.98 : 1.0)
            .animation(.easeInOut(duration: 0.15), value: configuration.isPressed)
    }
}

// MARK: - Preview
#Preview("Vehicle Card") {
    ScrollView {
        VStack(spacing: 20) {
            VehicleCardView(vehicle: .mock)

            VehicleCardView(vehicle: .mockDiesel)

            VehicleCardView(vehicle: .mockHybrid)
        }
        .padding()
    }
    .background(AppColors.backgroundPrimary)
}
